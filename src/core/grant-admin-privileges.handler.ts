import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from './users/users.service';
import { AuthenticateCommand } from '../common/commands/authenticate.command';
import { SendTokenCommand } from '../common/commands/send-token.command';
import { GrantAdminPrivilegesCommand } from '../common/commands/grant-admin-privileges.command';

@CommandHandler(GrantAdminPrivilegesCommand)
export class GrantAdminPrivilegesHandler implements ICommandHandler<GrantAdminPrivilegesCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ admin, userId, privileges }: GrantAdminPrivilegesCommand) {
    const user = await this.usersService.grantPrivileges(admin, userId, privileges);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(user)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    return { user, token };
  }
}
