/* eslint-disable no-empty-function */
import { Injectable, InternalServerErrorException, NotImplementedException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ObjectId } from 'mongoose';

import {
  AnyChatInfo,
  AnyUserChatsResponseDtoInterface,
  ConflictChatsTupleMetaInterface,
  CreateSystemChatEntityDtoType,
  CreateTaskChatEntityDtoType,
  GetAdminChatsResponseDtoInterface,
  GetUserChatsResponseDtoInterface,
  MessageInterface,
  MetaDto,
  SystemChatInfo,
  SystemChatInterface,
  SystemChatMetaInterface,
  TaskChatInfo,
  TaskChatInterface,
  TaskChatMetaInterface,
} from '../../common/types/chats.types';
// import { WsNewMessage } from '../../common/types/websockets.types';
import { TaskInterface } from '../../common/types/task.types';
import { ChatType } from '../../common/types/system.types';
import { ChatEntity } from '../../entities/chats/chat.entity';
import { makeUnreadsMeta } from '../../common/helpers/make-unreads-meta';
import { getUnreadMessages } from '../../common/helpers/get-unread-messages';
import {
  AdminInterface,
  AnyUserInterface,
  RecipientInterface,
  UserRole,
  VolunteerInterface,
} from '../../common/types/user.types';
import {
  wsAdminMetaPayload,
  wsMetaPayload,
  WsNewMessage,
  wsUserMetaPayload,
} from '../../common/types/websockets.types';
import { ChatsFactory } from '../../entities/chats/chat.entity.factory';
import { GetChatMessagesQuery } from '../../common/queries/get-chat-messages.query';
import { GetUserQuery } from '../../common/queries/get-user.query';
import { ensureStringId } from '../../common/helpers/ensure-string-id';
import { isTaskChatInterface } from '../../common/type-predicates/is-task-chat-interface';
import { isSystemChatInterface } from '../../common/type-predicates/is-system-chat-interface';
import { emptyWsAdminMeta, emptyWsUserMeta } from '../../common/constants';

