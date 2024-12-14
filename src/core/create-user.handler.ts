import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../common/commands-and-queries/create-user.command';
import { UsersService } from './users/users.service';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersService: UsersService) {}

  async execute({ dto }: CreateUserCommand) {
    return this.usersService.createUser(dto);
  }
}
