import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, IsNull } from 'typeorm';
import { BackendMessage, ChatStatus, Direction, MessageStatus, MessageType } from './entities/backend-message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(BackendMessage)
    private messagesRepository: Repository<BackendMessage>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<BackendMessage> {
    const now = new Date();
    const messageData: any = {
      ...createMessageDto,
      received_at: now,
      createdAt: now,
      updatedAt: now,
    };
    const message = this.messagesRepository.create(messageData);
    const saved = await this.messagesRepository.save(message);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(query?: {
    from_number?: string;
    to_number?: string;
    chat_session_id?: string;
    chat_status?: ChatStatus;
    assigned_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ messages: BackendMessage[]; total: number }> {
    const where: any = {};

    if (query?.from_number) {
      where.from_number = query.from_number;
    }
    if (query?.to_number) {
      where.to_number = query.to_number;
    }
    if (query?.chat_session_id) {
      where.chat_session_id = query.chat_session_id;
    }
    if (query?.chat_status) {
      where.chat_status = query.chat_status;
    }
    if (query?.assigned_to) {
      where.assigned_to = query.assigned_to;
    }

    const [messages, total] = await this.messagesRepository.findAndCount({
      where,
      order: { timestamp: 'ASC' },
      take: query?.limit || 100,
      skip: query?.offset || 0,
    });

    return { messages, total };
  }

  async findOne(id: number): Promise<BackendMessage> {
    const message = await this.messagesRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async findByMessageId(messageId: string): Promise<BackendMessage> {
    return await this.messagesRepository.findOne({ where: { message_id: messageId } });
  }

  async getChatHistory(fromNumber: string, toNumber?: string): Promise<BackendMessage[]> {
    const where: any = { from_number: fromNumber };
    if (toNumber) {
      where.to_number = toNumber;
    }

    return await this.messagesRepository.find({
      where,
      order: { timestamp: 'ASC' },
    });
  }

  async sendMessage(sendMessageDto: SendMessageDto, fromNumber: string): Promise<BackendMessage> {
    const now = new Date();
    const messageData: any = {
      message_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from_number: fromNumber,
      to_number: sendMessageDto.to_number,
      body: sendMessageDto.body || '',
      direction: Direction.OUTGOING,
      message_type: sendMessageDto.message_type || MessageType.TEXT,
      timestamp: Date.now(),
      received_at: now,
      agent_id: sendMessageDto.agent_id,
      chat_session_id: sendMessageDto.chat_session_id,
      status: MessageStatus.SENT,
      instance: sendMessageDto.instance || 'wa1',
      name: sendMessageDto.name,
      assigned_to: sendMessageDto.assigned_to ?? null,
      createdAt: now,
      updatedAt: now,
    };
    const message = this.messagesRepository.create(messageData);
    const saved = await this.messagesRepository.save(message);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async update(id: number, updateMessageDto: UpdateMessageDto): Promise<BackendMessage> {
    const message = await this.findOne(id);
    Object.assign(message, updateMessageDto);
    message.updatedAt = new Date();
    return await this.messagesRepository.save(message);
  }

  async updateChatStatus(fromNumber: string, status: ChatStatus): Promise<void> {
    await this.messagesRepository.update(
      { from_number: fromNumber },
      { chat_status: status },
    );
  }

  async markAsRead(messageIds: number[]): Promise<void> {
    if (messageIds && messageIds.length > 0) {
      await this.messagesRepository.update(
        { id: In(messageIds) },
        { is_read: true },
      );
    }
  }

  async assignChat(fromNumber: string, agentId: string): Promise<void> {
    await this.messagesRepository.update(
      { from_number: fromNumber },
      { assigned_to: agentId, is_pending: false },
    );
  }

  async remove(id: number): Promise<void> {
    const message = await this.findOne(id);
    await this.messagesRepository.remove(message);
  }

  async getUnreadCount(fromNumber?: string, agentId?: string): Promise<number> {
    const where: any = { is_read: false, direction: Direction.INCOMING };
    if (fromNumber) {
      where.from_number = fromNumber;
    }
    if (agentId) {
      where.assigned_to = agentId;
    }
    return await this.messagesRepository.count({ where });
  }
  
  /**
   * Jumlah pesan belum dibaca per chat (is_read = 0/false, direction = INCOMING).
   * Dipakai untuk badge di list chat.
   */
  async getUnreadCountByChatSessions(): Promise<Map<string, number>> {
    const rows = await this.messagesRepository
      .createQueryBuilder('message')
      .select('message.chat_session_id', 'chat_session_id')
      .addSelect('COUNT(*)', 'cnt')
      .where('message.is_read = :isRead', { isRead: false })
      .andWhere('message.direction = :direction', { direction: Direction.INCOMING })
      .andWhere('message.chat_session_id IS NOT NULL')
      .andWhere('message.chat_session_id != :empty', { empty: '' })
      .groupBy('message.chat_session_id')
      .getRawMany();
    const map = new Map<string, number>();
    for (const row of rows) {
      const id = row.chat_session_id;
      const cnt = typeof row.cnt === 'string' ? parseInt(row.cnt, 10) : Number(row.cnt);
      if (id && !Number.isNaN(cnt)) map.set(id, cnt);
    }
    return map;
  }

  /**
   * Get distinct chat sessions with latest message info
   */
  async getDistinctChats(query?: {
    chat_status?: ChatStatus;
    assigned_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ chats: any[]; total: number }> {
    // Get all messages grouped by chat_session_id
    // Build query with explicit condition for chat_session_id IS NOT NULL
    const queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .where('message.chat_session_id IS NOT NULL')
      .andWhere('message.chat_session_id != :empty', { empty: '' });

    if (query?.chat_status) {
      queryBuilder.andWhere('message.chat_status = :chat_status', { chat_status: query.chat_status });
    }

    if (query?.assigned_to) {
      queryBuilder.andWhere('message.assigned_to = :assigned_to', { assigned_to: query.assigned_to });
    }

    queryBuilder.orderBy('message.timestamp', 'DESC');

    // Get all messages first
    const allMessages = await queryBuilder.getMany();

    // Group by chat_session_id and get latest message for each
    const chatMap = new Map<string, any>();

    for (const message of allMessages) {
      if (!message.chat_session_id) {
        continue;
      }

      if (!chatMap.has(message.chat_session_id)) {
        chatMap.set(message.chat_session_id, {
          // Format untuk frontend compatibility
          id: message.chat_session_id,
          chat_session_id: message.chat_session_id,
          chatId: message.chat_session_id,
          from_number: message.from_number,
          to_number: message.to_number,
          fromNumber: message.from_number,
          toNumber: message.to_number,
          name: message.name || message.from_number || 'Client',
          instance: message.instance || 'wa1',
          chat_status: message.chat_status,
          status: message.chat_status,
          assigned_to: message.assigned_to,
          assignedTo: message.assigned_to,
          body: message.body,
          message: message.body,
          message_type: message.message_type,
          media_data: message.media_data,
          created_at: message.received_at || message.createdAt,
          updated_at: message.updatedAt || message.received_at,
          timestamp: message.timestamp,
          lastMessage: {
            id: message.id,
            messageId: message.message_id,
            body: message.body,
            message_type: message.message_type,
            timestamp: message.timestamp,
            direction: message.direction,
          },
          lastMessageTimestamp: message.timestamp,
        });
      } else {
        // Update if this message is newer
        const existingChat = chatMap.get(message.chat_session_id);
        if (message.timestamp > existingChat.lastMessageTimestamp) {
          chatMap.set(message.chat_session_id, {
            ...existingChat,
            body: message.body,
            message: message.body,
            message_type: message.message_type,
            media_data: message.media_data,
            created_at: message.received_at || message.createdAt,
            updated_at: message.updatedAt || message.received_at,
            timestamp: message.timestamp,
            chat_status: message.chat_status,
            status: message.chat_status,
            assigned_to: message.assigned_to,
            assignedTo: message.assigned_to,
            lastMessage: {
              id: message.id,
              messageId: message.message_id,
              body: message.body,
              message_type: message.message_type,
              timestamp: message.timestamp,
              direction: message.direction,
            },
            lastMessageTimestamp: message.timestamp,
          });
        }
      }
    }

    const chats = Array.from(chatMap.values());
    const total = chats.length;
    
    // Jumlah pesan belum dibaca per chat (is_read = 0) → untuk badge di list chat
    const unreadMap = await this.getUnreadCountByChatSessions();
    for (const chat of chats) {
      chat.unread_count = unreadMap.get(chat.chat_session_id) || 0;
      chat.unread_count_agent = chat.unread_count;
    }

    // Sort by last message timestamp
    chats.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);

    // Apply pagination
    const offset = query?.offset || 0;
    const limit = query?.limit || 50;
    const paginatedChats = chats.slice(offset, offset + limit);

    return { chats: paginatedChats, total };
  }

  /**
   * Delete all messages in a chat session
   */
  async deleteChatBySessionId(chatSessionId: string): Promise<number> {
    const result = await this.messagesRepository.delete({
      chat_session_id: chatSessionId,
    });
    return result.affected || 0;
  }

  /**
   * Delete all chats (all messages)
   */
  async deleteAllChats(): Promise<number> {
    const result = await this.messagesRepository.delete({});
    return result.affected || 0;
  }
}

