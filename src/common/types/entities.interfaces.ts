import { ObjectId } from 'mongoose';
import {
  AnyChatInterface,
  CreateChatEntityDtoTypes,
  MessageInterface,
  VirginMessageInterface,
} from './chats.types';

export interface ChatEntityInterface {
  readonly chatId: ObjectId | string;
  readonly meta: AnyChatInterface;
  readonly messages: Array<MessageInterface>;

  create(dto: CreateChatEntityDtoTypes): Promise<ChatEntityInterface>;

  toObject(): { metadata: AnyChatInterface; messages: Array<MessageInterface> };

  setOpponentChat(opponentChatId: ObjectId | string): Promise<ChatEntityInterface>;

  find(chatId: string): Promise<ChatEntityInterface>;

  find(dto: Record<string, unknown>): Promise<ChatEntityInterface>;

  find(...data): Promise<ChatEntityInterface>;

  postMessage(dto: VirginMessageInterface): Promise<MessageInterface>;

  close(): Promise<ChatEntityInterface>;

  reopen(): Promise<ChatEntityInterface>;
}
