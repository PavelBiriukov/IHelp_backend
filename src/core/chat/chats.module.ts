import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ChatService } from './chats.service';
import { ChatsRepositoryModule } from '../../datalake/chats/chats-repository.module';


@Module({
  imports: [CqrsModule, ChatsRepositoryModule],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatsModule {}
