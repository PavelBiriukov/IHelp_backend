import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from './users/users.service';
import { AuthenticateCommand } from '../common/commands-and-queries/authenticate.command';
import { SendTokenCommand } from '../common/commands-and-queries/send-token.command';
import { UpgradeUserCommand } from '../common/commands-and-queries/upgrade-user.command';

@CommandHandler(UpgradeUserCommand)
export class UpgradeUserHandler implements ICommandHandler<UpgradeUserCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ userId }: UpgradeUserCommand) {
    const user = await this.usersService.upgrade(userId);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(user)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    return { user, token };
  }
}
