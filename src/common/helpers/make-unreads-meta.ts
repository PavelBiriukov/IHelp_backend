import { MessageInterface } from '../types/chats.types';

export function makeUnreadsMeta(unreads: Array<MessageInterface>): [number, string] {
  const [watermark] = unreads;
  return [unreads.length, watermark.timestamp.toISOString()];
}
