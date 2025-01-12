import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { ChatEntityModule } from '../../entities/chats/chat.entity.module';
import { ChatService } from './chat.service';

@Module({
  imports: [CqrsModule, ChatEntityModule],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
