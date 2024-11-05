/* eslint-disable max-classes-per-file */

import { IsIn, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NewProfileInterface } from '../types/api.types';
import { GeoCoordinates, PointGeoJSONInterface } from '../types/point-geojson.types';
import { IsCoords } from '../decorators/is-coords';
import { AdminPermission, UserRole } from '../types/user.types';
import { UserDto } from '../../api/admin-api/dto/user.dto';

export class PointGeoJSONDto implements PointGeoJSONInterface {
  @ApiProperty({
    required: true,
    type: [Number, Number],
    example: [58, 58],
    description: 'координаты',
  })
  @IsCoords()
  @IsNotEmpty()
  coordinates: GeoCoordinates;

  @ApiProperty({
    required: true,
    example: ['Point'],
    description: 'точка',
  })
  @IsIn(['Point'])
  type: 'Point';
}

export class NewProfileDto implements NewProfileInterface {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsPhoneNumber('RU')
  phone: string;
}

export class AnswerOkDto {
  @ApiProperty({
    example:
      'eyJhbGciOiLIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmQxYjJlMmU0YTFhMjY5MzIyNjdhMjAiLCJwZXJtaXNzaW9ucyI6W10sImxvZ2luIjoiYWRtaW4iLCJpc1Jvb3QiOnRydWUsImlzQWN0aXZlIjp0cnVlLCJhZGRyZXNzIjoiYWRtaW5ob21lIiwiYXZhdGFyIjoiIiwibmFtZSI6InRlc3QyIiwicGhvbmUiOiIrNzkwNjIwMjk4ODEiLCJ2a0lkIjoiMTI1NDYzOTkiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3MzA3OTQ4NjYsImV4cCI6MTczMTM5OTY2Nn0.Ov1ln56KH1QPSuPYDKxAGJljRszPnG3-q4xt2Z41h4Q',
    description: 'токен',
  })
  token: string;

  @ApiProperty({
    description: 'DTO пользователя',
  })
  user: UserDto;
}

export class AdminDto {
  @ApiProperty({
    example: '66e286b3b279ac443e0029e5',
    description: 'Уникальный идентификатор пользователя',
  })
  _id: string;

  @ApiProperty({
    enum: [
      'CONFIRM_USER',
      'CREATE_TASK',
      'GIVE_KEY',
      'RESOLVE_CONFLICT',
      'EDIT_BLOG',
      'SET_CATEGORY_POINTS',
    ],
    example: 'CONFIRM_USER',
    description: 'Права администратора',
  })
  permissions: Array<AdminPermission>;

  @ApiProperty({
    example: 'admin',
    description: 'Логин администратора',
  })
  login: string;

  @ApiProperty({
    example: 'true',
    description: 'Наличие полномочий главного администратора',
  })
  isRoot: boolean;

  @ApiProperty({
    example: 'true',
    description: 'Наличие активации у администратора',
  })
  isActive: true;

  @ApiProperty({ example: 'Москва, улица Гурьянова', description: 'Адрес администратора' })
  address: string;

  @ApiProperty({
    example:
      'https://sun1-55.userapi.com/s/v1/ig2/KUqSBr1y28rrFnR3P5GpUQILqgA3Kzk2G6hwYECeUhg4hHZsysvUNe-nKNtR3gzY4NrIoi5zmnMHbMm6vTA5EHcw.jpg',
    description: 'Аватар администратора',
  })
  avatar?: string;

  @ApiProperty({ example: 'Анастасия Волкова', description: 'Имя администратора' })
  name: string;

  @ApiProperty({ example: '+7 (787) 777-78-87', description: 'Номер телефона' })
  phone: string;

  @ApiProperty({ example: '115266365', description: 'Идентификатор VK пользователя' })
  vkId: string;

  @ApiProperty({
    enum: ['Admin', 'Recipient', 'Volunteer', 'GeneralUser'],
    example: 'Admin',
    description: 'Роль пользователя',
  })
  role: UserRole;
}

export class AnswerAdminOkDto {
  @ApiProperty({
    example:
      'eyJhbGciOiLIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmQxYjJlMmU0YTFhMjY5MzIyNjdhMjAiLCJwZXJtaXNzaW9ucyI6W10sImxvZ2luIjoiYWRtaW4iLCJpc1Jvb3QiOnRydWUsImlzQWN0aXZlIjp0cnVlLCJhZGRyZXNzIjoiYWRtaW5ob21lIiwiYXZhdGFyIjoiIiwibmFtZSI6InRlc3QyIiwicGhvbmUiOiIrNzkwNjIwMjk4ODEiLCJ2a0lkIjoiMTI1NDYzOTkiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3MzA3OTQ4NjYsImV4cCI6MTczMTM5OTY2Nn0.Ov1ln56KH1QPSuPYDKxAGJljRszPnG3-q4xt2Z41h4Q',
    description: 'токен',
  })
  token: string;

  @ApiProperty({
    description: 'DTO администратора',
  })
  user: AdminDto;
}
