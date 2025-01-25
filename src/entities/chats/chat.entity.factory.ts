/* eslint-disable no-empty-function */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Chat } from '../../datalake/chats/schemas/chat.schema';
import { Message } from '../../datalake/messages/schemas/messages.schema';
import { ChatEntity } from './chat.entity';
import {
  AnyChat,
  ChatMetadata,
  ChatSearchRecord,
  CreateChatEntityDtoTypes,
  CreateConflictChatsTupleDtoType,
  CreateConflictRecipientChatEntityDtoType,
  CreateConflictVolunteerChatEntityDtoType,
  CreateSystemChatEntityDtoType,
  CreateTaskChatEntityDtoType,
} from '../../common/types/chats.types';
import { ChatType, ChatTypes } from '../../common/types/system.types';
import { TaskChat } from '../../datalake/chats/schemas/task-chat.schema';
import { SystemChat } from '../../datalake/chats/schemas/system-chat.schema';
import { ConflictChatWithVolunteer } from '../../datalake/chats/schemas/conflict-volunteer-chat.schema';
import { ConflictChatWithRecipient } from '../../datalake/chats/schemas/conflict-recipient-chat.schema';
import { isChatType } from '../../common/helpers/is-chat-type';
import {
  isCreateConflictChatTuple,
  isCreateSystemChatDto,
  isCreateTaskChatDto,
} from '../../common/helpers/is-create-chat-dto';
import { isObjectId } from '../../common/helpers/is-objectid';
import { isChatSearchRecord } from '../../common/helpers/is-chat-search-record';

@Injectable()
export class ChatsFactory {
  constructor(
    @InjectModel(Chat.name) private readonly chatsRepo: Model<Chat>,
    @InjectModel(Message.name) private readonly messagesRepo: Model<Message>
  ) {}

