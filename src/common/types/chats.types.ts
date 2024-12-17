/* eslint-disable import/no-cycle */
import { type ObjectId } from 'mongoose';
import {
  AdminInterface,
  AnyUserInterface,
  RecipientInterface,
  VolunteerInterface,
} from './user.types';
import { ChatType, ChatTypes, MongooseIdAndTimestampsInterface } from './system.types';
// eslint-disable-next-line import/no-cycle
import { Chat } from '../../datalake/chats/schemas/chat.schema';
import { SystemChat } from '../../datalake/chats/schemas/system-chat.schema';
import { TaskChat } from '../../datalake/chats/schemas/task-chat.schema';
import { ConflictChatWithVolunteer } from '../../datalake/chats/schemas/conflict-volunteer-chat.schema';
import { ConflictChatWithRecipient } from '../../datalake/chats/schemas/conflict-recipient-chat.schema';

export interface MessageModelInterface {
  body: string;
  attaches: string[];
  author: AnyUserInterface;
  chatId: ObjectId | string | null;
  timestamp: Date;
}

export interface MessageInterface extends MessageModelInterface, MongooseIdAndTimestampsInterface {}

export interface VirginMessageInterface {
  body: string;
  author: AnyUserInterface;
  chatId: ObjectId | string | null;
  attaches?: string[];
}

export type TaskChatType = typeof ChatType.TASK_CHAT;
export type SystemChatType = typeof ChatType.SYSTEM_CHAT;
export type VolunteerConflictChatType = typeof ChatType.CONFLICT_CHAT_WITH_VOLUNTEER;
export type RecipientConflictChatType = typeof ChatType.CONFLICT_CHAT_WITH_RECIPIENT;
export type AnyConflictChatType = VolunteerConflictChatType | RecipientConflictChatType;

export interface ChatModelInterface {
  type: ChatTypes;
  isActive: boolean;
}

export interface TaskChatModelInterface {
  taskId: ObjectId | string;
  volunteer: VolunteerInterface;
  recipient: RecipientInterface;
  volunteerLastReadAt: Date | null;
  recipientLastReadAt: Date | null;
}

export interface SystemChatModelInterface {
  user: VolunteerInterface | RecipientInterface;
  admin: AdminInterface;
  userLastReadAt: Date | null;
  adminLastReadAt: Date | null;
}

export interface ConflictChatModelInterface {
  taskId: ObjectId;
  opponentChat: ObjectId;
  admin: AdminInterface;
  adminLastReadAt: Date | null;
}

export interface ConflictChatWithVolunteerModelInterface extends ConflictChatModelInterface {
  volunteer: VolunteerInterface;
  volunteerLastReadAt: Date | null;
}

export interface ConflictChatWithRecipientModelInterface extends ConflictChatModelInterface {
  recipient: RecipientInterface;
  recipientLastReadAt: Date | null;
}

export interface TaskChatInterface
  extends ChatModelInterface,
    TaskChatModelInterface,
    MongooseIdAndTimestampsInterface {}

export interface SystemChatInterface
  extends ChatModelInterface,
    SystemChatModelInterface,
    MongooseIdAndTimestampsInterface {}

export interface ConflictChatWithVolunteerInterface
  extends ChatModelInterface,
    ConflictChatWithVolunteerModelInterface,
    MongooseIdAndTimestampsInterface {}

export interface ConflictChatWithRecipientInterface
  extends ChatModelInterface,
    ConflictChatWithRecipientModelInterface,
    MongooseIdAndTimestampsInterface {}

export type AnyChatInterface =
  | TaskChatInterface
  | SystemChatInterface
  | ConflictChatWithVolunteerInterface
  | ConflictChatWithRecipientInterface;

export type AnyChat =
  | Chat
  | SystemChat
  | TaskChat
  | ConflictChatWithVolunteer
  | ConflictChatWithRecipient;

export interface WatermarkInterface {
  watermark: string;
  unreads: number;
}

