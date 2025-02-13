import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AnyUserInterface } from '../../../common/types/user.types';
import { WsNewMessage } from '../../../common/types/websockets.types';

export class NewMessageDto implements WsNewMessage {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiProperty()
  attaches: string[];

  @ApiProperty()
  @IsNotEmpty()
  author: AnyUserInterface;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  chatId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  timestamp: string;
}
