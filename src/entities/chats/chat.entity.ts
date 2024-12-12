/* eslint-disable no-empty-function */
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
import { type ObjectId } from 'mongoose';
import {
  AnyChat,
  AnyChatInterface,
  ConflictChatWithRecipientInterface,
  ConflictChatWithVolunteerInterface,
  CreateChatEntityDtoTypes,
  MessageInterface,
  SystemChatInterface,
  TaskChatInterface,
  VirginMessageInterface,
} from '../../common/types/chats.types';
import {
  AdminInterface,
  RecipientInterface,
  VolunteerInterface,
} from '../../common/types/user.types';
import { ChatsRepository } from '../../datalake/chats/chats.repository';
import { MessagesRepository } from '../../datalake/messages/messages.repository';
import { TaskChat } from '../../datalake/chats/schemas/task-chat.schema';
import { SystemChat } from '../../datalake/chats/schemas/system-chat.schema';
import { ConflictChatWithVolunteer } from '../../datalake/chats/schemas/conflict-volunteer-chat.schema';
import { ConflictChatWithRecipient } from '../../datalake/chats/schemas/conflict-recipient-chat.schema';
import { ChatType } from '../../common/types/system.types';

@Injectable({ scope: Scope.REQUEST })
export class ChatEntity<T extends typeof ChatType> {
  private _id: ObjectId | string | null = null;

  private _createdAt: string | Date | null = null;

  private _updatedAt: string | Date | null = null;

  private _type: ChatType | null = null;

  private _taskId: ObjectId | string | null = null;

  private _volunteer: VolunteerInterface | null = null;

  private _recipient: RecipientInterface | null = null;

  private _user: VolunteerInterface | RecipientInterface | null = null;

  private _admin: AdminInterface | null = null;

  private _opponentChat: ObjectId | null = null;

  private _volunteerLastReadAt: Date | null = null;

  private _recipientLastReadAt: Date | null = null;

  private _adminLastReadAt: Date | null = null;

  private _userLastReadAt: Date | null = null;

  private _messages: Array<MessageInterface> | null = null;

  private _isActive: boolean = false;

  private _doc: AnyChat | null = null;

  constructor(
    private readonly chatsRepo: ChatsRepository,
    private readonly messagesRepo: MessagesRepository
  ) {}

