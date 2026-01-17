import { Controller, Get, Put, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IntegrationsService, IntegrationCredentials } from './integrations.service';

interface UpdateIntegrationDto {
    enabled?: boolean;
    credentials?: IntegrationCredentials;
}

@Controller('integrations')
export class IntegrationsController {
    constructor(private readonly integrationsService: IntegrationsService) { }

    @Get()
    async getAll() {
        return this.integrationsService.getAllIntegrations();
    }

    @Get(':provider')
    async getOne(@Param('provider') provider: string) {
        return this.integrationsService.getIntegrationMasked(provider);
    }

    @Put(':provider')
    @HttpCode(HttpStatus.OK)
    async update(
        @Param('provider') provider: string,
        @Body() body: UpdateIntegrationDto,
    ) {
        return this.integrationsService.saveIntegration(provider, body);
    }
}
