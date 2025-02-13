import { ChatType, ChatTypes } from '../types/system.types';

export function isChatType(value: any): value is ChatTypes {
  return typeof value === 'string' && Object.values(ChatType).includes(value as ChatTypes);
}
