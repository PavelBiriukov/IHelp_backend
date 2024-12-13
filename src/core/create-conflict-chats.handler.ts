import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TasksRepository } from '../datalake/task/task.repository';
import { TaskInterface, TaskStatus } from '../common/types/task.types';
import { WebsocketApiGateway } from '../api/websocket-api/websocket-api.gateway';
import { CreateConflictChatsCommand } from '../common/commands/create-conflict-chats.command';
import { ChatService, mockTaskChatMeta } from './chat/chats.service';
import { ChatsRepository } from '../datalake/chats/chats.repository';
import {
  ConflictChatContentTuple,
  ConflictChatInfo,
  TaskChatInfo,
} from '../common/types/chats.types';
import { UserRole } from '../common/types/user.types';

@CommandHandler(CreateConflictChatsCommand)
export class CreateConflictChatsHandler implements ICommandHandler<CreateConflictChatsCommand> {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatsRepo: ChatsRepository,
    private readonly gateWay: WebsocketApiGateway,
    private readonly taskRepo: TasksRepository
  ) { }

  async execute({ taskId, moderator }: CreateConflictChatsCommand) {
    let chatTask: TaskChatInfo = await this.chatsRepo.findOne({ taskId });
    chatTask = mockTaskChatMeta;
    const task: TaskInterface = await this.taskRepo.findById(taskId);

    const adminMessage = await this.chatService.addMessage({
      body: `Администратор ${moderator.name} подключился к чату`,
      attaches: [],
      author: moderator,
      chatId: null,
    });
    const createMessageAdmin = await this.chatService.addMessage(adminMessage);
    const systemChat = await this.chatService.createSystemChat(createMessageAdmin);
    const sysChat = {
      meta: systemChat,
      chats: null,
    };
    const confilctMeta = {
      recipient: task.recipient,
      volunteer: task.volunteer,
      status: TaskStatus.CONFLICTED,
      description: null,
      date: new Date(),
      address: task.address,
      location: task.location,
      category: task.category,
      volunteerReport: null,
      recipientReport: null,
      adminResolve: null,
      moderator,
      isPendingChanges: task.isPendingChanges,
    };
    const conflictChat = await this.chatService.createConflictChat(confilctMeta);
    const relatedChat = chatTask.chats.find((message) => message.chatId);
    const messages = await this.chatService.getMessages(relatedChat.chatId, 5);
    const messagesRecipient = messages.filter(
      // eslint-disable-next-line no-return-assign, no-param-reassign
      (message) => (message.author.role = UserRole.RECIPIENT)
    );
    const messagesVolunteer = messages.filter(
      // eslint-disable-next-line no-return-assign, no-param-reassign
      (message) => (message.author.role = UserRole.VOLUNTEER)
    );
    const chatContent: ConflictChatContentTuple = [messagesVolunteer, messagesRecipient];
    const conflict: ConflictChatInfo = {
      meta: conflictChat,
      chats: chatContent,
    };

    await this.gateWay.sendChatMeta([chatTask.meta.volunteer._id, chatTask.meta.recipient._id], {
      task: [chatTask],
      system: [sysChat],
      conflict: [conflict],
    });
  }
}
