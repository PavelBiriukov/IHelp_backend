import { Injectable, Scope, InternalServerErrorException } from '@nestjs/common';
import { ChatsRepository } from '../../datalake/chats/chats.repository';
import { MessagesRepository } from '../../datalake/messages/messages.repository';
import { MessageInterface, TaskChatInterface } from '../../common/types/chats.types';
import { TaskDto } from '../../common/dtos/tasks.dto';

export interface ITasksChatEntity {
  chatId: string;
  meta: TaskChatInterface | null;
  messages: MessageInterface[];
  toObject(): { metadata: TaskChatInterface | null; messages: MessageInterface[] };
  getMessages(skip: number, limit?: number): Promise<MessageInterface[]>;
  createChat(metadata: TaskDto, messages?: MessageInterface[]): Promise<this>;
  findChatByParams(params: Partial<TaskChatInterface>): Promise<this>;
  addMessage(chatId: string, message: Partial<MessageInterface>): Promise<this>;
  closeChat(): Promise<this>;
}

@Injectable({ scope: Scope.REQUEST })
export class TasksChatEntity {
  private _meta: TaskChatInterface | null;
  private _messages: MessageInterface[];
  private _chatId: string;

  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly messagesRepository: MessagesRepository
  ) {
    this._meta = null;
    this._messages = [];
    this._chatId = '';
  }

  get chatId(): string {
    return this._chatId;
  }

  get meta(): TaskChatInterface | null {
    return this._meta;
  }

  get messages(): MessageInterface[] {
    return this._messages;
  }

  toObject(): {
    metadata: TaskChatInterface | null;
    messages: MessageInterface[];
  } {
    return {
      metadata: this._meta,
      messages: this._messages,
    };
  }

  async getMessages(skip: number, limit: number = 20): Promise<MessageInterface[]> {
    if (!this._chatId) {
      throw new InternalServerErrorException('Чат не найден');
    }
    const messages = (await this.messagesRepository.find(
      {
        chatId: this._chatId,
      },
      null,
      {
        skip,
        limit,
      }
    )) as MessageInterface[];
    this._messages = messages;
    return messages;
  }

  async createChat(metadata: TaskDto): Promise<this> {
    const chatData = { ...metadata, isActive: true };
    const chat = (await this.chatsRepository.create(chatData)) as TaskChatInterface;
    if (!chat) {
      throw new InternalServerErrorException('Ошибка создания чата');
    }
    this._meta = chat;
    this._chatId = chat._id;
    return this;
  }

  async findChatByParams(params: Partial<TaskChatInterface>): Promise<this> {
    const chats = (await this.chatsRepository.find(params)) as TaskChatInterface[];
    if (chats.length > 0) {
      this._meta = chats[0];
      this._messages = (await this.messagesRepository.find({
        chatId: this._meta._id,
      })) as MessageInterface[];
    } else {
      this._meta = null;
      this._messages = [];
    }
    return this;
  }

  async addMessage(chatId: string, message: Partial<MessageInterface>): Promise<this> {
    if (!this._chatId) {
      throw new InternalServerErrorException({
        message: 'Идентификатор чата не определён',
      });
    }
    const newMessage = (await this.messagesRepository.create({
      ...message,
      chatId,
    })) as MessageInterface;
    this._messages.push(newMessage);
    return this;
  }

  async closeChat(): Promise<this> {
    if (!this._chatId) {
      throw new InternalServerErrorException('Чат не найден');
    }
    const chat = await this.chatsRepository.findById(this._chatId);
    if (!chat) {
      throw new InternalServerErrorException('Чат не найден');
    }
    await this.chatsRepository.updateOne({ _id: this._chatId }, { isActive: false }, {});
    this._meta.isActive = false;
    return this;
  }
}
