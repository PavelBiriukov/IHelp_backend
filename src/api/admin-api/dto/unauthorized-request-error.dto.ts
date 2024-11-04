import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedErrorResponseDto {
  @ApiProperty({
    default: 'Unauthorized',
  })
  message: string;

  @ApiProperty({
    default: 401,
  })
  statusCode: number;
}
