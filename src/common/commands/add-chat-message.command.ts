import { WsNewMessage } from '../types/websockets.types';
import { AnyUserInterface } from '../types/user.types';

export class AddChatMessageCommand {
  constructor(public readonly message: WsNewMessage, public readonly user: AnyUserInterface) {}
}
