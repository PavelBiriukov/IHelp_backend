import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SetAdminPasswordCommand } from '../common/commands/set-admin-password.command';
import { UsersService } from './users/users.service';
import { AuthenticateCommand } from '../common/commands/authenticate.command';
import { SendTokenCommand } from '../common/commands/send-token.command';

@CommandHandler(SetAdminPasswordCommand)
export class SetAdminPassordHandler implements ICommandHandler<SetAdminPasswordCommand> {
  constructor(
    private readonly userService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ userId, password }: SetAdminPasswordCommand) {
    const admin = await this.userService.setAdminPassword(userId, password);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(admin)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(admin, token));
    return { admin, token };
  }
}
