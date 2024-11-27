import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddChatMessageCommand } from '../common/commands/add-chat-message.command';
import { WebsocketApiGateway } from '../api/websocket-api/websocket-api.gateway';
import { ChatService } from './chat/chats.service';

@CommandHandler(AddChatMessageCommand)
export class AddChatMessageHandler implements ICommandHandler<AddChatMessageCommand> {
  constructor(
    private readonly websocketApiGateway: WebsocketApiGateway,
    private readonly chatService: ChatService
  ) {}

  async execute({ message }: AddChatMessageCommand) {
    const savedMessage = await this.chatService.addMessage(message);
    return this.websocketApiGateway.sendNewMessage(savedMessage);
  }
}