  private static _prepareMeta(chat: AnyChat): ChatMetadata {
    const { _id, type, createdAt, updatedAt, isActive } = chat as Chat;
    const meta: ChatMetadata = {
      _adminLastReadAt: null,
      _createdAt: createdAt,
      _doc: null,
      _lastPost: null,
      _messages: null,
      _opponentChat: null,
      _recipient: null,
      _recipientLastReadAt: null,
      _taskId: null,
      _type: type,
      _updatedAt: updatedAt,
      _user: null,
      _userLastReadAt: null,
      _volunteer: null,
      _volunteerLastReadAt: null,
      _id,
      _isActive: isActive,
      _admin: null,
    };
    switch (type) {
      case ChatType.TASK_CHAT: {
        const { taskId, volunteer, recipient, volunteerLastReadAt, recipientLastReadAt } =
          chat as TaskChat;
        meta._taskId = taskId;
        meta._volunteer = volunteer;
        meta._recipient = recipient;
        meta._volunteerLastReadAt = volunteerLastReadAt;
        meta._recipientLastReadAt = recipientLastReadAt;
        break;
      }
      case ChatType.SYSTEM_CHAT: {
        const { user, admin, userLastReadAt, adminLastReadAt } = chat as SystemChat;
        meta._user = user;
        meta._admin = admin;
        meta._userLastReadAt = userLastReadAt;
        meta._adminLastReadAt = adminLastReadAt;
        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_VOLUNTEER: {
        const { taskId, volunteer, admin, opponentChat, volunteerLastReadAt, adminLastReadAt } =
          chat as ConflictChatWithVolunteer;
        meta._taskId = taskId;
        meta._volunteer = volunteer;
        meta._admin = admin;
        meta._opponentChat = opponentChat;
        meta._volunteerLastReadAt = volunteerLastReadAt;
        meta._adminLastReadAt = adminLastReadAt;

        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_RECIPIENT: {
        const { taskId, recipient, admin, opponentChat, recipientLastReadAt, adminLastReadAt } =
          chat as ConflictChatWithRecipient;
        meta._taskId = taskId;
        meta._recipient = recipient;
        meta._admin = admin;
        meta._opponentChat = opponentChat;
        meta._recipientLastReadAt = recipientLastReadAt;
        meta._adminLastReadAt = adminLastReadAt;
        break;
      }
      default:
        throw new InternalServerErrorException(
          { message: 'Внутренняя ошибка сервера' },
          { cause: `У сущности чата установлен неверный тип чата: "${type}".` }
        );
    }
    return meta;
  }

  private async _makeEntity(dto: CreateChatEntityDtoTypes): Promise<ChatEntity> {
    const doc = (await (
      await this.chatsRepo.create(dto as CreateChatEntityDtoTypes)
    ).save()) as AnyChat;
    return new ChatEntity(ChatsFactory._prepareMeta(doc), doc, this.chatsRepo, this.messagesRepo);
  }

  public async create(type: 'TASK_CHAT', dto: CreateTaskChatEntityDtoType): Promise<ChatEntity>;

  public async create(type: 'SYSTEM_CHAT', dto: CreateSystemChatEntityDtoType): Promise<ChatEntity>;

  public async create(
    type: 'CONFLICT_CHAT',
    dto: [CreateConflictVolunteerChatEntityDtoType, CreateConflictRecipientChatEntityDtoType]
  ): Promise<[ChatEntity, ChatEntity]>;

  public async create(
    type: ChatTypes,
    dto: CreateChatEntityDtoTypes | CreateConflictChatsTupleDtoType
  ): Promise<ChatEntity | [ChatEntity, ChatEntity]> {
    if (!isChatType(type)) {
      throw new InternalServerErrorException(
        { message: 'Внутренняя ошибка сервера' },
        { cause: `В метод ChatsFactory.create() передан неверный аргумент type "${type}".` }
      );
    }
    if (type === ChatType.CONFLICT_CHAT && !isCreateConflictChatTuple(dto)) {
      throw new InternalServerErrorException(
        { message: 'Внутренняя ошибка сервера' },
        { cause: `В метод ChatsFactory.create() передан неверный аргумент dto "${dto}".` }
      );
    }
    switch (type) {
      case ChatType.TASK_CHAT: {
        if (!isCreateTaskChatDto(dto)) {
          throw new InternalServerErrorException(
            { message: 'Внутренняя ошибка сервера' },
            {
              cause: `В метод ChatsFactory.create() с аргументом type === ChatType.TASK_CHAT передан неверный аргумент dto "${dto}".`,
            }
          );
        }
        return this._makeEntity(dto);
      }
      case ChatType.SYSTEM_CHAT: {
        if (!isCreateSystemChatDto(dto)) {
          throw new InternalServerErrorException(
            { message: 'Внутренняя ошибка сервера' },
            {
              cause: `В метод ChatsFactory.create() с аргументом type === ChatType.SYSTEM_CHAT передан неверный аргумент dto "${dto}".`,
            }
          );
        }
        return this._makeEntity(dto);
      }
      case ChatType.CONFLICT_CHAT: {
        if (!isCreateConflictChatTuple(dto)) {
          throw new InternalServerErrorException(
            { message: 'Внутренняя ошибка сервера' },
            {
              cause: `В метод ChatsFactory.create() с аргументом type === ChatType.CONFLICT_CHAT передан неверный аргумент dto "${dto}".`,
            }
          );
        }
        const [vDto, rDto] = dto;
        const [vDoc, rDoc] = await Promise.all([
          (await (await this.chatsRepo.create(vDto)).save()) as ConflictChatWithVolunteer,
          (await (await this.chatsRepo.create(rDto)).save()) as ConflictChatWithRecipient,
        ]);
        const volunteerChatMeta = ChatsFactory._prepareMeta(vDoc);
        const recipientChatMeta = ChatsFactory._prepareMeta(rDoc);
        volunteerChatMeta._opponentChat = recipientChatMeta._id as ObjectId;
        recipientChatMeta._opponentChat = volunteerChatMeta._id as ObjectId;
        return [
          new ChatEntity(volunteerChatMeta, vDoc, this.chatsRepo, this.messagesRepo),
          new ChatEntity(recipientChatMeta, rDoc, this.chatsRepo, this.messagesRepo),
        ];
      }
      default:
        throw new InternalServerErrorException(
          { message: 'Внутренняя ошибка сервера' },
          { cause: `При создании чата передан неверный тип чата: "${type}".` }
        );
    }
  }

  public async find(chatId: string | ObjectId): Promise<ChatEntity>;

  public async find(dto: ChatSearchRecord): Promise<Array<ChatEntity>>;

  public async find(
    data: string | ObjectId | Record<string, unknown>
  ): Promise<ChatEntity | Array<ChatEntity>> {
    if (typeof data !== 'string' && !isObjectId(data) && !isChatSearchRecord(data)) {
      throw new InternalServerErrorException(
        { message: 'Внутренняя ошибка сервера' },
        {
          cause: `При поиске чата передан неверный dto: "${data}" - он не является ни строкой, ни ObjectId, ни объектом с валидными полями поиска.`,
        }
      );
    }
    let search: AnyChat | Array<AnyChat> | null;
    if (typeof data === 'string' || isObjectId(data)) {
      search = await this.chatsRepo
        .findById<AnyChat>(isObjectId(data) ? data.toString() : data)
        .exec();
    } else {
      search = await this.chatsRepo.find<AnyChat>(data).exec();
    }
    return Array.isArray(search)
      ? search.map(
          (doc) =>
            new ChatEntity(ChatsFactory._prepareMeta(doc), doc, this.chatsRepo, this.messagesRepo)
        )
      : new ChatEntity(
          ChatsFactory._prepareMeta(search),
          search,
          this.chatsRepo,
          this.messagesRepo
        );
  }
}
