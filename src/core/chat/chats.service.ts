import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import mongoose, { ObjectId } from 'mongoose';

import {
  ConflictChatsTupleMetaInterface,
  RecipientConflictChatMetaInterface,
  SystemChatMetaInterface,
  CreateTaskChatDtoType,
  VolunteerConflictChatMetaInterface,
  MessageInterface,
} from '../../common/types/chats.types';
import { AdminInterface, UserRole, UserStatus } from '../../common/types/user.types';
import { wsChatPageQueryPayload, WsNewMessage } from '../../common/types/websockets.types';

// #region Mock data

const mockVolunteer = {
  _id: 'volunteerId',
  role: UserRole.VOLUNTEER,
  name: 'Volunteer',
  phone: 'phone',
  avatar: 'avatar',
  address: 'address',
  vkId: 'vkId',
  score: 0,
  status: UserStatus.CONFIRMED,
  location: undefined,
  keys: false,
  tasksCompleted: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  permissions: [],
  login: 'login',
  password: 'password',
  isRoot: false,
  isActive: false,
};

const mockRecipient = {
  _id: 'recepientId',
  role: UserRole.RECIPIENT,
  name: 'Recepient',
  phone: 'phone',
  avatar: 'avatar',
  address: 'address',
  vkId: 'vkId',
  score: 0,
  status: UserStatus.CONFIRMED,
  location: undefined,
  keys: false,
  tasksCompleted: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  permissions: [],
  login: 'login',
  password: 'password',
  isRoot: false,
  isActive: false,
};

const mockAdmin: AdminInterface = {
  _id: 'recepientId',
  role: UserRole.ADMIN,
  name: 'Recepient',
  phone: 'phone',
  avatar: 'avatar',
  address: 'address',
  vkId: 'vkId',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  permissions: [],
  login: 'login',
  password: 'password',
  isRoot: false,
  isActive: false,
};

const mockMessages: Array<MessageInterface> = [
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    body: 'TestBody1',
    attaches: [
      new mongoose.Types.ObjectId().toHexString(),
      new mongoose.Types.ObjectId().toHexString(),
    ],
    createdAt: new Date(),
    author: mockVolunteer,
    chatId: new mongoose.Types.ObjectId().toHexString(),
  },
  {
    _id: new mongoose.Types.ObjectId().toHexString(),
    body: 'TestBody2',
    attaches: [
      new mongoose.Types.ObjectId().toHexString(),
      new mongoose.Types.ObjectId().toHexString(),
    ],
    createdAt: new Date(),
    author: mockRecipient,
    chatId: new mongoose.Types.ObjectId().toHexString(),
  },
];

const mockResponseMessage = {
  data: {
    messages: mockMessages,
  },
};

const mockTaskChatMeta = {
  _id: new mongoose.Types.ObjectId().toHexString(),
  type: 'TASK_CHAT',
  isActive: true,
  taskId: new mongoose.Types.ObjectId().toHexString(),
  volunteer: mockVolunteer,
  recipient: mockRecipient,
  id: 'test',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  watermark: new mongoose.Types.ObjectId().toHexString(),
  unreads: 1,
};

const mockSystemChatMeta: SystemChatMetaInterface = {
  _id: new mongoose.Types.ObjectId().toHexString(),
  type: 'SYSTEM_CHAT',
  isActive: true,
  user: mockRecipient,
  admin: mockAdmin,
  id: 'test2',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  watermark: new mongoose.Types.ObjectId().toHexString(),
  unreads: 1,
};

const mockVolunteerChat: VolunteerConflictChatMetaInterface = {
  _id: new mongoose.Types.ObjectId().toHexString(),
  type: 'CONFLICT_CHAT_WITH_VOLUNTEER',
  isActive: true,
  volunteer: mockVolunteer,
  id: '10',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  watermark: new mongoose.Types.ObjectId().toHexString(),
  unreads: 10,
};

const mockRecipientChat: RecipientConflictChatMetaInterface = {
  _id: new mongoose.Types.ObjectId().toHexString(),
  type: 'CONFLICT_CHAT_WITH_RECIPIENT',
  isActive: true,
  recipient: mockRecipient,
  id: '20',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  watermark: new mongoose.Types.ObjectId().toHexString(),
  unreads: 10,
};

