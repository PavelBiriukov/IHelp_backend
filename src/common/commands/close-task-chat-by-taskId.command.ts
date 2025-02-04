import { ObjectId } from 'mongoose';

export class CloseTaskChatByTaskIdCommand {
  constructor(public readonly taskId: string | ObjectId) {}
}
