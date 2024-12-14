import { GetTasksDto } from '../dto/tasks.dto';

export class GetPublicTasksQuery {
  constructor(public readonly dto: GetTasksDto) {}
}
