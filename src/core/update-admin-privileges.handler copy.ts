import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from './users/users.service';
import { AuthenticateCommand } from '../common/commands/authenticate.command';
import { SendTokenCommand } from '../common/commands/send-token.command';
import { UpdateAdminPrivilegesCommand } from '../common/commands/update-admin-privileges.command copy';

@CommandHandler(UpdateAdminPrivilegesCommand)
export class UpdateAdminPrivilegesHandler implements ICommandHandler<UpdateAdminPrivilegesCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ admin, userId, privileges }: UpdateAdminPrivilegesCommand) {
    const user = await this.usersService.updatePrivileges(admin, userId, privileges);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(user)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    return { user, token };
  }
}
