import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ChatService } from './chat/chats.service';
import { GetUserChatsMetaQuery } from '../common/queries/get-user-chats-meta.query';

@QueryHandler(GetUserChatsMetaQuery)
export class GetUserChatsMetaHandler implements IQueryHandler<GetUserChatsMetaQuery> {
  constructor(private readonly chatService: ChatService) {}

  async execute(query: GetUserChatsMetaQuery) {
    const { userId } = query;
    return this.chatService.getUserChatsMeta(userId);
  }
}
