import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetChatMessagesQuery } from '../common/queries/get-chat-messages.query';
import { ChatService } from './chat/chat.service';

@QueryHandler(GetChatMessagesQuery)
export class GetChatMessagesQueryHandler implements IQueryHandler<GetChatMessagesQuery> {
  constructor(private readonly chatService: ChatService) {}

  async execute(dto: GetChatMessagesQuery) {
    return this.chatService.getMessages(dto);
  }
}
