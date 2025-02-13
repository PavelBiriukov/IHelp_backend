import { MessageInterface } from '../../../common/types/chats.types';

export interface ChatPageResponseDtoInterface {
  messages: Array<MessageInterface>;
}

export class ChatPageResponseDto implements ChatPageResponseDtoInterface {
  messages: Array<MessageInterface>;
}
