import { CreateConflictChatsHandler } from '../../create-conflict-chats.handler';
import { UpdateVolunteerProfileHandler } from '../../update-volunteer-profile.handler';
import { CreateTaskChatHandler } from '../../create-chat.handler';

export const COMMANDS = [
  UpdateVolunteerProfileHandler,
  CreateConflictChatsHandler,
  CreateTaskChatHandler,
];
