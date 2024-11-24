/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VKNewUserInterface } from '../../../common/types/api.types';
import { UserRole } from '../../../common/types/user.types';
import { PointGeoJSONDto } from '../../../common/dto/api.dto';

export class VKNewUserDto implements VKNewUserInterface {
  @ApiProperty({ example: 'Москва, улица Гурьянова', description: 'Адрес пользователя' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    example:
      'https://sun1-55.userapi.com/s/v1/ig2/KUqSBr1y28rrFnR3P5GpUQILqgA3Kzk2G6hwYECeUhg4hHZsysvUNe-nKNtR3gzY4NrIoi5zmnMHbMm6vTA5EHcw.jpg',
    description: 'Аватар пользователя',
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiProperty({ example: 'Анастасия Волкова', description: 'Имя пользователя' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '+7 (787) 777-78-87', description: 'Номер телефона' })
  @IsString()
  @IsPhoneNumber('RU')
  phone: string;

  @ApiProperty({
    enum: ['Admin', 'Recipient', 'Volunteer', 'GeneralUser'],
    example: 'Recipient',
    description: 'Роль пользователя',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: '115266365', description: 'Идентификатор VK пользователя' })
  @IsString()
  vkId: string;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => PointGeoJSONDto)
  location: PointGeoJSONDto;
}
