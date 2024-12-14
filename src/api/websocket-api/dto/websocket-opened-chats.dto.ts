import { IsNotEmpty, IsString } from 'class-validator';

interface wsOpenedChatsInfoPayload {
  chatId: string;
}
export class wsOpenedChatsPayloadDto implements wsOpenedChatsInfoPayload {
  @IsString()
  @IsNotEmpty()
  chatId: string;
}
