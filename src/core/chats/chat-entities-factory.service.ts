// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { ChatsRepository } from '../../datalake/chats/chats.repository';
import { MessagesRepository } from '../../datalake/messages/messages.repository';
// import { ChatType } from '../../common/types/chats.types';
// import { MongooseIdAndTimestampsInterface } from '../../common/types/system.types';
// import { ChatEntityInterface, MetadataType, ChatEntity } from '../../entities/chats/chat.entity.ts';

@Injectable()
export class ChatEntitiesFactory {
  constructor(
    private readonly _chatsRepository: ChatsRepository,
    private readonly _messagesRepository: MessagesRepository
  ) {}

  // public async createChatEntity(
  //   kind: ChatType,
  //   metadata: MetadataType | null
  // ): Promise<ChatEntityInterface<T>> {
  //   if (!metadata) {
  //     throw new InternalServerErrorException('Ошибка сервера!', {
  //       cause: `Некорректно переданы метаданные! metadata: ${kind}`,
  //     });
  //   }

  //   const dto = { ...metadata, isActive: true };
  //   const chatEntityData = (await this._chatsRepository.create(
  //     dto
  //   )) as MongooseIdAndTimestampsInterface & MetadataType;

  //   if (!chatEntityData) {
  //     throw new InternalServerErrorException('Ошибка сервера!', {
  //       cause: `Данные, вернувшиеся из базы данных: ${chatEntityData}`,
  //     });
  //   }

  //   return new ChatEntity(kind, chatEntityData);
  // }
}
