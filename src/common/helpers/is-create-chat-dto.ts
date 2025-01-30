import {
  CreateConflictChatsTupleDtoType,
  CreateConflictRecipientChatEntityDtoType,
  CreateConflictVolunteerChatEntityDtoType,
  CreateSystemChatEntityDtoType,
  CreateTaskChatEntityDtoType,
} from '../types/chats.types';
import { ChatType } from '../types/system.types';

export function isCreateVolunteerConflictChatDto(
  value: unknown
): value is CreateConflictVolunteerChatEntityDtoType {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).includes('admin') &&
    Object.keys(value).includes('volunteer') &&
    Object.keys(value).includes(ChatType.CONFLICT_CHAT_WITH_VOLUNTEER)
  );
}

export function isCreateRecipientConflictChatDto(
  value: unknown
): value is CreateConflictRecipientChatEntityDtoType {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).includes('admin') &&
    Object.keys(value).includes('recipient') &&
    Object.keys(value).includes(ChatType.CONFLICT_CHAT_WITH_RECIPIENT)
  );
}

export function isCreateConflictChatTuple(
  value: unknown
): value is CreateConflictChatsTupleDtoType {
  if (typeof value !== 'object' || value === null || !Array.isArray(value)) {
    return false;
  }
  if (value.length !== 2) {
    return false;
  }
  const [vDto, rDto] = value;
  return isCreateVolunteerConflictChatDto(vDto) && isCreateRecipientConflictChatDto(rDto);
}

export function isCreateTaskChatDto(value: any): value is CreateTaskChatEntityDtoType {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).includes('volunteer') &&
    Object.keys(value).includes('recipient') &&
    Object.keys(value).includes('taskId') &&
    Object.values(value).includes(ChatType.TASK_CHAT)
  );
}

export function isCreateSystemChatDto(value: unknown): value is CreateSystemChatEntityDtoType {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).includes('user') &&
    Object.keys(value).includes('admin') &&
    Object.keys(value).includes(ChatType.SYSTEM_CHAT)
  );
}