const mockConflictChats: ConflictChatsTupleMetaInterface = {
  moderator: mockAdmin,
  taskId: 'test3',
  adminVolunteerWatermark: 'adminVolunteerWatermark',
  adminVolunteerUnreads: 10,
  adminRecipientWatermark: 'adminRecipientWatermark',
  adminRecipientUnreads: 11,
  meta: [mockVolunteerChat, mockRecipientChat],
};

const mockMetaArray = [mockTaskChatMeta, mockSystemChatMeta, mockVolunteerChat];
// #endregion

@Injectable()
export class ChatService {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createTaskChat(metadata: CreateTaskChatDtoType) {
    // const chatEntity = new ChatEntity();

    // const newChat = await chatEntity.createChat('TASK_CHAT', metadata);
    // const chatMessages = await newChat.loadMessages([newChat.chatId], 0, 0);

    // const response: wsMessage = {
    //   kind: 'CHAT_PAGE_CONTENT',
    //   payload: {
    //     messages: chatMessages
    //   }
    // }

    // return response;

    // eslint-disable-next-line no-console
    console.log('Creating task chat.\nMeta:');
    console.dir(metadata);
    return mockTaskChatMeta;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createSystemChat(metadata: SystemChatMetaInterface): Promise<SystemChatMetaInterface> {
    // eslint-disable-next-line no-console
    console.log('Creating system chat');
    return mockSystemChatMeta;
  }

  async createConflictChat(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    metadata: ConflictChatsTupleMetaInterface
  ): Promise<ConflictChatsTupleMetaInterface> {
    // eslint-disable-next-line no-console
    console.log('Creating conflict chat');
    return mockConflictChats;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addMessage(message: WsNewMessage) {
    // const chatEntity = new ChatEntity();

    // const chat = await chatEntity.findChatByParams({ chatId: chatId });
    // chat.addMessage(message);

    // const chatMessages = await chat.loadMessages([chat.chatId], 0, 0);

    // const response: wsMessageData = {
    //   data: {
    //     messages: chatMessages
    //   }
    // }

    // return response;

    // eslint-disable-next-line no-console
    console.log('Adding message into chat');
    console.dir(message);
    return {
      ...message,
      _id: new mongoose.Types.ObjectId().toHexString(),
      createdAt: new Date().toISOString(),
    } as MessageInterface;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getConflictChatsByAdmin(userId: ObjectId, chatQuery: wsChatPageQueryPayload) {
    // eslint-disable-next-line no-console
    console.log('Getting conflict chats by admin');
    return mockResponseMessage;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getConflictClosedChats(chatQuery: wsChatPageQueryPayload) {
    // eslint-disable-next-line no-console
    console.log('Getting conflict closed chats');
    return mockResponseMessage;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getOpenSystemChats(chatQuery: wsChatPageQueryPayload) {
    // eslint-disable-next-line no-console
    console.log('Getting open system chats');
    return mockResponseMessage;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getClosedSystemChats(chatQuery: wsChatPageQueryPayload) {
    // eslint-disable-next-line no-console
    console.log('Getting closed system chats');
    return mockResponseMessage;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getSystemChatsByUser(userId: ObjectId, chatQuery: wsChatPageQueryPayload) {
    // eslint-disable-next-line no-console
    console.log('Getting system chats by user');
    return mockResponseMessage;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getOpenSystemChatsByAdmin(userId: ObjectId, chatQuery: wsChatPageQueryPayload) {
    // eslint-disable-next-line no-console
    console.log('Getting open system chats by admin');
    return mockResponseMessage;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getClosedSystemChatsByAdmin(userId: ObjectId, chatQuery: wsChatPageQueryPayload) {
    // eslint-disable-next-line no-console
    console.log('Getting closed system chats by admin');
    return mockResponseMessage;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async closeChatByTask(taskId: ObjectId) {
    // const chatEntity = new ChatEntity();

    // const chat = await chatEntity.findChatByParams({ taskId: taskId });
    // chat.closeChat();

    // eslint-disable-next-line no-console
    console.log('Closing chat by task');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async closeConflictChats(chatId: string) {
    // eslint-disable-next-line no-console
    console.log('Closing conflict chats');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async closeSystemChat(chatId: string) {
    // eslint-disable-next-line no-console
    console.log('Closing system chat');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserChatsMeta(userId: string | ObjectId) {
    // eslint-disable-next-line no-console
    console.log('Getting user meta');
    return mockMetaArray;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getMessages(chatId: string | ObjectId, skip: number, limit?: number) {
    // eslint-disable-next-line no-console
    console.log('Getting messages');
    return mockMessages;
  }
}
