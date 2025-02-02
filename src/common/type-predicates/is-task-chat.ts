import { TaskChat } from '../../datalake/chats/schemas/task-chat.schema';
import { ChatType } from '../types/system.types';
import { Chat } from '../../datalake/chats/schemas/chat.schema';

export function isTaskChat(chat: unknown): chat is TaskChat {
  return chat instanceof Chat && chat.type === ChatType.TASK_CHAT;
}
