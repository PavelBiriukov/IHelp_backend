import { SystemChatInterface } from '../types/chats.types';
import { ChatType } from '../types/system.types';

export function isSystemChatInterface(val: any): val is SystemChatInterface {
  return val.type === ChatType.SYSTEM_CHAT && !!val.user;
}
