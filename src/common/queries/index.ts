import { GetUserChatsMetaHandler } from '../../core/get-user-chats-meta.handler';
import { GetChatMessagesQueryHandler } from '../../core/get-chat-messages-query.handler';
import { GetUserQueryHandler } from '../../core/get-user-query.handler';
import { SearchUserQuery } from './search-user.query';

export const QUERIES = [
  GetUserChatsMetaHandler,
  GetChatMessagesQueryHandler,
  GetUserQueryHandler,
  SearchUserQuery,
];
