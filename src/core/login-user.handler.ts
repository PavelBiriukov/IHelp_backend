import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserCommand } from '../common/commands-and-queries/login-user.command';
import { AuthService } from './auth/auth.service';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute({ dto }: LoginUserCommand) {
    return this.authService.loginVK(dto);
  }
}
