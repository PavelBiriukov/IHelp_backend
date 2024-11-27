import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePointsInTasksCommand } from '../common/commands/update-points.command';
import { TasksService } from './tasks/tasks.service';

@CommandHandler(UpdatePointsInTasksCommand)
export class UpdatePointsInTasksHandler implements ICommandHandler<UpdatePointsInTasksCommand> {
  constructor(private readonly taskService: TasksService) {}

  async execute({ dto }: UpdatePointsInTasksCommand) {
    return this.taskService.updateTaskPoints(dto.points, dto.id);
  }
}
