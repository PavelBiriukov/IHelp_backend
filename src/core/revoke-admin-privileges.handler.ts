import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RevokeAdminPrivilegesCommand } from '../common/commands/revoke-admin-privileges.command';
import { UsersService } from './users/users.service';
import { AuthenticateCommand } from '../common/commands/authenticate.command';
import { SendTokenCommand } from '../common/commands/send-token.command';

@CommandHandler(RevokeAdminPrivilegesCommand)
export class RevokeAdminPrivilegesHandler implements ICommandHandler<RevokeAdminPrivilegesCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ admin, userId, privileges }: RevokeAdminPrivilegesCommand) {
    const user = await this.usersService.revokePrivileges(admin, userId, privileges);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(user)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    return { user, token };
  }
}
