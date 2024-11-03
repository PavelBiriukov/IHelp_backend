import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from './users/users.service';
import { AuthenticateCommand } from '../common/commands/authenticate.command';
import { SendTokenCommand } from '../common/commands/send-token.command';
import { UpdateUserProfileCommand } from '../common/commands/update-user-profile.command';

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileHandler implements ICommandHandler<UpdateUserProfileCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ userId, dto }: UpdateUserProfileCommand) {
    const user = await this.usersService.updateProfile(userId, dto);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(user)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    return { user, token };
  }
}
