import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from './users/users.service';
import { DeactivateAdminCommand } from '../common/commands/deactivate-admin.command';
import { BlockUserCommand } from '../common/commands/block-user.command';

@CommandHandler(BlockUserCommand)
export class BlockUserHandler implements ICommandHandler<BlockUserCommand> {
  constructor(private readonly usersService: UsersService) {}

  async execute({ userId }: DeactivateAdminCommand) {
    const user = await this.usersService.block(userId);
    return user;
  }
}