export interface SystemChatMetaInterface
  extends ChatModelInterface,
    Omit<SystemChatModelInterface, 'userLastReadAt' | 'adminLastReadAt'>,
    MongooseIdAndTimestampsInterface,
    WatermarkInterface {}

export interface TaskChatMetaInterface
  extends ChatModelInterface,
    Omit<TaskChatModelInterface, 'volunteerLastReadAt' | 'recipientLastReadAt'>,
    MongooseIdAndTimestampsInterface,
    WatermarkInterface {}

export interface VolunteerConflictChatMetaInterface
  extends ChatModelInterface,
    Pick<ConflictChatWithVolunteerInterface, 'volunteer'>,
    MongooseIdAndTimestampsInterface,
    WatermarkInterface {}

export interface RecipientConflictChatMetaInterface
  extends ChatModelInterface,
    Pick<ConflictChatWithRecipientInterface, 'recipient'>,
    MongooseIdAndTimestampsInterface,
    WatermarkInterface {}

export type VolunteerChatContent = Array<MessageInterface>;
export type RecipientChatContent = Array<MessageInterface>;
export type SystemChatContent = Array<MessageInterface>;
export type TaskChatContent = Array<MessageInterface>;
export type ConflictChatContentTuple = [VolunteerChatContent, RecipientChatContent];

export interface ConflictChatsTupleMetaInterface {
  moderator: AdminInterface | null;
  taskId: string;
  adminVolunteerWatermark: string;
  adminVolunteerUnreads: number;
  adminRecipientWatermark: string;
  adminRecipientUnreads: number;
  meta: [VolunteerConflictChatMetaInterface, RecipientConflictChatMetaInterface];
}

export interface ConflictChatInfo {
  meta: ConflictChatsTupleMetaInterface;
  chats: ConflictChatContentTuple;
}

export interface SystemChatInfo {
  meta: SystemChatMetaInterface;
  chats: SystemChatContent;
}

export interface TaskChatInfo {
  meta: TaskChatMetaInterface;
  chats: TaskChatContent;
}

export interface GetUserChatsResponseDtoInterface {
  task: Array<TaskChatInfo>;
  system: Array<SystemChatInfo>;
  conflict: Array<ConflictChatInfo>;
}

export interface GetAdminChatsResponseDtoInterface {
  my: Array<SystemChatInfo>;
  system: Array<SystemChatInfo>;
  moderated: Array<ConflictChatInfo>;
  conflict: Array<ConflictChatInfo>;
}

export type AnyUserChatsResponseDtoInterface =
  | GetUserChatsResponseDtoInterface
  | GetAdminChatsResponseDtoInterface;

export type CreateChatEntityDtoBaseType<T> = T extends TaskChatType
  ? Pick<TaskChatInterface, 'taskId' | 'type' | 'volunteer' | 'recipient'>
  : T extends SystemChatType
  ? Pick<SystemChatInterface, 'type' | 'user'>
  : T extends VolunteerConflictChatType
  ? Pick<ConflictChatWithVolunteerInterface, 'type' | 'taskId' | 'admin' | 'volunteer'>
  : T extends RecipientConflictChatType
  ? Pick<ConflictChatWithRecipientInterface, 'type' | 'taskId' | 'admin' | 'recipient'>
  : never;

export type CreateTaskChatEntityDtoType = CreateChatEntityDtoBaseType<TaskChatType>;
export type CreateSystemChatEntityDtoType = CreateChatEntityDtoBaseType<SystemChatType>;
export type CreateConflictVolunteerChatEntityDtoType =
  CreateChatEntityDtoBaseType<VolunteerConflictChatType>;
export type CreateConflictRecipientChatEntityDtoType =
  CreateChatEntityDtoBaseType<RecipientConflictChatType>;
export type CreateChatEntityDtoTypes =
  | CreateTaskChatEntityDtoType
  | CreateSystemChatEntityDtoType
  | CreateConflictVolunteerChatEntityDtoType
  | CreateConflictRecipientChatEntityDtoType;

export type CreateChatDtoType<T extends CreateChatEntityDtoTypes> = Omit<T, '_id' | 'type'>;
