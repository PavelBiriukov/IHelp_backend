import { TaskInterface } from '../types/task.types';

export type CreateTaskChatCommandType = {
  updatedTask: TaskInterface;
};

export class CreateTaskChatCommand {
  constructor(public readonly dto: CreateTaskChatCommandType) {}
}
