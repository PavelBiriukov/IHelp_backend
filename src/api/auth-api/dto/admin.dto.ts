import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @ApiProperty({
    example: 'admin',
    description: 'Логин администратора',
  })
  login: string;

  @IsString()
  @MinLength(2)
  @ApiProperty({
    example: 'vwonvow',
    description: 'Пароль администратора',
  })
  password: string;
}
