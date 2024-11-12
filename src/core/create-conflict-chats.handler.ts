import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import mongoose from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { CreateConflictChatsCommand } from '../common/commands/create-conflict-chats.command';
import { ChatService } from './chat/chats.service';
import { ChatsRepository } from '../datalake/chats/chats.repository';
import {
  ConflictChatsTupleMetaInterface,
  RecipientConflictChatMetaInterface,
  TaskChatModelInterface,
  VolunteerConflictChatMetaInterface,
} from '../common/types/chats.types';
import { UserRole, UserStatus } from '../common/types/user.types';

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
const mockchatTask = {
  taskId: new mongoose.Types.ObjectId().toHexString(),
  volunteer: mockVolunteer,
  recipient: mockRecipient,
  volunteerLastReadAt: null,
  recipientLastReadAt: null,
};

@CommandHandler(CreateConflictChatsCommand)
export class CreateConflictChatsHandler implements ICommandHandler<CreateConflictChatsCommand> {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatsRepo: ChatsRepository
  ) {}

  async execute({ taskId, moderator }: CreateConflictChatsCommand) {
    let chatTask: TaskChatModelInterface = await this.chatsRepo.findOne({ taskId });
    chatTask = mockchatTask; // удалить после реализации ChatService
    if (!chatTask) {
      throw new NotFoundException(`Чата по задаче с id:${taskId} не существует`);
    }
    const volunteerChatsMeta = await this.chatService.getUserChatsMeta(chatTask.volunteer._id);
    const volunteerChat = volunteerChatsMeta.find(
      (chat) => (chat as VolunteerConflictChatMetaInterface).type === 'CONFLICT_CHAT_WITH_VOLUNTEER'
    ) as VolunteerConflictChatMetaInterface;

    const recipientChatsMeta = await this.chatService.getUserChatsMeta(chatTask.recipient._id);
    const recipientChat = recipientChatsMeta.find(
      (chat) => (chat as RecipientConflictChatMetaInterface).type === 'CONFLICT_CHAT_WITH_RECIPIENT'
    ) as RecipientConflictChatMetaInterface;
    const conflictChatMetadate: ConflictChatsTupleMetaInterface = {
      taskId,
      moderator,
      adminVolunteerWatermark: '',
      adminVolunteerUnreads: 0,
      adminRecipientWatermark: '',
      adminRecipientUnreads: 0,
      meta: [volunteerChat, recipientChat],
    };
    return this.chatService.createConflictChat(conflictChatMetadate);
  }
}
