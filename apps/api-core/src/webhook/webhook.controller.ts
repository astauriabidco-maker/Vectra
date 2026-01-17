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

        let from: string, text: string, name: string;

        // Detect Twilio vs JSON
        if (payload.Body) {
            // Twilio Payload
            text = payload.Body;
            from = payload.From;
            name = payload.ProfileName || 'Unknown';
        } else {
            // JSON Payload (Legacy/Test)
            from = payload.from;
            text = payload.text;
            name = payload.name;
        }

        console.log(`Parsed Webhook: From=${from}, Text=${text}, Name=${name}`);

        // 1. Find or Create Contact by Identity
        let identity = await this.prisma.contactIdentity.findFirst({
            where: {
                type: 'WHATSAPP',
                identifier: from,
            },
            include: {
                contact: true,
            },
        });

        let contact;

        if (identity) {
            contact = identity.contact;
            // Update contact attributes (UPSERT behavior)
            await this.prisma.contact.update({
                where: { id: contact.id },
                data: {
                    attributes: {
                        ...(contact.attributes as object),
                        name: name
                    }
                }
            });
        } else {
            // Create new Contact and Identity
            contact = await this.prisma.contact.create({
                data: {
                    organization: {
                        create: {
                            name: 'Default Org' // Creating default org if not exists logic is tricky here, assuming simplified approach
                        }
                    },
                    identities: {
                        create: {
                            type: 'WHATSAPP',
                            identifier: from,
                            isPrimary: true,
                        },
                    },
                    attributes: {
                        name: name
                    }
                },
            });
        }

        // 2. Find or Create Customer by Phone (Phone-First CRM)
        const cleanPhone = from.replace('whatsapp:', ''); // Remove WhatsApp prefix if present
        let customer = await this.prisma.customer.findUnique({
            where: { phone: cleanPhone },
        });

        if (!customer) {
            // Create new Customer with phone as primary identifier
            customer = await this.prisma.customer.create({
                data: {
                    phone: cleanPhone,
                    name: name !== 'Unknown' ? name : `Visitor ${cleanPhone}`,
                    // email is optional, will be null for WhatsApp-first customers
                },
            });
            console.log(`✅ Created new Customer: ${customer.id} (${cleanPhone})`);
        } else {
            // Update name if we have a better one from WhatsApp profile
            if (name && name !== 'Unknown' && !customer.name) {
                await this.prisma.customer.update({
                    where: { id: customer.id },
                    data: { name: name },
                });
            }
            console.log(`✅ Found existing Customer: ${customer.id}`);
        }

        // 3. Find or Create Conversation (active)
        let conversation = await this.prisma.conversation.findFirst({
            where: {
                contactId: contact.id,
                status: 'OPEN',
            },
        });

        if (!conversation) {
            conversation = await this.prisma.conversation.create({
                data: {
                    contactId: contact.id,
                    status: 'OPEN',
                },
            });
        }

        // 3. Create Message & Update Conversation Timestamp
        const [message] = await this.prisma.$transaction([
            this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderType: 'USER',
                    contentText: text,
                    contentPayload: payload,
                },
            }),
            this.prisma.conversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() }
            })
        ]);

        // 4. Push to Redis for AI Worker (ONLY if AI is ON)
        if (conversation.aiStatus === 'ON') {
            await this.redisHelper.pushJob('vectra_ai_queue', {
                messageId: message.id,
                contactId: contact.id,
                conversationId: conversation.id,
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
        } else {
            console.log(`⚠️ Skipping AI for conversation ${conversation.id} (Status: ${conversation.aiStatus})`);
        }

        // 5. Publish Real-Time Event
        const redisPub = new (require('ioredis'))({ host: 'localhost', port: 6399 });
        console.log('📢 Publishing event to vectra_events...');
        await redisPub.publish('vectra_events', JSON.stringify({ type: 'message_received', data: message }));
        redisPub.disconnect();
        console.log('✅ Event published to vectra_events');

        return { status: 'received' };
    }
}
