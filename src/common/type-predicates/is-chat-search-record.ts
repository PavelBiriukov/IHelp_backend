import { ChatSearchRecord } from '../types/chats.types';
import { CHAT_SEARCH_FIELDS } from '../constants/type-narrowing-arrays';

export function isChatSearchRecord(value: unknown): value is ChatSearchRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).every((key) => CHAT_SEARCH_FIELDS.includes(key))
  );
}
