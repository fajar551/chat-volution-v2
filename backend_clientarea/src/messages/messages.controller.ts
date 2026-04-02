import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatStatus } from './entities/backend-message.entity';
import { Response } from 'express';

@Controller('api/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto) {
    return await this.messagesService.create(createMessageDto);
  }

  @Get()
  async findAll(
    @Query('from_number') fromNumber?: string,
    @Query('to_number') toNumber?: string,
    @Query('chat_session_id') chatSessionId?: string,
    @Query('chat_status') chatStatus?: ChatStatus,
    @Query('assigned_to') assignedTo?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.messagesService.findAll({
      from_number: fromNumber,
      to_number: toNumber,
      chat_session_id: chatSessionId,
      chat_status: chatStatus,
      assigned_to: assignedTo,
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
    });
  }

  @Get('chat-history')
  async getChatHistory(
    @Query('from_number') fromNumber: string,
    @Query('to_number') toNumber?: string,
  ) {
    if (!fromNumber) {
      return { error: 'from_number is required' };
    }
    return await this.messagesService.getChatHistory(fromNumber, toNumber);
  }

  @Get('unread-count')
  async getUnreadCount(
    @Query('from_number') fromNumber?: string,
    @Query('agent_id') agentId?: string,
  ) {
    const count = await this.messagesService.getUnreadCount(fromNumber, agentId);
    return { count };
  }

  @Post('send')
  async sendMessage(
    @Body() sendMessageDto: SendMessageDto,
    @Query('from_number') fromNumber: string,
  ) {
    if (!fromNumber) {
      return { error: 'from_number is required' };
    }
    return await this.messagesService.sendMessage(sendMessageDto, fromNumber);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.messagesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return await this.messagesService.update(+id, updateMessageDto);
  }

  @Patch('chat-status/:fromNumber')
  async updateChatStatus(
    @Param('fromNumber') fromNumber: string,
    @Body('status') status: ChatStatus,
  ) {
    await this.messagesService.updateChatStatus(fromNumber, status);
    return { message: 'Chat status updated successfully' };
  }

  @Post('mark-read')
  async markAsRead(@Body('message_ids') messageIds: number[]) {
    await this.messagesService.markAsRead(messageIds);
    return { message: 'Messages marked as read' };
  }

  @Post('assign-chat')
  async assignChat(
    @Body('from_number') fromNumber: string,
    @Body('agent_id') agentId: string,
  ) {
    await this.messagesService.assignChat(fromNumber, agentId);
    return { message: 'Chat assigned successfully' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.messagesService.remove(+id);
    return { message: 'Message deleted successfully' };
  }
}

