import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLastreadCommand } from '../common/commands/update-lastread.command';
import { ChatService } from './chat/chat.service';
import { WebsocketApiGateway } from '../api/websocket-api/websocket-api.gateway';
import { ensureStringId } from '../common/helpers/ensure-string-id';

@CommandHandler(UpdateLastreadCommand)
export class UpdateLastreadHandler implements ICommandHandler<UpdateLastreadCommand> {
  constructor(
    private readonly chatService: ChatService,
    private readonly gateway: WebsocketApiGateway
  ) {}

  async execute({ dto, user }: UpdateLastreadCommand) {
    const { chatId, lastread } = dto;
    const meta = await this.chatService.updateLastread(chatId, lastread, user);
    return this.gateway.sendFreshMeta(ensureStringId(user._id), meta);
  }
}
