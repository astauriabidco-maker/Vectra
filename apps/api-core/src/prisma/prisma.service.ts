import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        // 🚨 FIX ULTIME: Lecture directe de process.env sans ConfigService
        const url = process.env.DATABASE_URL;

        console.log('🔍 DEBUG: Variables d\'environnement disponibles:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES')));

        if (!url) {
            console.error('❌ ERREUR CRITIQUE: DATABASE_URL absente de process.env !');
        } else {
            console.log('✅ DATABASE_URL trouvée via process.env');
        }

        super({
            datasources: {
                db: {
                    url: url,
                },
            },
        });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
