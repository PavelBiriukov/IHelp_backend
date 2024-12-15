import { UpdateVolunteerProfileHandler } from '../../update-volunteer-profile.handler';
import { CreateTaskChatHandler } from '../../create-chat.handler';
import { ReleaseTaskVolunteerHandler } from '../../release-task-volunteer.handler';

export const COMMANDS = [
  UpdateVolunteerProfileHandler,
  CreateTaskChatHandler,
  ReleaseTaskVolunteerHandler,
];
