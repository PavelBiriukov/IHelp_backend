import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from './users/users.service';
import { AuthenticateCommand } from '../common/commands/authenticate.command';
import { SendTokenCommand } from '../common/commands/send-token.command';
import { UpdateVolunteerProfileCommand } from '../common/commands/update-volunteer-profile.command';

@CommandHandler(UpdateVolunteerProfileCommand)
export class UpdateVolunteerProfileHandler
  implements ICommandHandler<UpdateVolunteerProfileCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus
  ) {}

  async execute({ userId, dto }: UpdateVolunteerProfileCommand) {
    const user = await this.usersService.updateVolunteerProfile(userId, dto);
    const token = await this.commandBus.execute<AuthenticateCommand, string>(
      new AuthenticateCommand(user)
    );
    this.commandBus.execute<SendTokenCommand, string>(new SendTokenCommand(user, token));
    return { user, token };
  }
}
