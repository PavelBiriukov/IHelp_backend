import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UpdatePasswordDtoInterface } from '../../../common/types/api.types';

export class SetAdminPasswordDto implements UpdatePasswordDtoInterface {
  @ApiProperty({ description: 'Новый пароль администратора', example: 'Dksc7w2349n0-=uhswfc877d$' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
