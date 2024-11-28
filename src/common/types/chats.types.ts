import { type ObjectId } from 'mongoose';
import {
  AdminInterface,
  AnyUserInterface,
  RecipientInterface,
  VolunteerInterface,
} from './user.types';
import { MongooseIdAndTimestampsInterface } from './system.types';

export interface MessageInterface {
  _id: ObjectId | string;
  body: string;
  attaches: string[];
  createdAt: Date | string;
  author: AnyUserInterface;
  chatId: ObjectId | string | null;
}

export const ChatTypes = {
  TASK_CHAT: 'TaskChat',
  SYSTEM_CHAT: 'SystemChat',
  CONFLICT_CHAT_WITH_VOLUNTEER: 'ConflictChatWithVolunteer',
  CONFLICT_CHAT_WITH_RECIPIENT: 'ConflictChatWithRecipient',
  CONFLICT_CHAT: 'ConflictChat',
} as const;

export type ChatType = keyof typeof ChatTypes;

export interface ChatModelInterface {
  type: ChatType;
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

export type AnyChatModelInterface =
  | TaskChatInterface
  | SystemChatInterface
  | ConflictChatWithVolunteerInterface
  | ConflictChatWithRecipientInterface;

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

export type CreateTaskChatDtoType = Pick<
  TaskChatInterface,
  'taskId' | 'type' | 'volunteer' | 'recipient'
>;