@Injectable()
export class ChatService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly chatsFactory: ChatsFactory
  ) {}

  /* Task chats */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  public async createTaskChat(task: TaskInterface): Promise<TaskChatMetaInterface> {
    const { volunteer: vlntr, recipient: rcpnt, _id: tskId } = task;
    const data: CreateTaskChatEntityDtoType = {
      volunteer: vlntr as VolunteerInterface,
      recipient: rcpnt as RecipientInterface,
      taskId: tskId,
      type: ChatType.TASK_CHAT,
    };
    const chat = await this.chatsFactory.create(ChatType.TASK_CHAT, data);
    const { type, isActive, _id, taskId, volunteer, recipient, createdAt, updatedAt } =
      chat.meta as TaskChatInterface;
    return {
      type,
      isActive,
      _id,
      taskId,
      volunteer,
      recipient,
      createdAt,
      updatedAt,
      unreads: 0,
      watermark: null,
    };
  }

  private _getTaskChatMeta(entity: ChatEntity, role: UserRole): TaskChatMetaInterface {
    const { meta, messages } = entity;
    if (!isTaskChatInterface(meta)) {
      throw new InternalServerErrorException(
        {
          message: 'Внутренняя ошибка сервера при получении информации по чатам',
        },
        {
          cause:
            'Метод ChatService._getTaskChatMeta() вызван с сущностью чата, не являющейся чатом при задаче.',
        }
      );
    }
    const { type, isActive, _id, taskId, volunteer, recipient, createdAt, updatedAt } = meta;
    const [unreads, watermark] = makeUnreadsMeta(
      getUnreadMessages(messages, meta[`${role.toLowerCase()}LastReadAt`])
    );
    return {
      type,
      isActive,
      _id,
      taskId,
      volunteer,
      recipient,
      createdAt,
      updatedAt,
      unreads,
      watermark,
    } as TaskChatMetaInterface;
  }

  public async closeTaskChatByTask(taskId: ObjectId | string): Promise<boolean> {
    if (!taskId) {
      throw new InternalServerErrorException(
        {
          message: 'Внутренняя ошибка сервера при получении информации по чатам',
        },
        {
          cause: 'В метод ChatService.closeTaskChatByTask() не передан идентификатор задачи',
        }
      );
    }
    const [chat] = await this.chatsFactory.find({ taskId, isActive: true });
    const closedChat = await chat.close();
    const { isActive } = closedChat.meta as TaskChatInterface;
    return !isActive;
  }

  public async closeTaskChatById(chatId: string): Promise<boolean> {
    if (!chatId) {
      throw new InternalServerErrorException(
        {
          message: 'Внутренняя ошибка сервера при получении информации по чатам',
        },
        {
          cause: 'В метод ChatService.closeTaskChatById() не передан идентификатор чата',
        }
      );
    }
    const chat = await (await this.chatsFactory.find(chatId)).close();
    const { isActive } = chat.meta as TaskChatInterface;
    return !isActive;
  }

  public async getTaskChatsInfoByUser(userId: string | ObjectId): Promise<Array<TaskChatInfo>> {
    const user = await this.queryBus.execute<GetUserQuery, VolunteerInterface | RecipientInterface>(
      new GetUserQuery(userId)
    );
    let chats: Array<ChatEntity> = [];
    switch (user.role) {
      case UserRole.USER:
      case UserRole.ADMIN: {
        return [];
      }
      case UserRole.VOLUNTEER: {
        chats = await this.chatsFactory.find({
          type: ChatType.TASK_CHAT,
          volunteer: user,
        });
        break;
      }
      case UserRole.RECIPIENT: {
        chats = await this.chatsFactory.find({
          type: ChatType.TASK_CHAT,
          recipient: user,
        });
        break;
      }
      default: {
        throw new InternalServerErrorException(
          { message: 'При получении чатов произошла внутренняя ошибка сервера' },
          { cause: `У пользователя с _id '${user._id} недопустимая роль: '${user.role}` }
        );
      }
    }
    return this._transformEntityToInfo<TaskChatInfo>(chats, user.role as UserRole);
  }

  /* System chats */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  private async _createSystemChat(user: AnyUserInterface): Promise<ChatEntity> {
    const data: CreateSystemChatEntityDtoType = {
      user,
      type: ChatType.SYSTEM_CHAT,
    };
    return this.chatsFactory.create(ChatType.SYSTEM_CHAT, data);
  }

  private _getSystemChatMeta(
    { meta, messages }: ChatEntity,
    role: UserRole | null
  ): SystemChatMetaInterface {
    if (!isSystemChatInterface(meta)) {
      throw new InternalServerErrorException(
        {
          message: 'Внутренняя ошибка сервера при получении информации по чатам',
        },
        {
          cause:
            'В методе ChatService._getSystemChatMeta() метаданные переданной сущности не соответствуют SystemChatInterface',
        }
      );
    }
    const { type, isActive, _id, user, admin, createdAt, updatedAt } = meta;
    const [unreads, watermark] = role
      ? makeUnreadsMeta(
          getUnreadMessages(
            messages,
            meta[`${role === UserRole.ADMIN ? 'admin' : 'user'}LastReadAt`]
          )
        )
      : [0, null];
    return {
      type,
      isActive,
      _id,
      user,
      admin,
      createdAt,
      updatedAt,
      unreads,
      watermark,
    };
  }

  public async getSystemChatsInfoForUser(
    userId: string | ObjectId
  ): Promise<Array<SystemChatInfo>> {
    const user = await this.queryBus.execute<GetUserQuery, VolunteerInterface | RecipientInterface>(
      new GetUserQuery(userId)
    );
    const chats = await this.chatsFactory.find({ type: ChatType.SYSTEM_CHAT, user });
    return this._transformEntityToInfo<SystemChatInfo>(chats, user.role as UserRole);
  }

  async getActiveSystemChatByUser(userId: string): Promise<SystemChatInfo | null> {
    const user = await this.queryBus.execute<GetUserQuery, VolunteerInterface | RecipientInterface>(
      new GetUserQuery(userId)
    );
    const [chat] = await this.chatsFactory.find({ user, isActive: true });
    if (!chat) return null;
    return { meta: this._getSystemChatMeta(chat, user.role as UserRole), chats: chat.messages };
  }

  async getClosedSystemChatsByUser(userId: string): Promise<Array<SystemChatInfo>> {
    const user = await this.queryBus.execute<GetUserQuery, VolunteerInterface | RecipientInterface>(
      new GetUserQuery(userId)
    );
    const chats = await this.chatsFactory.find({ user, isActive: false });
    return this._transformEntityToInfo<SystemChatInfo>(chats, user.role as UserRole);
  }

  async getAllSystemChatsByUser(userId: string): Promise<Array<SystemChatInfo>> {
    const [opened, closed] = await Promise.all([
      this.getActiveSystemChatByUser(userId),
      this.getClosedSystemChatsByUser(userId),
    ]);
    const active = !!opened && !Array.isArray(opened) ? [opened] : [];
    const inactive = Array.isArray(closed) ? [...closed] : [];
    return [...active, ...inactive];
  }

  async getActiveSystemChatsByAdmin(adminId: string): Promise<Array<SystemChatInfo>> {
    const user = await this.queryBus.execute<GetUserQuery, AdminInterface>(
      new GetUserQuery(adminId)
    );
    const chats = await this.chatsFactory.find({ user, isActive: true });
    return this._transformEntityToInfo<SystemChatInfo>(chats, user.role as UserRole);
  }

  async getClosedSystemChatsByAdmin(adminId: string): Promise<Array<SystemChatInfo>> {
    const user = await this.queryBus.execute<GetUserQuery, AdminInterface>(
      new GetUserQuery(adminId)
    );
    const chats = await this.chatsFactory.find({ user, isActive: false });
    return this._transformEntityToInfo<SystemChatInfo>(chats, user.role as UserRole);
  }

  async getAllSystemChatsByAdmin(adminId: string): Promise<Array<SystemChatInfo>> {
    const [active, inactive] = await Promise.all([
      this.getActiveSystemChatsByAdmin(adminId),
      this.getClosedSystemChatsByAdmin(adminId),
    ]);
    return [...active, ...inactive];
  }

  async getVirginSystemChats(): Promise<Array<SystemChatInfo>> {
    const chats = await this.chatsFactory.find({ type: ChatType.SYSTEM_CHAT, admin: null });
    return this._transformEntityToInfo(chats, null);
  }
  /*
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async getActiveSystemChats(): Promise<Array<SystemChatMetaInterface>> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async getClosedSystemChats(): Promise<Array<SystemChatMetaInterface>> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async closeSystemChatByUser(userId: string): Promise<SystemChatMetaInterface> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async closeSystemChatById(chatId: string): Promise<SystemChatMetaInterface> {}

  /* Conflict Chats */
  /*
  async createConflictChatsTuple(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    task: TaskInterface
    // eslint-disable-next-line @typescript-eslint/no-empty-function,no-empty-function
  ): Promise<ConflictChatsTupleMetaInterface> {}

  async getConflictChatsTupleByTask(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    taskId: string
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<ConflictChatsTupleMetaInterface> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getActiveConflictChatsTuplesByAdmin(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userId: string
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<Array<ConflictChatsTupleMetaInterface>> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async getClosedConflictChatsByAdmin(adminId: string) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async getAllConflictChatsByAdmin(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adminId: string
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<Array<ConflictChatsTupleMetaInterface>> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async getActiveConflictChats(): Promise<Array<ConflictChatsTupleMetaInterface>> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async getClosedConflictChats(): Promise<Array<ConflictChatsTupleMetaInterface>> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async getAllConflictChats(): Promise<Array<ConflictChatsTupleMetaInterface>> {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  async closeConflictChatsTuple(taskId: string): Promise<ConflictChatsTupleMetaInterface> {}

  /* General chat handling methods */

  async addMessage(dto: WsNewMessage, user: AnyUserInterface): Promise<MetaDto> {
    const { chatId, attaches = [], body, timestamp } = dto;
    if (!chatId) {
      throw new InternalServerErrorException(
        { message: 'Внутренняя ошибка сервера при добавлении сообщения' },
        { cause: 'В dto нового сообщения отсутствует chatId' }
      );
    }
    const chat = chatId
      ? await this.chatsFactory.find(typeof chatId === 'string' ? chatId : chatId.toString())
      : await this._createSystemChat(user);
    const message = (await chat.postMessage({ chatId, body, attaches, timestamp, author: user }))
      .lastPost;
    await this.updateLastread(
      message.chatId,
      typeof message.createdAt === 'string' ? new Date(message.createdAt) : message.createdAt,
      user
    );
    let authorMeta: wsMetaPayload;
    let counterpartyMeta: wsMetaPayload;
    let counterpartyId: string;
    let counterparty: AnyUserInterface;
    const authorId = message.author._id;
    switch (chat.meta.type) {
      case ChatType.TASK_CHAT: {
        const { volunteer, recipient } = chat.meta as TaskChatInterface;
        counterpartyId =
          ensureStringId(authorId) === ensureStringId(volunteer._id)
            ? ensureStringId(recipient._id)
            : ensureStringId(volunteer._id);
        counterparty = (await this.queryBus.execute(
          new GetUserQuery(counterpartyId)
        )) as AnyUserInterface;
        authorMeta = this._getFreshMetaForUser(chat, user);
        counterpartyMeta = this._getFreshMetaForUser(chat, counterparty);
        break;
      }
      case ChatType.SYSTEM_CHAT: {
        const { user: usr, admin } = chat.meta as SystemChatInterface;
        counterpartyId =
          ensureStringId(usr._id) === ensureStringId(authorId)
            ? ensureStringId(admin._id)
            : ensureStringId(usr._id);
        counterparty = (await this.queryBus.execute(
          new GetUserQuery(counterpartyId)
        )) as AnyUserInterface;
        authorMeta = this._getFreshMetaForUser(chat, user);
        counterpartyMeta = this._getFreshMetaForUser(chat, counterparty);
        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_VOLUNTEER: {
        authorMeta = emptyWsUserMeta;
        counterpartyMeta = emptyWsAdminMeta;
        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_RECIPIENT: {
        authorMeta = emptyWsUserMeta;
        counterpartyMeta = emptyWsAdminMeta;
        break;
      }
      default: {
        throw new InternalServerErrorException(
          { message: 'При получении чатов произошла внутренняя ошибка' },
          {
            cause: `В чате с _id '${chat.chatId}' некорректное значение type: '${chat.meta.type}'`,
          }
        );
      }
    }
    return {
      message,
      author: { _id: authorId, meta: authorMeta },
      counterparty: { _id: counterpartyId, meta: counterpartyMeta },
    } as MetaDto;
  }

  public async getMessages(dto: GetChatMessagesQuery): Promise<Array<MessageInterface>> {
    const { chatId, skip = 0, limit = 0 } = dto;
    const chat = await this.chatsFactory.find(chatId);
    const { messages } = chat;
    const first = skip;
    const last = limit === 0 ? messages.length : skip + limit;
    return messages.slice(first, last);
  }

  async getUserChatsMeta(
    userId: string
  ): Promise<GetUserChatsResponseDtoInterface | GetAdminChatsResponseDtoInterface> {
    const usr = await this.queryBus.execute<GetUserQuery, AnyUserInterface>(
      new GetUserQuery(userId)
    );

    switch (usr.role) {
      case UserRole.VOLUNTEER:
      case UserRole.RECIPIENT: {
        const [task, system] = await Promise.all([
          this.getTaskChatsInfoByUser(userId),
          this.getSystemChatsInfoForUser(userId),
        ]);
        return {
          task,
          system,
          conflict: [],
        } as AnyUserChatsResponseDtoInterface;
      }
      case UserRole.USER: {
        return {
          task: [],
          system: await this.getSystemChatsInfoForUser(userId),
          conflict: [],
        } as AnyUserChatsResponseDtoInterface;
      }
      case UserRole.ADMIN: {
        const [my, system] = await Promise.all([
          this.getActiveSystemChatsByAdmin(userId),
          this.getVirginSystemChats(),
        ]);
        return {
          my,
          system,
          moderated: [],
          conflict: [],
        } as GetAdminChatsResponseDtoInterface;
      }
      default: {
        throw new InternalServerErrorException(
          { message: `Внутренняя ошибка сервера` },
          { cause: `В пользователе с _id '${usr._id}' указан неверный user.role: '${usr.role}'` }
        );
      }
    }
  }

  public async updateLastread(
    chatId: string | ObjectId,
    lastread: Date,
    user: AnyUserInterface
  ): Promise<wsMetaPayload> {
    const entity = await this.chatsFactory.find(chatId);
    return this._getFreshMetaForUser(
      await entity.updateWatermark(user.role as UserRole, lastread),
      user
    );
  }

  private _getFreshMetaForUser(entity: ChatEntity, user: AnyUserInterface): wsMetaPayload {
    const tasks: Array<TaskChatMetaInterface> = [];
    const system: Array<SystemChatMetaInterface> = [];
    const my: Array<SystemChatMetaInterface> = [];
    const moderated: Array<ConflictChatsTupleMetaInterface> = [];
    const conflicts: Array<ConflictChatsTupleMetaInterface> = [];
    switch (entity.meta.type) {
      case ChatType.TASK_CHAT: {
        tasks.push(this._getTaskChatMeta(entity, user.role as UserRole));
        break;
      }
      case ChatType.SYSTEM_CHAT: {
        const chatMeta = this._getSystemChatMeta(entity, user.role as UserRole);
        const meta = entity.meta as SystemChatInterface;
        if (ensureStringId(meta.admin._id) === ensureStringId(user._id)) {
          my.push(chatMeta);
        } else {
          system.push(chatMeta);
        }

        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_VOLUNTEER:
      case ChatType.CONFLICT_CHAT_WITH_RECIPIENT:
        break;
      default:
        throw new InternalServerErrorException(
          {
            message: `Внутренняя ошибка сервера при обновлении метаданных чата '${entity.chatId}'`,
          },
          { cause: `Неверный тип чата '${entity.chatId}': ${entity.meta.type}.` }
        );
    }
    if (user.role === UserRole.ADMIN) {
      return { my, system, moderated, conflicts } as wsAdminMetaPayload;
    }
    return { tasks, system, conflicts } as wsUserMetaPayload;
  }

  private async _transformEntityToInfo<T extends AnyChatInfo>(
    chats: Array<ChatEntity>,
    role: UserRole
  ): Promise<Array<T>> {
    return chats.map((chat) => {
      const msgs = chat.messages;
      switch (chat.meta.type) {
        case ChatType.TASK_CHAT: {
          return {
            meta: this._getTaskChatMeta(chat, role),
            chats: msgs,
          } as T;
        }
        case ChatType.SYSTEM_CHAT: {
          return {
            meta: this._getSystemChatMeta(chat, role),
            chats: msgs,
          } as T;
        }
        case ChatType.CONFLICT_CHAT_WITH_RECIPIENT:
        case ChatType.CONFLICT_CHAT_WITH_VOLUNTEER: {
          throw new NotImplementedException(
            { message: 'Чаты при конфликтных заявках не реализованы' },
            { cause: `Конфликтные чаты не реализованы.` }
          );
        }
        default: {
          throw new InternalServerErrorException(
            { message: 'При получении чатов произошла внутренняя ошибка' },
            {
              cause: `В чате с _id '${chat.chatId}' некорректное значение type: '${chat.meta.type}'`,
            }
          );
        }
      }
    }) as Array<T>;
  }
}
