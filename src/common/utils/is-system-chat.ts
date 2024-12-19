import { SystemChat } from '../../datalake/chats/schemas/system-chat.schema';
import { Chat } from '../../datalake/chats/schemas/chat.schema';
import { ChatType } from '../types/system.types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isSystemChat(chat: unknown): chat is SystemChat {
  return chat instanceof Chat && chat.type === ChatType.SYSTEM_CHAT;
}
