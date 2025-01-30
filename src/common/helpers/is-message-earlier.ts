import { MessageInterface } from '../types/chats.types';
import { ensureDate } from './ensure-date';

export function isMessageEarlier(msg: MessageInterface, timestamp: Date): boolean {
  return ensureDate(msg.timestamp).getTime() > timestamp.getTime();
}
