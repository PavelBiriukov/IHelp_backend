import { GetTasksDto } from '../dto/tasks.dto';
import { TaskStatus } from '../types/task.types';
import { AnyUserInterface } from '../types/user.types';

export class GetVirginTasksQuery {
  constructor(
    public readonly taskStatus: TaskStatus,
    public readonly dto: GetTasksDto,
    public readonly user?: AnyUserInterface
  ) {}
}
