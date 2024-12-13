import { AnyUserInterface } from '../types/user.types';

export class CreateConflictChatsCommand {
  constructor(public readonly taskId: string, public readonly moderator: AnyUserInterface) {}
}
