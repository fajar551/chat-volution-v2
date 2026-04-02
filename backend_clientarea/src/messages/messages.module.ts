import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { BackendMessage } from './entities/backend-message.entity';
import { ChatsController, ChatViewController } from './chats.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([BackendMessage])],
  controllers: [MessagesController, ChatsController, ChatViewController],
  providers: [MessagesService, ChatGateway],
  exports: [MessagesService, ChatGateway],
})
export class MessagesModule {
  constructor() {
    // console.log('✅ MessagesModule loaded - Controllers: MessagesController, ChatsController, ChatViewController, ChatGateway');
  }
}

