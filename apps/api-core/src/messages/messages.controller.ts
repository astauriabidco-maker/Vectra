import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post('send')
    @HttpCode(HttpStatus.OK)
    async send(@Body() body: { conversationId: string; text: string }) {
        return this.messagesService.sendMessage(body.conversationId, body.text);
    }
}
