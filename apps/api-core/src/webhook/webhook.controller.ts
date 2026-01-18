import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AiService } from '../ai/ai.service';

@Controller('webhooks')
export class WebhookController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redisHelper: RedisService,
        private readonly aiService: AiService,
    ) { }

    @Post('whatsapp')
    @HttpCode(HttpStatus.OK)
    async handleWhatsappWebhook(@Body() payload: any) {
        console.log('Incoming Payload:', JSON.stringify(payload));

        let from: string, to: string, text: string, name: string;

        // Detect Twilio vs JSON
        if (payload.Body) {
            // Twilio Payload
            text = payload.Body;
            from = payload.From;
            to = payload.To;
            name = payload.ProfileName || 'Unknown';
        } else {
            // JSON Payload (Legacy/Test)
            from = payload.from;
            to = payload.to || '';
            text = payload.text;
            name = payload.name;
        }

        console.log(`Parsed Webhook: From=${from}, To=${to}, Text=${text}, Name=${name}`);

        // =====================================================
        // STEP 0: Resolve Workspace by Twilio Phone Number (Multi-Tenancy)
        // =====================================================
        const cleanToNumber = to?.replace('whatsapp:', '') || '';
        const workspace = await this.prisma.workspace.findUnique({
            where: { twilioPhoneNumber: cleanToNumber },
        });

        if (!workspace) {
            console.error(`❌ No workspace found for Twilio number: ${cleanToNumber}`);
            // Fallback: Try to find any workspace (dev mode)
            const fallbackWorkspace = await this.prisma.workspace.findFirst();
            if (!fallbackWorkspace) {
                console.error('❌ No workspaces exist in database. Create one first.');
                return { status: 'ignored', reason: 'no_workspace' };
            }
            console.warn(`⚠️ Using fallback workspace: ${fallbackWorkspace.name}`);
            return this.processMessage(fallbackWorkspace.id, from, text, name, payload);
        }

        console.log(`✅ Resolved Workspace: ${workspace.name} (ID: ${workspace.id})`);
        return this.processMessage(workspace.id, from, text, name, payload);
    }

    /**
     * Core message processing logic scoped to a workspace
     */
    private async processMessage(
        workspaceId: string,
        from: string,
        text: string,
        name: string,
        payload: any
    ) {
        const profileName = name;
        const waId = from.replace('whatsapp:', '');
        const body = text;

        // 1. Find or Create Contact & Identity (Workspace Scoped)
        let contact = await this.prisma.contact.findFirst({
            where: {
                workspaceId: workspaceId,
                identities: {
                    some: {
                        workspaceId: workspaceId,
                        identifier: from,
                        type: 'WHATSAPP',
                    },
                },
            },
            include: { identities: true },
        });

        if (!contact) {
            console.log(`🆕 Creating new Contact for ${from} in workspace ${workspaceId}`);
            contact = await this.prisma.contact.create({
                data: {
                    workspaceId: workspaceId,
                    attributes: { name: profileName },
                    identities: {
                        create: {
                            workspaceId: workspaceId,
                            type: 'WHATSAPP',
                            identifier: from,
                            isPrimary: true,
                        },
                    },
                },
                include: { identities: true },
            });
        } else {
            // Update contact attributes
            await this.prisma.contact.update({
                where: { id: contact.id },
                data: {
                    attributes: {
                        ...(contact.attributes as object || {}),
                        name: profileName
                    }
                }
            });
        }

        // 2. Find or Create Customer (Workspace Scoped)
        let customer = await this.prisma.customer.findFirst({
            where: {
                workspaceId: workspaceId,
                phone: waId,
            },
        });

        if (!customer) {
            console.log(`🆕 Creating new Customer for ${waId} in workspace ${workspaceId}`);
            customer = await this.prisma.customer.create({
                data: {
                    workspaceId: workspaceId,
                    phone: waId,
                    name: profileName !== 'Unknown' ? profileName : `Visitor ${waId}`,
                },
            });
        } else if (profileName && profileName !== 'Unknown' && !customer.name) {
            await this.prisma.customer.update({
                where: { id: customer.id },
                data: { name: profileName },
            });
        }

        // 3. Find or Create Conversation (Workspace Scoped)
        let conversation = await this.prisma.conversation.findFirst({
            where: {
                workspaceId: workspaceId,
                contactId: contact.id,
                status: 'OPEN',
            },
        });

        if (!conversation) {
            console.log(`🆕 Creating new Conversation for contact ${contact.id}`);
            conversation = await this.prisma.conversation.create({
                data: {
                    workspaceId: workspaceId,
                    contactId: contact.id,
                    status: 'OPEN',
                    aiStatus: 'ON',
                },
            });
        }

        // 4. Save Message & Update Conversation (Transaction)
        const [message] = await this.prisma.$transaction([
            this.prisma.message.create({
                data: {
                    workspaceId: workspaceId,
                    conversationId: conversation.id,
                    senderType: 'USER',
                    contentText: body,
                    contentPayload: payload as any,
                },
            }),
            this.prisma.conversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() }
            })
        ]);

        // 5. Push to Redis for AI Worker (ONLY if AI is ON)
        if (conversation.aiStatus === 'ON') {
            await this.redisHelper.pushJob('vectra_ai_queue', {
                messageId: message.id,
                contactId: contact.id,
                conversationId: conversation.id,
                workspaceId: workspaceId,
                text: text,
                userPhone: from,
            });
            console.log('✅ Job sent to Redis for AI');

            // Trigger AI Copilot suggestion (async, non-blocking)
            this.aiService.generateSuggestion(conversation.id, message.id)
                .then(suggestion => {
                    if (suggestion) console.log('✨ AI suggestion generated');
                })
                .catch(err => console.error('AI suggestion error:', err));
        }

        // 6. Publish Real-Time Event
        console.log('📢 Publishing event to vectra_events...');
        await this.redisHelper.publishEvent('vectra_events', {
            type: 'message_received',
            workspaceId: workspaceId,
            data: message
        });

        return { status: 'received', workspaceId };
    }
}
