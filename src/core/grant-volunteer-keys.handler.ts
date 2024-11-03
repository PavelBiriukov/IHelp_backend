import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from './users/users.service';
import { AuthenticateCommand } from '../common/commands/authenticate.command';
import { SendTokenCommand } from '../common/commands/send-token.command';
import { GrantVolunteerKeysCommand } from '../common/commands/grant-volunteer-keys.command';

@CommandHandler(GrantVolunteerKeysCommand)
export class GrantVolunteerKeysHandler implements ICommandHandler<GrantVolunteerKeysCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ userId }: GrantVolunteerKeysCommand) {
    const user = await this.usersService.grantKeys(userId);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(user)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    return { user, token };
  }
}
