import { Type } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { GetUserChatsMetaHandler } from '../../core/get-user-chats-meta.handler';
import { GetChatMessagesQueryHandler } from '../../core/get-chat-messages-query.handler';

export const QUERIES: Type<IQueryHandler>[] = [
  GetUserChatsMetaHandler,
  GetChatMessagesQueryHandler,
];
