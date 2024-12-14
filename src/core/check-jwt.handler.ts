import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CheckJwtCommand } from '../common/commands-and-queries/check-jwt.command';
import { AuthService } from './auth/auth.service';

@CommandHandler(CheckJwtCommand)
export class CheckJwtHandler implements ICommandHandler<CheckJwtCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute({ jwt }: CheckJwtCommand) {
    return this.authService.checkJWT(jwt);
  }
}
