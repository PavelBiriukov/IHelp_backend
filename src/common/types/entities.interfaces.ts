import { ObjectId } from 'mongoose';
import {
  AnyChatInterface,
  CreateChatEntityDtoTypes,
  MessageInterface,
  VirginMessageInterface,
} from './chats.types';
import { ChatType } from './system.types';

export interface ChatEntityInterface<T extends typeof ChatType> {
  readonly chatId: ObjectId | string;
  readonly meta: AnyChatInterface;
  readonly messages: Array<MessageInterface>;

  create(dto: CreateChatEntityDtoTypes): Promise<ChatEntityInterface<T>>;

  toObject(): { metadata: AnyChatInterface; messages: Array<MessageInterface> };

  setOpponentChat(opponentChatId: ObjectId | string): Promise<ChatEntityInterface<T>>;

  find(chatId: string): Promise<ChatEntityInterface<T>>;

  find(dto: Record<string, unknown>): Promise<ChatEntityInterface<T>>;

  find(...data): Promise<ChatEntityInterface<T>>;

  postMessage(dto: VirginMessageInterface): Promise<MessageInterface>;

  close(): Promise<ChatEntityInterface<T>>;

  reopen(): Promise<ChatEntityInterface<T>>;
}
