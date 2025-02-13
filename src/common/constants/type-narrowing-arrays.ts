import { ChatSchema } from '../../datalake/chats/schemas/chat.schema';
import { TaskChatSchema } from '../../datalake/chats/schemas/task-chat.schema';
import { SystemChatSchema } from '../../datalake/chats/schemas/system-chat.schema';
import { ConflictChatWithVolunteerSchema } from '../../datalake/chats/schemas/conflict-volunteer-chat.schema';
import { ConflictChatWithRecipientSchema } from '../../datalake/chats/schemas/conflict-recipient-chat.schema';

export const CHAT_SEARCH_FIELDS = Array.from(
  new Set([
    ...Object.keys(ChatSchema.paths),
    ...Object.keys(TaskChatSchema.paths),
    ...Object.keys(SystemChatSchema.paths),
    ...Object.keys(ConflictChatWithVolunteerSchema.paths),
    ...Object.keys(ConflictChatWithRecipientSchema.paths),
  ])
);
