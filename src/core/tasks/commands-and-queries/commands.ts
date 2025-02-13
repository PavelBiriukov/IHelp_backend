import { UpdateVolunteerProfileHandler } from '../../update-volunteer-profile.handler';
import { CreateTaskChatHandler } from '../../create-chat.handler';
import { ReleaseTaskVolunteerHandler } from '../../release-task-volunteer.handler';
import { CloseTaskChatByTaskIdHandler } from '../../close-task-chat-by-taskId.handler';

export const COMMANDS = [
  UpdateVolunteerProfileHandler,
  CreateTaskChatHandler,
  ReleaseTaskVolunteerHandler,
  CloseTaskChatByTaskIdHandler,
];
