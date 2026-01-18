import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { IntegrationsService } from '../integrations/integrations.service';
import twilio from 'twilio';

@Injectable()
export class MessagesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
        private readonly integrationsService: IntegrationsService,
    ) { }

    /**
     * Get Twilio client with credentials from DB or fallback to env
     */
    private async getTwilioClient(workspaceId: string) {
        const credentials = await this.integrationsService.getTwilioCredentials(workspaceId);
        return twilio(credentials.accountSid, credentials.authToken);
    }

    async sendMessage(conversationId: string, text: string) {
        // 1. Get conversation and contact phone number
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                contact: {
                    include: {
                        identities: {
                            where: { type: 'WHATSAPP' },
                        },
                    },
                },
            },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        const whatsappIdentity = conversation.contact.identities.find(
            (id) => id.type === 'WHATSAPP',
        );

        if (!whatsappIdentity) {
            throw new NotFoundException('Contact has no WhatsApp identity');
        }

        const to = whatsappIdentity.identifier;

        // 2. Save message as AGENT
        const message = await this.prisma.message.create({
            data: {
                workspaceId: conversation.workspaceId,
                conversationId,
                senderType: 'AGENT',
                contentText: text,
            },
        });

        // 3. Send WhatsApp message via Twilio (using DB credentials or env fallback)
        try {
            const credentials = await this.integrationsService.getTwilioCredentials(conversation.workspaceId);
            const twilioClient = twilio(credentials.accountSid, credentials.authToken);

            await twilioClient.messages.create({
                from: credentials.phoneNumber,
                to: to,
                body: text,
            });
            console.log(`✅ Message sent to ${to} via Twilio workspace ${conversation.workspaceId}`);
        } catch (error) {
            console.error('❌ Twilio send error:', error);
            // Message is saved in DB, but Twilio send failed
        }

        // 4. Update conversation updatedAt
        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        // 5. Emit real-time event
        await this.redisService.publishEvent('vectra_events', {
            type: 'message_received',
            data: message,
        });

        return message;
    }
}
