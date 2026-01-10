import { Module } from '@nestjs/common';
import { WebhookModule } from './webhook/webhook.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AppController } from './app.controller';

import { EventsModule } from './events/events.module';
import { MessagesModule } from './messages/messages.module';

@Module({
    imports: [PrismaModule, WebhookModule, RedisModule, EventsModule, MessagesModule],
    controllers: [AppController],
})
export class AppModule { }
