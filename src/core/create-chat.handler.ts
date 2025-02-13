import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaskChatCommand } from '../common/commands/create-chat.command';
import { ChatService } from './chat/chat.service';
import {
  ConflictChatInfo,
  GetUserChatsResponseDtoInterface,
  MessageInterface,
  SystemChatInfo,
  TaskChatMetaInterface,
} from '../common/types/chats.types';
import { WebsocketApiGateway } from '../api/websocket-api/websocket-api.gateway';

@CommandHandler(CreateTaskChatCommand)
export class CreateTaskChatHandler implements ICommandHandler<CreateTaskChatCommand> {
  constructor(
    private readonly chatService: ChatService,
    private readonly websocketApiGateway: WebsocketApiGateway
  ) {}

  async execute({ dto }: CreateTaskChatCommand) {
    const { updatedTask } = dto;
    const meta: TaskChatMetaInterface = await this.chatService.createTaskChat(updatedTask);
    const chats: Array<MessageInterface> = [];
    const data: GetUserChatsResponseDtoInterface = {
      task: [{ meta, chats }],
      system: [] as Array<SystemChatInfo>,
      conflict: [] as Array<ConflictChatInfo>,
    };
    return this.websocketApiGateway.sendChatMeta(
      [updatedTask.recipient._id, updatedTask.volunteer._id],
      data
    );
  }
}
