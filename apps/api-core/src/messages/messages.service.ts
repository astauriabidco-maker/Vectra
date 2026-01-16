import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import twilio from 'twilio';

@Injectable()
export class MessagesService {
    private twilioClient: any;

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) {
        this.twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN,
        );
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
                conversationId,
                senderType: 'AGENT',
                contentText: text,
            },
        });

        // 3. Send WhatsApp message via Twilio
        try {
            await this.twilioClient.messages.create({
                from: process.env.TWILIO_PHONE_NUMBER,
                to: to,
                body: text,
            });
            console.log(`✅ Message sent to ${to} via Twilio`);
        } catch (error) {
            console.error('❌ Twilio send error:', error);
            // We still saved the message in the DB, but maybe we should mark it as failed? 
            // For now, let's just log it.
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
