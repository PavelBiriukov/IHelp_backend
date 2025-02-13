// eslint-disable-next-line import/no-cycle
import {
  ChatPageRequestQueryDto,
  ConflictChatsTupleMetaInterface,
  MessageInterface,
  SystemChatMetaInterface,
  TaskChatMetaInterface,
} from './chats.types';
import { AnyUserInterface } from './user.types';

export const wsMessageKind = {
  REFRESH_TOKEN_COMMAND: 'RefreshToken',
  INITIAL_CHATS_META_COMMAND: 'InitialMeta', // При первом подключении
  REFRESH_CHATS_META_COMMAND: 'RefreshMeta', // При обновлении любой сущности меты
  NEW_CHATS_META_COMMAND: 'NewMeta', // При добавлении новой меты
  NEW_MESSAGE_COMMAND: 'NewMessage',
  REFRESH_CP_COMMAND: 'RefreshCP',
  REFRESH_CONTACTS_COMMAND: 'RefreshContacts',
  NEW_BLOG_POST_COMMAND: 'NewPost',
  CHAT_PAGE_QUERY: `PageQuery`,
  CHAT_PAGE_CONTENT: 'ChatPage',
  DISCONNECTION_EVENT: 'Disconnection',
  CONNECTION_EVENT: 'Connection',
  OPEN_CHAT_EVENT: 'OpenChat',
  CLOSE_CHAT_EVENT: 'CloseChat',
  UPDATE_LASTREAD_COMMAND: 'UpdateLastread',
} as const;

export type wsMessageKind = keyof typeof wsMessageKind;

export type wsTokenPayload = {
  user: AnyUserInterface;
  token: string;
};

export type wsUserMetaPayload = {
  system: Array<SystemChatMetaInterface>;
  tasks: Array<TaskChatMetaInterface>;
  conflicts: Array<ConflictChatsTupleMetaInterface>;
};

export type wsAdminMetaPayload = {
  my: Array<SystemChatMetaInterface>;
  system: Array<SystemChatMetaInterface>;
  moderated: Array<ConflictChatsTupleMetaInterface>;
  conflicts: Array<ConflictChatsTupleMetaInterface>;
};

export type wsMetaPayload = wsUserMetaPayload | wsAdminMetaPayload;

export type wsUserStatus = {
  isOnline: boolean;
  isInChat: boolean;
};

export interface wsChatPageQueryPayload extends ChatPageRequestQueryDto {
  chatId: string;
}

export type wsMessagesPayload = { messages: Array<MessageInterface> };

export type wsDisconnectionPayload = {
  userId: string;
};

export type wsLastreadPayload = {
  chatId: string;
  lastread: Date;
};

export type wsPayloadType =
  | wsTokenPayload
  | wsMetaPayload
  | wsChatPageQueryPayload
  | wsMessagesPayload
  | wsDisconnectionPayload
  | wsLastreadPayload;

export type wsMessageData = {
  data: wsPayloadType;
};

export type wsConnectedUserData = {
  user: AnyUserInterface;
  sockets: Array<string>;
};

export type wsOpenedChatsData<T extends string> = {
  [key in T]: Array<string>;
};

export interface WsNewMessage
  extends Omit<MessageInterface, '_id' | 'createdAt' | 'updatedAt' | 'timestamp'> {
  timestamp: string;
}
