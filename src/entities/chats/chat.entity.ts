/* eslint-disable no-empty-function */
import { ForbiddenException, InternalServerErrorException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import mongoose, { Model, type ObjectId } from 'mongoose';
import {
  AnyChat,
  AnyChatInterface,
  ChatMetadata,
  ConflictChatWithRecipientInterface,
  ConflictChatWithVolunteerInterface,
  MessageInterface,
  SystemChatInterface,
  TaskChatInterface,
  VirginMessageInterface,
} from '../../common/types/chats.types';
import {
  AdminInterface,
  RecipientInterface,
  UserRole,
  VolunteerInterface,
} from '../../common/types/user.types';
import { ChatType, ChatTypes } from '../../common/types/system.types';
import { ChatEntityInterface } from '../../common/types/entities.interfaces';
import { Chat } from '../../datalake/chats/schemas/chat.schema';
import { Message } from '../../datalake/messages/schemas/messages.schema';
import { ConflictChatWithRecipient } from '../../datalake/chats/schemas/conflict-recipient-chat.schema';
import { ConflictChatWithVolunteer } from '../../datalake/chats/schemas/conflict-volunteer-chat.schema';
import { SystemChat } from '../../datalake/chats/schemas/system-chat.schema';
import { TaskChat } from '../../datalake/chats/schemas/task-chat.schema';

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

  private _isActive = false;

  private _doc: AnyChat | null = null;

  private _lastPost: MessageInterface | null = null;

  constructor(
    meta: ChatMetadata,
    doc: AnyChat,
    private readonly chatsRepo: Model<Chat>,
    private readonly messagesRepo: Model<Message>
  ) {
    this._doc = doc;
    this._setMeta(meta);
  }

  private async _setMeta(meta: ChatMetadata): Promise<void> {
    const { _id, _type, _createdAt, _updatedAt, _isActive } = meta;
    this._id = _id;
    this._type = _type;
    this._createdAt = _createdAt;
    this._updatedAt = _updatedAt;
    this._isActive = _isActive;
    this._messages = await this.messagesRepo.find<MessageInterface>({ chatId: this._id }).exec();
    switch (this._type) {
      case ChatType.TASK_CHAT: {
        const { _taskId, _volunteer, _recipient, _volunteerLastReadAt, _recipientLastReadAt } =
          meta;
        this._taskId = _taskId;
        this._volunteer = _volunteer;
        this._recipient = _recipient;
        this._volunteerLastReadAt = _volunteerLastReadAt;
        this._recipientLastReadAt = _recipientLastReadAt;
        break;
      }
      case ChatType.SYSTEM_CHAT: {
        const { _user, _admin, _userLastReadAt, _adminLastReadAt } = meta;
        this._user = _user;
        this._admin = _admin;
        this._userLastReadAt = _userLastReadAt;
        this._adminLastReadAt = _adminLastReadAt;
        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_VOLUNTEER: {
        const {
          _taskId,
          _volunteer,
          _admin,
          _opponentChat,
          _volunteerLastReadAt,
          _adminLastReadAt,
        } = meta;
        this._taskId = _taskId;
        this._volunteer = _volunteer;
        this._admin = _admin;
        this._opponentChat = _opponentChat;
        this._volunteerLastReadAt = _volunteerLastReadAt;
        this._adminLastReadAt = _adminLastReadAt;
        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_RECIPIENT: {
        const {
          _taskId,
          _recipient,
          _admin,
          _opponentChat,
          _recipientLastReadAt,
          _adminLastReadAt,
        } = meta;
        this._taskId = _taskId;
        this._recipient = _recipient;
        this._admin = _admin;
        this._opponentChat = _opponentChat;
        this._recipientLastReadAt = _recipientLastReadAt;
        this._adminLastReadAt = _adminLastReadAt;
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

  public toObject(): { metadata: AnyChatInterface; messages: Array<MessageInterface> } {
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

  get messages(): Array<MessageInterface> {
    return this._messages;
  }

  public async postMessage(dto: VirginMessageInterface): Promise<ChatEntity> {
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
    this._lastPost = message;
    return this;
  }

  get lastPost(): MessageInterface {
    return this._lastPost;
  }

  public async close(): Promise<ChatEntity> {
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

  public async reopen(): Promise<ChatEntity> {
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

  public async updateWatermark(role: UserRole, lastread: Date) {
    switch (this._type) {
      case ChatType.TASK_CHAT: {
        switch (role) {
          case UserRole.VOLUNTEER: {
            const { volunteerLastReadAt: timestamp, updatedAt } = await this.chatsRepo
              .findOneAndUpdate<TaskChat & Chat>(
                { type: this._type, _id: this._id },
                { volunteerLastReadAt: lastread },
                { new: true }
              )
              .exec();
            this._volunteerLastReadAt = timestamp;
            this._updatedAt = updatedAt;
            break;
          }
          case UserRole.RECIPIENT: {
            const { recipientLastReadAt: timestamp, updatedAt } = await this.chatsRepo
              .findOneAndUpdate<TaskChat & Chat>(
                { type: this._type, _id: this._id },
                { recipientLastReadAt: lastread },
                { new: true }
              )
              .exec();
            this._recipientLastReadAt = timestamp;
            this._updatedAt = updatedAt;
            break;
          }
          default:
            throw new InternalServerErrorException(
              { message: 'Внутренняя ошибка сервера' },
              {
                cause: `В вызов ChatEntity.updateWatermark() для сущности типа "${this._type}" передана некорректная role: "${role}".`,
              }
            );
        }
        break;
      }
      case ChatType.SYSTEM_CHAT: {
        switch (role) {
          case UserRole.VOLUNTEER:
          case UserRole.RECIPIENT:
          case UserRole.USER: {
            const { userLastReadAt: timestamp, updatedAt } = await this.chatsRepo
              .findOneAndUpdate<SystemChat & Chat>(
                { type: this._type, _id: this._id },
                { userLastReadAt: lastread },
                { new: true }
              )
              .exec();
            this._userLastReadAt = timestamp;
            this._updatedAt = updatedAt;
            break;
          }
          case UserRole.ADMIN: {
            const { adminLastReadAt: timestamp, updatedAt } = await this.chatsRepo
              .findOneAndUpdate<SystemChat & Chat>(
                { type: this._type, _id: this._id },
                { adminLastReadAt: lastread },
                { new: true }
              )
              .exec();
            this._adminLastReadAt = timestamp;
            this._updatedAt = updatedAt;
            break;
          }
          default:
            throw new InternalServerErrorException(
              { message: 'Внутренняя ошибка сервера' },
              {
                cause: `В вызов ChatEntity.updateWatermark() для сущности типа "${this._type}" передана некорректная role: "${role}".`,
              }
            );
        }
        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_VOLUNTEER: {
        switch (role) {
          case UserRole.VOLUNTEER: {
            const { volunteerLastReadAt: timestamp, updatedAt } = await this.chatsRepo
              .findOneAndUpdate<ConflictChatWithVolunteer & Chat>(
                { type: this._type, _id: this._id },
                { volunteerLastReadAt: lastread }
              )
              .exec();
            this._volunteerLastReadAt = timestamp;
            this._updatedAt = updatedAt;
            break;
          }
          case UserRole.ADMIN: {
            const { adminLastReadAt: timestamp, updatedAt } = await this.chatsRepo
              .findOneAndUpdate<ConflictChatWithVolunteer & Chat>(
                { type: this._type, _id: this._id },
                { adminLastReadAt: lastread },
                { new: true }
              )
              .exec();
            this._adminLastReadAt = timestamp;
            this._updatedAt = updatedAt;
            break;
          }
          default:
            throw new InternalServerErrorException(
              { message: 'Внутренняя ошибка сервера' },
              {
                cause: `В вызов ChatEntity.updateWatermark() для сущности типа "${this._type}" передана некорректная role: "${role}".`,
              }
            );
        }
        break;
      }
      case ChatType.CONFLICT_CHAT_WITH_RECIPIENT: {
        switch (role) {
          case UserRole.ADMIN: {
            const { adminLastReadAt: timestamp, updatedAt } = await this.chatsRepo
              .findOneAndUpdate<ConflictChatWithRecipient & Chat>(
                { type: this._type, _id: this._id },
                { adminLastReadAt: lastread },
                { new: true }
              )
              .exec();
            this._adminLastReadAt = timestamp;
            this._updatedAt = updatedAt;
            break;
          }
          case UserRole.RECIPIENT: {
            const doc = await this.chatsRepo
              .findOneAndUpdate<ConflictChatWithRecipient & Chat>(
                { type: this._type, _id: this._id },
                { recipientLastReadAt: lastread },
                { new: true }
              )
              .exec();
            const { recipientLastReadAt: timestamp, updatedAt } = doc;
            this._recipientLastReadAt = timestamp;
            this._updatedAt = updatedAt;
            break;
          }
          default:
            throw new InternalServerErrorException(
              { message: 'Внутренняя ошибка сервера' },
              {
                cause: `В вызов ChatEntity.updateWatermark() для сущности типа "${this._type}" передана некорректная role: "${role}".`,
              }
            );
        }
        break;
      }
      default:
        throw new InternalServerErrorException(
          { message: 'Внутренняя ошибка сервера' },
          {
            cause: `В экземпляре ChatEntity некорректно установлен тип сущности "${this._type}".`,
          }
        );
    }
    return this;
  }
}
