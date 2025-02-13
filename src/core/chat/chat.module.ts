import { CqrsModule } from '@nestjs/cqrs';
import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatEntityModule } from '../../entities/chats/chat.entity.module';
import { QUERIES } from '../../common/queries';
// eslint-disable-next-line import/no-cycle
import { UsersModule } from '../users/users.module';

@Module({
  imports: [CqrsModule, ChatEntityModule, forwardRef(() => UsersModule)],
  providers: [ChatService, ...QUERIES],
  exports: [ChatService],
})
export class ChatModule {}
