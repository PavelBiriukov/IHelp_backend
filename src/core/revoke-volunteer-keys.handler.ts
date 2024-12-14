import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from './users/users.service';
import { AuthenticateCommand } from '../common/commands-and-queries/authenticate.command';
import { SendTokenCommand } from '../common/commands-and-queries/send-token.command';
import { RevokeVolunteerKeysCommand } from '../common/commands-and-queries/revoke-volunteer-keys.command';

@CommandHandler(RevokeVolunteerKeysCommand)
export class RevokeVolunteerKeysHandler implements ICommandHandler<RevokeVolunteerKeysCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ userId }: RevokeVolunteerKeysCommand) {
    const user = await this.usersService.revokeKeys(userId);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(user)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    return { user, token };
  }
}
