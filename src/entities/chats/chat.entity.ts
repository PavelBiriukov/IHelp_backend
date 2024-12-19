/* eslint-disable no-empty-function */
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Document, Model, type ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
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
import { TaskChat } from '../../datalake/chats/schemas/task-chat.schema';
import { SystemChat } from '../../datalake/chats/schemas/system-chat.schema';
import { ConflictChatWithVolunteer } from '../../datalake/chats/schemas/conflict-volunteer-chat.schema';
import { ConflictChatWithRecipient } from '../../datalake/chats/schemas/conflict-recipient-chat.schema';
import { ChatType, ChatTypes } from '../../common/types/system.types';
import { ChatEntityInterface } from '../../common/types/entities.interfaces';
import { Chat } from '../../datalake/chats/schemas/chat.schema';
import { Message } from '../../datalake/messages/schemas/messages.schema';

@Injectable({ scope: Scope.REQUEST })
export class ChatEntity implements ChatEntityInterface {
  private _id: ObjectId | string | null = null;

  private _createdAt: string | Date | null = null;

  private _updatedAt: string | Date | null = null;

  private _type: ChatTypes | null = null;

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
    @InjectModel(Chat.name) private readonly chatsRepo: Model<Chat>,
    @InjectModel(Message.name) private readonly messagesRepo: Model<Message>
  ) {}

  private _setMeta(chat: AnyChat) {
    const { _id, type, createdAt, updatedAt, isActive } = chat as Chat;
    this._id = _id;
    this._type = type;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._isActive = isActive;
    switch (type) {
      case ChatType.TASK_CHAT: {
        const { taskId, volunteer, recipient, volunteerLastReadAt, recipientLastReadAt } =
          chat as TaskChat;
        this._taskId = taskId;
        this._volunteer = volunteer;
        this._recipient = recipient;
        this._volunteerLastReadAt = volunteerLastReadAt;
        this._recipientLastReadAt = recipientLastReadAt;
        break;
      }
      case ChatType.SYSTEM_CHAT: {
        const { user, admin, userLastReadAt, adminLastReadAt } = chat as SystemChat;
        this._user = user;
        this._admin = admin;
        this._userLastReadAt = userLastReadAt;
        this._adminLastReadAt = adminLastReadAt;
        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_VOLUNTEER: {
        const { taskId, volunteer, admin, opponentChat, volunteerLastReadAt, adminLastReadAt } =
          chat as ConflictChatWithVolunteer;
        this._taskId = taskId;
        this._volunteer = volunteer;
        this._admin = admin;
        this._opponentChat = opponentChat;
        this._volunteerLastReadAt = volunteerLastReadAt;
        this._adminLastReadAt = adminLastReadAt;

        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_RECIPIENT: {
        const { taskId, recipient, admin, opponentChat, recipientLastReadAt, adminLastReadAt } =
          chat as ConflictChatWithRecipient;
        this._taskId = taskId;
        this._recipient = recipient;
        this._admin = admin;
        this._opponentChat = opponentChat;
        this._recipientLastReadAt = recipientLastReadAt;
        this._adminLastReadAt = adminLastReadAt;
        break;
      }
      default:
        throw new InternalServerErrorException(
          { message: 'Внутренняя ошибка сервера' },
          { cause: `У сущности чата установлен неверный тип чата: "${this._type}".` }
        );
    }
  }

  private _getMeta() {
    switch (this._type) {
      case ChatType.TASK_CHAT: {
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
      case ChatType.SYSTEM_CHAT: {
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
      case ChatType.CONFLICT_CHAT_WITH_VOLUNTEER: {
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
      case ChatType.CONFLICT_CHAT_WITH_RECIPIENT: {
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
        } as ConflictChatWithRecipientInterface;
      }
      default:
        throw new InternalServerErrorException(
          { message: 'Внутренняя ошибка сервера' },
          { cause: `У сущности чата установлен неверный тип чата: "${this._type}".` }
        );
    }
  }

  async create(dto: CreateChatEntityDtoTypes): Promise<ChatEntity> {
    const chat = (await (await this.chatsRepo.create(dto)).save()) as AnyChat;
    this._setMeta(chat);
    this._doc = chat;
    this._messages = [];
    return this;
  }

  toObject(): { metadata: AnyChatInterface; messages: Array<MessageInterface> } {
    return {
      metadata: this._getMeta(),
      messages: this._messages,
    };
  }

  get chatId(): ObjectId | string {
    if (!this._id) {
      throw new InternalServerErrorException(
        { message: 'Внутренняя ошибка сервера' },
        { cause: 'Обращение к геттеру chatId при this._id === null' }
      );
    }
    return this._id;
  }

  get meta(): AnyChatInterface {
    return this._getMeta();
  }

  async setOpponentChat(opponentChatId: ObjectId | string): Promise<ChatEntity> {
    if (
      this._type === ChatType.CONFLICT_CHAT_WITH_RECIPIENT ||
      this._type === ChatType.CONFLICT_CHAT_WITH_VOLUNTEER
    ) {
      const chat = (await this.chatsRepo.findOneAndUpdate(
        { type: this._type, _id: this._id },
        { opponentChat: opponentChatId }
      )) as ConflictChatWithVolunteerInterface | ConflictChatWithRecipientInterface;
      this._opponentChat = chat.opponentChat;
    }
    return this;
  }

  async find(chatId: string): Promise<ChatEntity>;

  async find(dto: Record<string, unknown>): Promise<ChatEntity>;

  async find(...data): Promise<ChatEntity> {
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
    const messages = await this.messagesRepo.find({ chatId: this._id }).exec();
    this._messages = messages.map((msg) => msg.toObject());
    return this;
  }

  get messages(): Array<MessageInterface> {
    return this._messages;
  }

  async postMessage(dto: VirginMessageInterface): Promise<MessageInterface> {
    if (dto.chatId !== this._id) {
      throw new ForbiddenException('Нельзя отправлять сообщение не в соответствующий чат.');
    }
    const msg = await this.messagesRepo.create({ ...dto, timestamp: Date.now() });
    const { _id, timestamp, body, attaches, author, chatId } = msg.toObject();
    const message = {
      _id,
      timestamp,
      body,
      attaches,
      author,
      chatId,
    } as MessageInterface;
    this._messages.push(message);
    return message;
  }

  async close(): Promise<ChatEntity> {
    if (!this._isActive) {
      return this;
    }
    const chat = (await this.chatsRepo.findOneAndUpdate(
      { type: this._type, _id: this._id },
      { isActive: false }
    )) as TaskChatInterface;
    this._isActive = chat.isActive;
    return this;
  }

  async reopen(): Promise<ChatEntity> {
    if (this._isActive) {
      return this;
    }
    const chat = (await this.chatsRepo.findOneAndUpdate(
      { type: this._type, _id: this._id },
      { isActive: true }
    )) as TaskChatInterface;
    this._isActive = chat.isActive;
    return this;
  }
}
