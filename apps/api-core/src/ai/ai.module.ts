import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { RedisModule } from '../redis/redis.module';

@Module({
    imports: [PrismaModule, IntegrationsModule, RedisModule],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule { }
