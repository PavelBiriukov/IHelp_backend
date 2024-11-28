import { WsNewMessage } from '../types/websockets.types';

export class AddChatMessageCommand {
  constructor(public readonly message: WsNewMessage) {}
}
