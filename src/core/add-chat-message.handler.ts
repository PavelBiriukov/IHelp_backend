import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddChatMessageCommand } from '../common/commands/add-chat-message.command';
import { WebsocketApiGateway } from '../api/websocket-api/websocket-api.gateway';
import { ChatService } from './chat/chat.service';
import { wsUserStatus } from '../common/types/websockets.types';

@CommandHandler(AddChatMessageCommand)
export class AddChatMessageHandler implements ICommandHandler<AddChatMessageCommand> {
  constructor(
    private readonly websocketApiGateway: WebsocketApiGateway,
    private readonly chatService: ChatService
  ) {}

  async execute({ message }: AddChatMessageCommand) {
    const {
      message: msg,
      author: { _id: authorId, meta: authorMeta },
      counterparty: { _id: counterpartyId, meta: counterpartyMeta },
    } = await this.chatService.addMessage(message);
    const [authorStatus, counterpartyStatus] = await Promise.all<wsUserStatus>([
      this.websocketApiGateway.getUserStatus(authorId, msg.chatId),
      this.websocketApiGateway.getUserStatus(counterpartyId, msg.chatId),
    ]);

    if (authorStatus.isOnline && !!authorStatus.isInChat) {
      return Promise.all([
        this.websocketApiGateway.sendNewMessage(msg),
        this.websocketApiGateway.sendFreshMeta(authorId, authorMeta),
      ]);
    }
    if (counterpartyStatus.isOnline && !counterpartyStatus.isInChat) {
      return Promise.all([
        this.websocketApiGateway.sendNewMessage(msg),
        this.websocketApiGateway.sendFreshMeta(counterpartyId, counterpartyMeta),
      ]);
    }
  }
}
