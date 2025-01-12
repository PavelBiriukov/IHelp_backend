import { MessageInterface } from '../types/chats.types';
import { compareDates } from './compare-dates';

export function getUnreadMessages(
  messages: Array<MessageInterface>,
  lastread: Date
): Array<MessageInterface> {
  const unreads = messages.filter((msg) => msg.timestamp.getTime() > lastread.getTime());
  unreads.sort((a, b) => compareDates(a.timestamp, b.timestamp));
  return unreads;
}
