import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from './users/users.service';
import { DeactivateAdminCommand } from '../common/commands-and-queries/deactivate-admin.command';
import { AuthenticateCommand } from '../common/commands-and-queries/authenticate.command';
import { SendTokenCommand } from '../common/commands-and-queries/send-token.command';

@CommandHandler(DeactivateAdminCommand)
export class DeactivateAdminHandler implements ICommandHandler<DeactivateAdminCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ userId }: DeactivateAdminCommand) {
    const user = await this.usersService.deactivate(userId);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(user)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    return { user, token };
  }
}
