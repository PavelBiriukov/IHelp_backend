import { MessageInterface } from '../types/chats.types';
import { compareDates } from './compare-dates';
import { ensureDate } from './ensure-date';

export function getUnreadMessages(
  messages: Array<MessageInterface>,
  lastread: Date
): Array<MessageInterface> {
  if (lastread === null && messages.length > 0) {
    return messages;
  }
  if (messages.length === 0 || !lastread) {
    return [];
  }
  const unreads = messages.filter(
    (msg) => ensureDate(msg.timestamp).getTime() > lastread.getTime()
  );
  unreads.sort((a, b) => compareDates(ensureDate(a.timestamp), ensureDate(b.timestamp)));
  return unreads;
}
