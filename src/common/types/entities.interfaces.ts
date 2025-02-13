import { ObjectId } from 'mongoose';
import { AnyChatInterface, MessageInterface, VirginMessageInterface } from './chats.types';
import { UserRole } from './user.types';

export interface ChatEntityInterface {
  readonly chatId: ObjectId | string;
  readonly meta: AnyChatInterface;
  readonly messages: Array<MessageInterface>;
  readonly lastPost: MessageInterface;

  toObject(): { metadata: AnyChatInterface; messages: Array<MessageInterface> };

  postMessage(dto: VirginMessageInterface): Promise<ChatEntityInterface>;

  updateWatermark(role: UserRole, timestamp: Date);

  close(): Promise<ChatEntityInterface>;

  reopen(): Promise<ChatEntityInterface>;
}
