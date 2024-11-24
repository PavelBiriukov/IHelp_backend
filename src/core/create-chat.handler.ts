import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaskChatCommand } from '../common/commands/create-chat.command';
import { ChatService } from './chat/chats.service';
import { CreateTaskChatDtoType } from '../common/types/chats.types';
import { VolunteerInterface, RecipientInterface } from '../common/types/user.types';
import { WebsocketApiGateway } from '../api/websocket-api/websocket-api.gateway';

@CommandHandler(CreateTaskChatCommand)
export class CreateTaskChatHandler implements ICommandHandler<CreateTaskChatCommand> {
  constructor(
    private readonly chatService: ChatService,
    private readonly websocketApiGateway: WebsocketApiGateway
  ) {}

  async execute({ dto }: CreateTaskChatCommand) {
    const { taskId, updatedTask } = dto;

    const taskChatMetadata: CreateTaskChatDtoType = {
      type: 'TASK_CHAT' as const,
      taskId,
      volunteer: updatedTask.volunteer as VolunteerInterface,
      recipient: updatedTask.recipient as RecipientInterface,
    };
    const chatMeta = await this.chatService.createTaskChat(taskChatMetadata);

    return this.websocketApiGateway.sendChatMeta(
      [updatedTask.recipient._id, updatedTask.volunteer._id],
      {
        task: [chatMeta],
        system: [],
        conflict: [],
        my: [],
        moderated: [],
      }
    );
  }
}
