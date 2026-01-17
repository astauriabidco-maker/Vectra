import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebhookModule } from './webhook/webhook.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AppController } from './app.controller';

import { EventsModule } from './events/events.module';
import { MessagesModule } from './messages/messages.module';
import { CustomersModule } from './customers/customers.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AiModule } from './ai/ai.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        WebhookModule,
        RedisModule,
        EventsModule,
        MessagesModule,
        CustomersModule,
        IntegrationsModule,
        AiModule,
    ],
    controllers: [AppController],
})
export class AppModule { }
