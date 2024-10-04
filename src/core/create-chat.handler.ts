import mongoose from 'mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaskChatCommand } from '../common/commands/create-chat.command';
import { ChatService } from './chat/chats.service';
import { VolunteerInterface, RecipientInterface } from '../common/types/user.types';

@CommandHandler(CreateTaskChatCommand)
export class CreateTaskChatHandler implements ICommandHandler<CreateTaskChatCommand> {
  constructor(private readonly chatService: ChatService) {}

  async execute({ dto }: CreateTaskChatCommand) {
    const taskChatMetadata = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      type: 'TASK_CHAT' as const,
      taskId: dto.taskId,
      volunteer: dto.updatedTask.volunteer as VolunteerInterface,
      recipient: dto.updatedTask.recipient as RecipientInterface,
    };
    return this.chatService.createTaskChat(taskChatMetadata);
  }
}
