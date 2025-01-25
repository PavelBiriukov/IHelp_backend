import { ConflictChatWithVolunteer } from '../../datalake/chats/schemas/conflict-volunteer-chat.schema';
import { ChatType } from '../types/system.types';
import { Chat } from '../../datalake/chats/schemas/chat.schema';

export function isConflictChatWithVolunteer(chat: unknown): chat is ConflictChatWithVolunteer {
  return chat instanceof Chat && chat.type === ChatType.CONFLICT_CHAT_WITH_VOLUNTEER;
}
