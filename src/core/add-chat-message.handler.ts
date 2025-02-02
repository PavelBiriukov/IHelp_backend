import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddChatMessageCommand } from '../common/commands/add-chat-message.command';
import { WebsocketApiGateway } from '../api/websocket-api/websocket-api.gateway';
import { ChatService } from './chat/chat.service';
import { ensureStringId } from '../common/helpers/ensure-string-id';

@CommandHandler(AddChatMessageCommand)
export class AddChatMessageHandler implements ICommandHandler<AddChatMessageCommand> {
  constructor(
    private readonly websocketApiGateway: WebsocketApiGateway,
    private readonly chatService: ChatService
  ) {}

  async execute({ message }: AddChatMessageCommand) {
    const savedMessage = await this.chatService.addMessage(message);
    const meta = await this.chatService.getFreshMetaForOpponent(
      ensureStringId(savedMessage.chatId),
      ensureStringId(savedMessage.author._id)
    );
    return Promise.all([
      this.websocketApiGateway.sendNewMessage(savedMessage),
      this.websocketApiGateway.sendFreshMeta(savedMessage.author._id, meta),
    ]);
  }
}
