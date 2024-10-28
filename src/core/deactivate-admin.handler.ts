import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from './users/users.service';
import { DeactivateAdminCommand } from '../common/commands/deactivate-admin.command';

@CommandHandler(DeactivateAdminCommand)
export class DeactivateAdminHandler implements ICommandHandler<DeactivateAdminCommand> {
  constructor(private readonly usersService: UsersService) {}

  async execute({ userId }: DeactivateAdminCommand) {
    const user = await this.usersService.deactivate(userId);
    return user;
  }
}
