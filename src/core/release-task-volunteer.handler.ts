import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TasksService } from './tasks/tasks.service';
import { ReleaseTaskVolunteerCommand } from '../common/commands/release-task-volunteer.command';

@CommandHandler(ReleaseTaskVolunteerCommand)
export class ReleaseTaskVolunteerHandler implements ICommandHandler<ReleaseTaskVolunteerCommand> {
  constructor(private readonly tasksService: TasksService) {}

  async execute({ taskId, user }: ReleaseTaskVolunteerCommand) {
    const task = await this.tasksService.releaseTask(taskId, user);
    return task.volunteer === null;
  }
}