  private _setMeta(chat: AnyChat) {
    const { _id, type, createdAt, updatedAt, isActive } = chat;
    let data: Record<string, unknown> = { _id, type, createdAt, updatedAt, isActive };
    switch (type) {
      case ChatType.TASK_CHAT as T: {
        const { taskId, volunteer, recipient, volunteerLastReadAt, recipientLastReadAt } =
          chat as TaskChat;
        data = {
          ...data,
          taskId,
          volunteer,
          recipient,
          volunteerLastReadAt,
          recipientLastReadAt,
        };
        break;
      }
      case ChatType.SYSTEM_CHAT as T: {
        const { user, admin, userLastReadAt, adminLastReadAt } = chat as SystemChat;
        data = {
          ...data,
          user,
          admin,
          userLastReadAt,
          adminLastReadAt,
        };
        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_VOLUNTEER as T: {
        const { taskId, volunteer, admin, opponentChat, volunteerLastReadAt, adminLastReadAt } =
          chat as ConflictChatWithVolunteer;
        data = {
          ...data,
          taskId,
          volunteer,
          admin,
          opponentChat,
          volunteerLastReadAt,
          adminLastReadAt,
        };
        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_RECIPIENT as T: {
        const { taskId, recipient, admin, opponentChat, recipientLastReadAt, adminLastReadAt } =
          chat as ConflictChatWithRecipient;
        data = {
          ...data,
          taskId,
          recipient,
          admin,
          opponentChat,
          recipientLastReadAt,
          adminLastReadAt,
        };
        break;
      }
      default:
        throw new InternalServerErrorException(
          { message: 'Внутренняя ошибка сервера' },
          { cause: `У сущности чата установлен неверный тип чата: "${this._type}".` }
        );
    }
    Object.assign(this, data);
  }

  private _getMeta() {
    switch (this._type) {
      case ChatType.TASK_CHAT as T: {
        return {
          type: this._type,
          _id: this._id,
          createdAt: this._createdAt,
          updatedAt: this._updatedAt,
          isActive: this._isActive,
          volunteer: this._volunteer,
          recipient: this._recipient,
          taskId: this._taskId,
          volunteerLastReadAt: this._volunteerLastReadAt,
          recipientLastReadAt: this._recipientLastReadAt,
        } as TaskChatInterface;
      }
      case ChatType.SYSTEM_CHAT as T: {
        return {
          type: this._type,
          _id: this._id,
          createdAt: this._createdAt,
          updatedAt: this._updatedAt,
          isActive: this._isActive,
          user: this._user,
          admin: this._admin,
          userLastReadAt: this._userLastReadAt,
          adminLastReadAt: this._adminLastReadAt,
        } as SystemChatInterface;
      }
      case ChatType.CONFLICT_CHAT_WITH_VOLUNTEER as T: {
        return {
          type: this._type,
          _id: this._id,
          createdAt: this._createdAt,
          updatedAt: this._updatedAt,
          isActive: this._isActive,
          taskId: this._taskId,
          volunteer: this._volunteer,
          admin: this._admin,
          opponentChat: this._opponentChat,
          volunteerLastReadAt: this._volunteerLastReadAt,
          adminLastReadAt: this._adminLastReadAt,
        } as ConflictChatWithVolunteerInterface;
      }
      case ChatType.CONFLICT_CHAT_WITH_RECIPIENT as T: {
        return {
          type: this._type,
          _id: this._id,
          createdAt: this._createdAt,
          updatedAt: this._updatedAt,
          isActive: this._isActive,
          taskId: this._taskId,
          recipient: this._recipient,
          admin: this._admin,
          opponentChat: this._opponentChat,
          recipientLastReadAt: this._recipientLastReadAt,
          adminLastReadAt: this._adminLastReadAt,
        } as ConflictChatWithVolunteerInterface;
      }
      default:
        throw new InternalServerErrorException(
          { message: 'Внутренняя ошибка сервера' },
          { cause: `У сущности чата установлен неверный тип чата: "${this._type}".` }
        );
    }
  }

  public async create(dto: CreateChatEntityDtoTypes): Promise<ChatEntity<T>> {
    const chat = (await (await this.chatsRepo.create(dto)).save()) as AnyChat;
    this._setMeta(chat);
    this._doc = chat;
    this._messages = [];
    return this;
  }

  public toObject(): { metadata: AnyChatInterface; messages: Array<MessageInterface> } {
    return {
      metadata: this._getMeta(),
      messages: this._messages,
    };
  }

  public get chatId(): ObjectId | string {
    if (!this._id) {
      throw new InternalServerErrorException(
        { message: 'Внутренняя ошибка сервера' },
        { cause: 'Обращение к геттеру chatId при this._id === null' }
      );
    }
    return this._id;
  }

  public get meta() {
    return this._getMeta();
  }

  public async setOpponentChat(opponentChatId: ObjectId | string): Promise<ChatEntity<T>> {
    if (
      this._type !== ChatType.CONFLICT_CHAT_WITH_RECIPIENT ||
      this._type !== ChatType.CONFLICT_CHAT_WITH_VOLUNTEER
    ) {
      return this;
    }
    const chat = (await this.chatsRepo.findOneAndUpdate(
      { type: this._type, _id: this._id },
      { opponentChat: opponentChatId }
    )) as ConflictChatWithVolunteerInterface | ConflictChatWithRecipientInterface;
    this._opponentChat = chat.opponentChat;
    return this;
  }

  public async find(chatId: string): Promise<ChatEntity<T>>;

  public async find(dto: Record<string, unknown>): Promise<ChatEntity<T>>;

  public async find(...data): Promise<ChatEntity<T>> {
    let chat: AnyChat | Array<AnyChat>;
    const [param] = data;
    if (typeof param === 'string') {
      chat = (await this.chatsRepo.findById(param)) as AnyChat;
    } else if (typeof param === 'object') {
      [chat] = (await this.chatsRepo.find(param)) as Array<AnyChat>;
    } else {
      throw new InternalServerErrorException(
        { message: 'Внутренняя ошибка сервера' },
        {
          cause: new TypeError(
            `Переданный в ChatEntity.find() параметр dto (''${param}') имеет неверный тип.`
          ),
        }
      );
    }
    this._setMeta(chat);
    this._doc = chat;
    const messages = await this.messagesRepo.find({ chatId: this._id });
    this._messages = messages.map((msg) => msg.toObject());
    return this;
  }

  public get messages() {
    return this._messages;
  }

  public async postMessage(dto: VirginMessageInterface): Promise<MessageInterface> {
    if (dto.chatId !== this._id) {
      throw new ForbiddenException('Нельзя отправлять сообщение не в соответствующий чат.');
    }
    const { _id, createdAt, updatedAt, body, attaches, author, chatId } = await (
      await this.messagesRepo.create(dto)
    ).save();
    const message: MessageInterface = { _id, createdAt, updatedAt, body, attaches, author, chatId };
    this._messages.push(message);
    return message;
  }
}
