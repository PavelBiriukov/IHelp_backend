import { MessageInterface } from '../types/chats.types';

export function makeUnreadsMeta(unreads: Array<MessageInterface>): [number, string] {
  const [watermark] = unreads;
  if (!watermark) {
    return [0, null];
  }
  return [
    unreads.length,
    typeof watermark.timestamp === 'string'
      ? watermark.timestamp
      : watermark?.timestamp?.toISOString(),
  ];
}
