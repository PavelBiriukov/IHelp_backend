import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendTokenCommand } from '../common/commands/send-token.command';
import { WebsocketApiGateway } from '../api/websocket-api/websocket-api.gateway';

@CommandHandler(SendTokenCommand)
export class SendTokenHandler implements ICommandHandler<SendTokenCommand> {
  constructor(private readonly websocketApiGateway: WebsocketApiGateway) {}

  async execute({ user, token }: SendTokenCommand) {
    return this.websocketApiGateway.sendTokenAndUpdatedUser(user, token);
  }
}
