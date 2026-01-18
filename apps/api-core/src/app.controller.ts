
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello(): string {
        return 'Vectra API v2 is running 🚀';
    }

    @Get('health')
    getHealth() {
        return {
            status: 'ok',
            version: '2.0',
            timestamp: new Date().toISOString(),
        };
    }
}
