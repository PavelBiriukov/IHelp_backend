import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
// eslint-disable-next-line import/no-cycle
import { AuthModule } from '../../core/auth/auth.module';
import { WebsocketApiGateway } from './websocket-api.gateway';
import { AddChatMessageHandler } from '../../core/add-chat-message.handler';
import { ChatService } from '../../core/chat/chats.service';
import { QUERIES } from '../../common/queries';

@Module({
  imports: [forwardRef(() => AuthModule), CqrsModule],
  providers: [WebsocketApiGateway, AddChatMessageHandler, ChatService, ...QUERIES],
  exports: [WebsocketApiGateway],
})
export class WebsocketApiModule {}
