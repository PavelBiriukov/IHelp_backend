import { GetUserChatsMetaHandler } from '../../core/get-user-chats-meta.handler';
import { GetChatMessagesQueryHandler } from '../../core/get-chat-messages-query.handler';
import { GetUserQueryHandler } from '../../core/get-user-query.handler';

export const QUERIES = [GetUserChatsMetaHandler, GetChatMessagesQueryHandler, GetUserQueryHandler];
