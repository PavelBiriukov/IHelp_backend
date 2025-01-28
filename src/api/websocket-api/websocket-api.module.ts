import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
// eslint-disable-next-line import/no-cycle
import { AuthModule } from '../../core/auth/auth.module';
import { WebsocketApiGateway } from './websocket-api.gateway';
import { AddChatMessageHandler } from '../../core/add-chat-message.handler';
import { ChatService } from '../../core/chat/chat.service';
import { QUERIES } from '../../common/queries';
import { ChatEntityModule } from '../../entities/chats/chat.entity.module';
import { ChatModule } from '../../core/chat/chat.module';
import { UsersModule } from '../../core/users/users.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    CqrsModule,
    ChatEntityModule,
    forwardRef(() => UsersModule),
  ],
  providers: [WebsocketApiGateway, AddChatMessageHandler, ChatService, ...QUERIES, ChatModule],
  exports: [WebsocketApiGateway],
})
export class WebsocketApiModule {}
