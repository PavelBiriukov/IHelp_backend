import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SetAdminPasswordCommand } from '../common/commands-and-queries/set-admin-password.command';
import { UsersService } from './users/users.service';
import { AuthenticateCommand } from '../common/commands-and-queries/authenticate.command';
import { SendTokenCommand } from '../common/commands-and-queries/send-token.command';

@CommandHandler(SetAdminPasswordCommand)
export class SetAdminPassordHandler implements ICommandHandler<SetAdminPasswordCommand> {
  constructor(
    private readonly userService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ userId, password }: SetAdminPasswordCommand) {
    const user = await this.userService.setAdminPassword(userId, password);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(user)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    return { user, token };
  }
}
