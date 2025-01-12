import { MessageInterface } from '../types/chats.types';

export function isMessageEarlier(msg: MessageInterface, timestamp: Date): boolean {
  return msg.timestamp.getTime() > timestamp.getTime();
}
