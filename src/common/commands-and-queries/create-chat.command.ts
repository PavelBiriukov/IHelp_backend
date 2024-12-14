import { TaskInterface } from '../types/task.types';

type CreateTaskChatCommandType = {
  taskId: string;
  updatedTask: TaskInterface;
};

export class CreateTaskChatCommand {
  constructor(public readonly dto: CreateTaskChatCommandType) {}
}
