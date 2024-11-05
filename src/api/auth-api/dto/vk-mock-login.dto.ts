import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MockLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '1234567',
    description: 'Вк айди',
  })
  vkId: string;
}
