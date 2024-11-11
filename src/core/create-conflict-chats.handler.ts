import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateConflictChatsCommand } from '../common/commands/create-conflict-chats.command';
import { ChatService } from './chat/chats.service';
import { ChatsRepository } from '../datalake/chats/chats.repository';
import {
  ConflictChatsTupleMetaInterface,
  RecipientConflictChatMetaInterface,
  TaskChatModelInterface,
  VolunteerConflictChatMetaInterface,
} from '../common/types/chats.types';

@CommandHandler(CreateConflictChatsCommand)
export class CreateConflictChatsHandler implements ICommandHandler<CreateConflictChatsCommand> {
  constructor(
    private readonly chatService: ChatService,
    private readonly commandBus: CommandBus,
    private readonly chatsRepo: ChatsRepository
  ) { }

  async execute({ taskId, moderator }: CreateConflictChatsCommand) {
    const chatTask: TaskChatModelInterface = await this.chatsRepo.findOne({ taskId });
    const volunteerChats = await this.chatService.getUserChatsMeta(chatTask.volunteer._id);
    const volunteerChat = volunteerChats.find(
      (chat) => (chat as VolunteerConflictChatMetaInterface).type === 'CONFLICT_CHAT_WITH_VOLUNTEER'
    ) as VolunteerConflictChatMetaInterface;

    const recipientChats = await this.chatService.getUserChatsMeta(chatTask.recipient._id);
    const recipientChat = recipientChats.find(
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
    console.log('CreateConflictChatsHandler', conflictChatMetadate);
    return this.chatService.createConflictChat(conflictChatMetadate);
  }
}
