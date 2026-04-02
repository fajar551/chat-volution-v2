import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  Render,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessagesService } from './messages.service';
import { ChatStatus, Direction, MessageStatus, MessageType } from './entities/backend-message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatGateway } from './chat.gateway';
import { Response } from 'express';
import { fileFilter, getFileType, getMessageTypeFromFile, getStorageConfig } from './utils/file-upload.util';

@Controller('api-socket/chats')
export class ChatsController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly chatGateway: ChatGateway,
  ) {
    // console.log('✅ ChatsController initialized - Route: /api-socket/chats');
  }

  // Create new chat
  @Post('new')
  async createChat(@Body() body: any, @Res() res: Response) {
    try {
      // console.log('🆕 Creating new chat:', body);

      // Generate chat session ID if not provided
      const chatSessionId = body.chat_session_id || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate message ID
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get from_number from body (could be phone, email, or custom ID)
      const fromNumber = body.phone || body.email || body.from_number || `client_${Date.now()}`;

      // Create initial message if body.message exists
      let initialMessage = null;
      if (body.message || body.body) {
        initialMessage = await this.messagesService.create({
          message_id: messageId,
          from_number: fromNumber,
          to_number: null,
          body: body.message || body.body || '',
          direction: Direction.INCOMING,
          message_type: MessageType.TEXT,
          timestamp: Date.now(),
          chat_session_id: chatSessionId,
          chat_status: ChatStatus.OPEN,
          is_pending: true,
          name: body.name || body.user_name || 'Client',
          instance: body.instance || 'wa1',
          perusahaan: body.perusahaan || body.company || null,
          status: MessageStatus.SENT,
        });

        // Broadcast new message via WebSocket
        if (initialMessage) {
          const transformedMessage = {
            id: initialMessage.id,
            messageId: initialMessage.message_id,
            message: initialMessage.body,
            from: 'client',
            to: 'agent',
            timestamp: initialMessage.timestamp,
            receivedAt: initialMessage.received_at,
            status: initialMessage.status,
            messageType: initialMessage.message_type,
            agentId: initialMessage.agent_id,
            name: initialMessage.name,
            mediaData: initialMessage.media_data,
          };
          this.chatGateway.broadcastNewMessage(chatSessionId, transformedMessage);
        }
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        data: {
          chatId: chatSessionId,
          chatSessionId: chatSessionId,
          fromNumber: fromNumber,
          messageId: initialMessage?.id || messageId,
          status: 'open',
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('❌ Error creating chat:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Send message in chat
  @Post(':chatId/send')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: getStorageConfig(),
      fileFilter: fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
  )
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      // console.log('📤 Sending message in chat:', { chatId, body, file: file?.originalname });

      if (!chatId) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: 'Chat ID is required',
        });
      }

      // Get from_number from existing messages
      const existingMessages = await this.messagesService.findAll({
        chat_session_id: chatId,
        limit: 1,
      });

      if (existingMessages.messages.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: 'Chat not found',
        });
      }

      const fromNumber = existingMessages.messages[0].from_number;

      // Determine direction based on who is sending (client or agent)
      const isFromClient = body.from === 'client' || !body.agent_id;
      const direction = isFromClient ? Direction.INCOMING : Direction.OUTGOING;

      // Handle file upload if file exists (from FormData)
      // OR handle file data if sent as JSON (already uploaded)
      let mediaData = null;
      let messageType = body.message_type || MessageType.TEXT;

      if (file) {
        // File uploaded via FormData (new file)
        const fileType = getFileType(file.originalname);
        messageType = getMessageTypeFromFile(fileType) as MessageType;

        // Build file URL
        const fileUrl = `${process.env.APP_URL || 'https://cvbev2.genio.id'}/uploads/${file.filename}`;

        mediaData = {
          fileName: file.originalname,
          filePath: file.path,
          fileUrl: fileUrl,
          fileType: fileType,
          fileSize: file.size,
          mimeType: file.mimetype,
        };
      } else if (body.file && typeof body.file === 'object') {
        const fileData = body.file;
        const hasFileUrl = fileData.file_url || fileData.fileUrl;
        if (hasFileUrl) {
          // Hanya set media_data jika benar-benar ada file (fileUrl/file_url), agar pesan teks tidak ikut dapat media_data
          console.log('📎 Processing file data from JSON:', fileData);
          messageType = fileData.file_type === 'image' ? MessageType.IMAGE :
                       fileData.file_type === 'document' ? MessageType.DOCUMENT :
                       MessageType.TEXT;
          mediaData = {
            fileName: fileData.file_name || fileData.fileName,
            filePath: fileData.file_path || fileData.filePath,
            fileUrl: fileData.file_url || fileData.fileUrl,
            fileType: fileData.file_type || 'other',
            fileId: fileData.file_id || fileData.fileId,
            fileSize: fileData.file_size || fileData.fileSize,
            mimeType: fileData.mime_type || fileData.mimeType,
          };
          console.log('📎 Created mediaData:', mediaData);
        }
      }

      if (mediaData) {
        console.log('📎 MediaData will be saved:', JSON.stringify(mediaData, null, 2));
      }

      // Create message based on direction
      let message;
      if (isFromClient) {
        // Message from client (incoming) – turunkan assigned_to dari chat supaya pesan baru ikut ter-assign
        const existingAssignedTo = existingMessages.messages[0]?.assigned_to ?? null;
        const bodyText = (body.message || body.body || '').trim();
        const isTextOnly = bodyText.length > 0;

        const messageData: any = {
          message_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          from_number: fromNumber,
          to_number: null,
          body: body.message || body.body || '',
          direction: Direction.INCOMING,
          message_type: isTextOnly ? MessageType.TEXT : messageType,
          timestamp: Date.now(),
          chat_session_id: chatId,
          name: body.name || body.user_name || 'Client',
          instance: body.instance || 'wa1',
          status: MessageStatus.SENT,
          assigned_to: existingAssignedTo,
        };

        // Hanya isi media_data untuk pesan file-only; jika ada teks, jangan isi media_data
        if (mediaData && !isTextOnly) {
          messageData.media_data = mediaData;
          console.log('📎 Adding media_data to message:', JSON.stringify(mediaData, null, 2));
        }

        message = await this.messagesService.create(messageData);

        // Verify media_data was saved
        if (mediaData) {
          console.log('📎 Message created, checking media_data:', message.media_data ? 'SAVED' : 'NOT SAVED');
          if (message.media_data) {
            console.log('📎 Saved media_data:', JSON.stringify(message.media_data, null, 2));
          }
        }

        // Broadcast new message via WebSocket
        const transformedMessage = {
          id: message.id,
          messageId: message.message_id,
          message: message.body,
          from: 'client',
          to: 'agent',
          timestamp: message.timestamp,
          receivedAt: message.received_at,
          status: message.status,
          messageType: message.message_type,
          agentId: message.agent_id,
          name: message.name,
          mediaData: message.media_data,
        };
        // console.log('📤 Broadcasting message with mediaData:', transformedMessage.mediaData ? 'YES' : 'NO');
        this.chatGateway.broadcastNewMessage(chatId, transformedMessage);

        // Also broadcast updated messages list
        const { messages } = await this.messagesService.findAll({
          chat_session_id: chatId,
          limit: 100,
        });
        const transformedMessages = messages.map((msg) => ({
          id: msg.id,
          messageId: msg.message_id,
          message: msg.body,
          from: msg.direction === Direction.INCOMING ? 'client' : 'agent',
          to: msg.direction === Direction.OUTGOING ? 'client' : 'agent',
          timestamp: msg.timestamp,
          receivedAt: msg.received_at,
          status: msg.status,
          messageType: msg.message_type,
          agentId: msg.agent_id,
          name: msg.name,
          mediaData: msg.media_data,
        }));
        this.chatGateway.broadcastMessagesUpdated(chatId, transformedMessages);
      } else {
        // Message from agent (outgoing) – hanya turunkan assigned_to dari pesan yang ada.
        // Kirim pesan tidak auto-assign; assigned_to hanya terisi dari assign eksplisit (assign to me).
        const lastMsg = existingMessages.messages[0];
        const rawAssigned = lastMsg?.assigned_to;
        const assignedTo =
          rawAssigned != null && rawAssigned !== ''
            ? String(rawAssigned)
            : null;
        const sendMessageDto: SendMessageDto = {
          to_number: fromNumber,
          body: body.message || body.body || '',
          agent_id: body.agent_id,
          chat_session_id: chatId,
          message_type: messageType,
          instance: body.instance || 'wa1',
          name: body.name || body.user_name || 'Agent',
          assigned_to: assignedTo,
        };

        message = await this.messagesService.sendMessage(sendMessageDto, fromNumber);

        // Update message with media data if file exists
        if (mediaData) {
          message.media_data = mediaData;
          message.message_type = messageType;
          message = await this.messagesService.update(message.id, {
            media_data: mediaData,
            message_type: messageType,
          });
        }
      }

      // Broadcast new message via WebSocket
      const transformedMessage = {
        id: message.id,
        messageId: message.message_id,
        message: message.body,
        from: message.direction === Direction.INCOMING ? 'client' : 'agent',
        to: message.direction === Direction.OUTGOING ? 'client' : 'agent',
        timestamp: message.timestamp,
        receivedAt: message.received_at,
        status: message.status,
        messageType: message.message_type,
        agentId: message.agent_id,
        name: message.name,
        mediaData: message.media_data,
      };
      this.chatGateway.broadcastNewMessage(chatId, transformedMessage);

      // Also broadcast updated messages list
      const { messages } = await this.messagesService.findAll({
        chat_session_id: chatId,
        limit: 100,
      });
      const transformedMessages = messages.map((msg) => ({
        id: msg.id,
        messageId: msg.message_id,
        message: msg.body,
        from: msg.direction === Direction.INCOMING ? 'client' : 'agent',
        to: msg.direction === Direction.OUTGOING ? 'client' : 'agent',
        timestamp: msg.timestamp,
        receivedAt: msg.received_at,
        status: msg.status,
        messageType: msg.message_type,
        agentId: msg.agent_id,
        name: msg.name,
        mediaData: msg.media_data,
      }));
      this.chatGateway.broadcastMessagesUpdated(chatId, transformedMessages);

      return res.status(HttpStatus.OK).json({
        success: true,
        data: {
          messageId: message.message_id,
          id: message.id,
          chatId: chatId,
          message: message.body,
          timestamp: new Date().toISOString(),
          mediaData: message.media_data,
          media_data: message.media_data, // Also include for backward compatibility
        },
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  // End chat
  @Post(':chatId/end')
  async endChat(@Param('chatId') chatId: string, @Body() body: any, @Res() res: Response) {
    try {
      console.log('🔚 Ending chat:', chatId);

      // Get from_number from existing messages
      const existingMessages = await this.messagesService.findAll({
        chat_session_id: chatId,
        limit: 1,
      });

      if (existingMessages.messages.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: 'Chat not found',
        });
      }

      const fromNumber = existingMessages.messages[0].from_number;

      // Update chat status to closed
      await this.messagesService.updateChatStatus(fromNumber, ChatStatus.CLOSED);

      return res.status(HttpStatus.OK).json({
        success: true,
        data: {
          chatId: chatId,
          status: 'closed',
          endedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('❌ Error ending chat:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get chat status
  @Get(':chatId/status')
  async getChatStatus(@Param('chatId') chatId: string, @Res() res: Response) {
    try {
      console.log('📊 Getting chat status:', chatId);

      const { messages } = await this.messagesService.findAll({
        chat_session_id: chatId,
        limit: 1,
      });

      if (messages.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: 'Chat not found',
        });
      }

      const latestMessage = messages[messages.length - 1];

      return res.status(HttpStatus.OK).json({
        success: true,
        data: {
          chatId: chatId,
          status: latestMessage.chat_status,
          isPending: latestMessage.is_pending,
          assignedTo: latestMessage.assigned_to,
          createdAt: latestMessage.createdAt,
          updatedAt: latestMessage.updatedAt,
        },
      });
    } catch (error) {
      console.error('❌ Error getting chat status:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get messages in chat
  @Get(':chatId/messages')
  async getMessages(@Param('chatId') chatId: string, @Res() res: Response) {
    try {
      // console.log('📨 Getting messages for chat:', chatId);

      const { messages } = await this.messagesService.findAll({
        chat_session_id: chatId,
        limit: 100,
      });

      // Transform messages to match clientarea expected format
      const transformedMessages = messages.map((msg) => ({
        id: msg.id,
        messageId: msg.message_id,
        message: msg.body,
        from: msg.direction === Direction.INCOMING ? 'client' : 'agent',
        to: msg.direction === Direction.OUTGOING ? 'client' : 'agent',
        timestamp: msg.timestamp,
        receivedAt: msg.received_at,
        status: msg.status,
        messageType: msg.message_type,
        agentId: msg.agent_id,
        name: msg.name,
        mediaData: msg.media_data,
      }));

      return res.status(HttpStatus.OK).json({
        success: true,
        data: {
          chatId: chatId,
          messages: transformedMessages,
          total: messages.length,
        },
      });
    } catch (error) {
      console.error('❌ Error getting messages:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
        messages: [],
      });
    }
  }

  // Get list of all chats
  @Get()
  async getChats(
    @Query('status') status?: ChatStatus,
    @Query('assigned_to') assignedTo?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Res() res?: Response,
  ) {
    try {
      console.log('📋 Getting list of chats:', { status, assignedTo, limit, offset });

      const { chats, total } = await this.messagesService.getDistinctChats({
        chat_status: status,
        assigned_to: assignedTo,
        limit: limit ? parseInt(limit.toString()) : 50,
        offset: offset ? parseInt(offset.toString()) : 0,
      });

      return res.status(HttpStatus.OK).json({
        success: true,
        data: {
          chats,
          total,
          limit: limit ? parseInt(limit.toString()) : 50,
          offset: offset ? parseInt(offset.toString()) : 0,
        },
      });
    } catch (error) {
      console.error('❌ Error getting chats:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete chat by ID
  @Delete(':chatId')
  async deleteChat(@Param('chatId') chatId: string, @Res() res: Response) {
    try {
      console.log('🗑️ Deleting chat:', chatId);

      const deletedCount = await this.messagesService.deleteChatBySessionId(chatId);

      if (deletedCount === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: 'Chat not found',
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        data: {
          chatId: chatId,
          deletedCount: deletedCount,
          message: `Successfully deleted ${deletedCount} message(s) from chat`,
        },
      });
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete all chats
  @Delete()
  async deleteAllChats(@Res() res: Response) {
    try {
      console.log('🗑️ Deleting all chats');

      const deletedCount = await this.messagesService.deleteAllChats();

      return res.status(HttpStatus.OK).json({
        success: true,
        data: {
          deletedCount: deletedCount,
          message: `Successfully deleted ${deletedCount} message(s) from all chats`,
        },
      });
    } catch (error) {
      console.error('❌ Error deleting all chats:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }
}

/**
 * ChatViewController - Controller untuk halaman HTML/view
 * Route: /chat/*
 *
 * Fungsi: Menampilkan halaman HTML untuk agent membalas chat dari client
 */
@Controller('chat')
export class ChatViewController {
  constructor(private readonly messagesService: MessagesService) {
    // console.log('✅ ChatViewController initialized - Routes: /chat/reply/:chatId, /chat/reply');
    // console.log('✅ ChatViewController - Controller registered at /chat');
  }

  /**
   * GET /chat/reply/:chatId
   * Halaman HTML untuk agent membalas chat berdasarkan chatId
   * RECOMMENDED: Gunakan endpoint ini untuk halaman balas chat
   */
  @Get('reply/:chatId')
  @Render('reply-chat-id')
  async getReplyPageByChatId(@Param('chatId') chatId: string) {
    console.log('📄 [ChatViewController] GET /chat/reply/:chatId - chatId:', chatId);

    if (!chatId) {
      return {
        error: 'chatId parameter is required',
        messages: [],
        chatId: '',
        fromNumber: '',
        appUrl: process.env.APP_URL || 'https://cvbev2.genio.id',
      };
    }

    try {
      const { messages } = await this.messagesService.findAll({
        chat_session_id: chatId,
        limit: 100,
      });

      // Transform messages to match template format
      const transformedMessages = messages.map((msg) => ({
        id: msg.id,
        messageId: msg.message_id,
        message: msg.body,
        body: msg.body,
        from: msg.direction === 'incoming' ? 'client' : 'agent',
        to: msg.direction === 'outgoing' ? 'client' : 'agent',
        direction: msg.direction,
        timestamp: msg.timestamp,
        received_at: msg.received_at,
        status: msg.status,
        messageType: msg.message_type,
        agentId: msg.agent_id,
        name: msg.name,
        mediaData: msg.media_data,
        media_data: msg.media_data,
        chat_status: msg.chat_status,
      }));

      return {
        messages: transformedMessages,
        chatId: chatId,
        fromNumber: messages.length > 0 ? messages[0].from_number : '',
        appUrl: process.env.APP_URL || 'https://cvbev2.genio.id',
      };
    } catch (error) {
      return {
        error: error.message || 'Error loading chat',
        messages: [],
        chatId: chatId,
        fromNumber: '',
        appUrl: process.env.APP_URL || 'https://cvbev2.genio.id',
      };
    }
  }

  /**
   * GET /chat/reply
   * Halaman HTML untuk agent membalas chat berdasarkan from_number (LEGACY)
   * LEGACY: Gunakan /chat/reply/:chatId jika memungkinkan
   */
  @Get('reply')
  @Render('reply-chat')
  async getReplyPage(
    @Query('from_number') fromNumber: string,
    @Query('chat_session_id') chatSessionId?: string,
  ) {
    console.log('📄 [ChatViewController] Rendering reply page (legacy) for from_number:', fromNumber);

    if (!fromNumber) {
      return {
        error: 'from_number parameter is required',
        messages: [],
        fromNumber: '',
        chatSessionId: chatSessionId || '',
        appUrl: process.env.APP_URL || 'https://cvbev2.genio.id',
      };
    }

    try {
      const { messages } = await this.messagesService.findAll({
        from_number: fromNumber,
        chat_session_id: chatSessionId,
        limit: 100,
      });

      return {
        messages,
        fromNumber,
        chatSessionId: chatSessionId || '',
        appUrl: process.env.APP_URL || 'https://cvbev2.genio.id',
      };
    } catch (error) {
      return {
        error: error.message || 'Error loading chat',
        messages: [],
        fromNumber: fromNumber,
        chatSessionId: chatSessionId || '',
        appUrl: process.env.APP_URL || 'https://cvbev2.genio.id',
      };
    }
  }

  /**
   * POST /chat/reply
   * Form submit untuk balas chat (LEGACY)
   * LEGACY: Sebaiknya gunakan API /api-socket/chats/:chatId/send
   * Redirect ke halaman chatId jika chat_session_id tersedia
   */
  @Post('reply')
  async sendReply(
    @Body() body: any,
    @Query('from_number') fromNumber: string,
    @Res() res: Response,
  ) {
    if (!fromNumber) {
      return res.status(400).json({ error: 'from_number is required' });
    }

    try {
      const sendMessageDto: SendMessageDto = {
        to_number: body.to_number || fromNumber,
        body: body.body,
        agent_id: body.agent_id,
        chat_session_id: body.chat_session_id,
        message_type: body.message_type,
        instance: body.instance,
        name: body.name,
      };

      const message = await this.messagesService.sendMessage(
        sendMessageDto,
        fromNumber,
      );

      // Redirect to chatId page if chat_session_id is available, otherwise use legacy URL
      if (sendMessageDto.chat_session_id) {
        return res.redirect(`/chat/reply/${sendMessageDto.chat_session_id}`);
      } else {
        const redirectUrl = `/chat/reply?from_number=${fromNumber}`;
        return res.redirect(redirectUrl);
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

