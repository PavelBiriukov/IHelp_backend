import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatEntityModule } from '../../entities/chats/chat.entity.module';

@Module({
  imports: [CqrsModule, ChatEntityModule],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
