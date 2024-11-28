import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TasksService } from './tasks/tasks.service';
import { GetPublicTasksQuery } from '../common/commands-and-queries/get-public-tasks.query';

@QueryHandler(GetPublicTasksQuery)
export class GetPublicTasksQueryHandler implements IQueryHandler<GetPublicTasksQuery> {
  constructor(private readonly tasksService: TasksService) {}

  async execute(query: GetPublicTasksQuery) {
    const { dto } = query;
    return this.tasksService.getAllVirginTasks(dto);
  }
}
