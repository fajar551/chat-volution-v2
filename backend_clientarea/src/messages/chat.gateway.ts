import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/chat',
  path: '/socket.io/',
  transports: ['polling'], // Use polling only to avoid WebSocket upgrade errors
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly chatRooms = new Map<string, Set<string>>(); // chatId -> Set of socketIds

  constructor(private readonly messagesService: MessagesService) {
    //('✅ ChatGateway initialized with namespace /chat');
  }

  handleConnection(client: Socket) {
    //(`🔌 Client connected: ${client.id} to namespace /chat`);
    //(`🔌 Client transport: ${client.conn.transport.name}`);
  }

  handleDisconnect(client: Socket) {
    //(`🔌 Client disconnected: ${client.id}`);

    // Remove client from all chat rooms
    this.chatRooms.forEach((sockets, chatId) => {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.chatRooms.delete(chatId);
        }
      }
    });
  }

  /**
   * Join chat room
   * Client emits: 'join-chat', { chatId: 'chat_xxx' }
   */
  @SubscribeMessage('join-chat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const { chatId } = data;
    if (!chatId) {
      return { success: false, error: 'chatId is required' };
    }

    // Join Socket.IO room
    client.join(`chat:${chatId}`);

    // Track in our map
    if (!this.chatRooms.has(chatId)) {
      this.chatRooms.set(chatId, new Set());
    }
    this.chatRooms.get(chatId)!.add(client.id);

    //(`👤 Client ${client.id} joined chat: ${chatId}`);
    return { success: true, chatId };
  }

  /**
   * Leave chat room
   * Client emits: 'leave-chat', { chatId: 'chat_xxx' }
   */
  @SubscribeMessage('leave-chat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string },
  ) {
    const { chatId } = data;
    if (!chatId) {
      return { success: false, error: 'chatId is required' };
    }

    // Leave Socket.IO room
    client.leave(`chat:${chatId}`);

    // Remove from our map
    if (this.chatRooms.has(chatId)) {
      this.chatRooms.get(chatId)!.delete(client.id);
      if (this.chatRooms.get(chatId)!.size === 0) {
        this.chatRooms.delete(chatId);
      }
    }

    //(`👤 Client ${client.id} left chat: ${chatId}`);
    return { success: true, chatId };
  }

  /**
   * Broadcast new message to all clients in a chat room
   * Server emits: 'new-message' to room `chat:${chatId}`
   */
  broadcastNewMessage(chatId: string, message: any) {
    //(`📢 Broadcasting new message to chat: ${chatId}`);
    this.server.to(`chat:${chatId}`).emit('new-message', {
      success: true,
      data: message,
    });
  }

  /**
   * Broadcast updated messages list to all clients in a chat room
   * Server emits: 'messages-updated' to room `chat:${chatId}`
   */
  broadcastMessagesUpdated(chatId: string, messages: any[]) {
    //(`📢 Broadcasting messages updated to chat: ${chatId}`);
    this.server.to(`chat:${chatId}`).emit('messages-updated', {
      success: true,
      data: {
        chatId,
        messages,
        total: messages.length,
      },
    });
  }
}

