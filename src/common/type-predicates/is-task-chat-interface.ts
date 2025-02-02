import { TaskChatInterface } from '../types/chats.types';
import { ChatType } from '../types/system.types';

export function isTaskChatInterface(val: any): val is TaskChatInterface {
  return val.type === ChatType.TASK_CHAT && !!val.volunteer && !!val.recipient;
}
