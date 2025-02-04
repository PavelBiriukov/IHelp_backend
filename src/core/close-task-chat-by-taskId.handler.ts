import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloseTaskChatByTaskIdCommand } from '../common/commands/close-task-chat-by-taskId.command';
import { ChatService } from './chat/chat.service';

@CommandHandler(CloseTaskChatByTaskIdCommand)
export class CloseTaskChatByTaskIdHandler implements ICommandHandler<CloseTaskChatByTaskIdCommand> {
  constructor(private readonly chatService: ChatService) {}

  async execute({ taskId }: CloseTaskChatByTaskIdCommand) {
    return this.chatService.closeTaskChatByTask(taskId);
  }
}
