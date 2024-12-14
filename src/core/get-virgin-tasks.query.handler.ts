import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { TasksService } from './tasks/tasks.service';
import { GetVirginTasksQuery } from '../common/commands-and-queries/get-virgin-tasks.query';

@QueryHandler(GetVirginTasksQuery)
export class GetVirginTasksQueryHandler implements IQueryHandler<GetVirginTasksQuery> {
  constructor(private readonly tasksService: TasksService) {}

  async execute(query: GetVirginTasksQuery) {
    const { taskStatus, dto, user } = query;
    return this.tasksService.getTasksByStatus(taskStatus, dto, user);
  }
}
