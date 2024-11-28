import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthenticateCommand } from '../common/commands-and-queries/authenticate.command';
import { AuthService } from './auth/auth.service';

@CommandHandler(AuthenticateCommand)
export class AuthenticateHandler implements ICommandHandler<AuthenticateCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute({ dto }: AuthenticateCommand) {
    return this.authService.authenticate(dto);
  }
}
