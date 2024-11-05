import { ApiProperty } from '@nestjs/swagger';

export class BadRequestErrorResponseDto {
  @ApiProperty({
    type: [String],
    description: 'Список сообщений об ошибках валидации',
  })
  message: string[];

  @ApiProperty({
    default: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    default: 400,
  })
  statusCode: number;
}
