import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from './users/users.service';
import { AuthenticateCommand } from '../common/commands/authenticate.command';
import { SendTokenCommand } from '../common/commands/send-token.command';
import { ConfirmUserCommand } from '../common/commands/confirm-user.command';

@CommandHandler(ConfirmUserCommand)
export class ConfirmUserHandler implements ICommandHandler<ConfirmUserCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ userId }: ConfirmUserCommand) {
    const user = await this.usersService.confirm(userId);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(user)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    return { user, token };
  }
}
