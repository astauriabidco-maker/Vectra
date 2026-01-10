import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    onModuleInit() {
        this.client = new Redis({
            host: 'localhost',
            port: 6399, // Mapped port from docker-compose
        });

        this.client.on('connect', () => {
            console.log('Connected to Redis on port 6399');
        });

        this.client.on('error', (err) => {
            console.error('Redis connection error:', err);
        });
    }

    onModuleDestroy() {
        this.client.disconnect();
    }

    async pushJob(queueName: string, data: any) {
        await this.client.rpush(queueName, JSON.stringify(data));
    }

    async publishEvent(channel: string, data: any) {
        await this.client.publish(channel, JSON.stringify(data));
    }
}
