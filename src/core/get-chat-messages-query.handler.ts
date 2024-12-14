import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetChatMessagesQuery } from '../common/queries/get-chat-messages.query';
import { ChatService } from './chat/chats.service';

@QueryHandler(GetChatMessagesQuery)
export class GetChatMessagesQueryHandler implements IQueryHandler<GetChatMessagesQuery> {
  constructor(private readonly chatService: ChatService) {}

  async execute({ chatId, skip = 0, limit = 0 }: GetChatMessagesQuery) {
    return this.chatService.getMessages(chatId, skip, limit);
  }
}
