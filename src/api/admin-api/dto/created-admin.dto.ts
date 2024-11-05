import { ApiProperty } from '@nestjs/swagger';
import { NewAdminInterface } from '../../../common/types/api.types';

export class CreatedAdminDto implements Omit<NewAdminInterface, 'password'> {
  @ApiProperty({
    example: '66e00b10886d5b0bae564600',
    description: 'Уникальный идентификатор',
  })
  _id: string;

  @ApiProperty({
    example: 'Admin',
    description: 'Логин',
  })
  login: string;

  @ApiProperty({
    example: null,
    description: 'VK ID пользователя, может быть null',
    nullable: true,
  })
  vkID: string | null;

  @ApiProperty({
    example: false,
    description: 'Является ли пользователь главным администратором (root)',
  })
  isRoot: boolean;

  @ApiProperty({
    example: true,
    description: 'Активирован ли администратор',
  })
  isActive: boolean;

  @ApiProperty({
    example: '...не дом и не улица...',
    description: 'Адрес администратора',
  })
  address: string;

  @ApiProperty({
    example: 'https://kspshnik.com/pub/img/brienzersee_pre.jpg',
    description: 'Ссылка на аватар',
  })
  avatar: string;

  @ApiProperty({
    example: 'name5',
    description: 'Имя',
  })
  name: string;

  @ApiProperty({
    example: '+78776637383',
    description: 'Телефонный номер',
  })
  phone: string;

  @ApiProperty({
    example: '1948387874309540000',
    description: 'VK ID в виде строки',
  })
  vkId: string;

  @ApiProperty({
    example: 'Admin',
    description: 'Роль пользователя',
  })
  role: string;

  @ApiProperty({
    example: '2024-09-10T09:02:08.696Z',
    description: 'Дата создания учетной записи',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-09-10T09:02:08.696Z',
    description: 'Дата последнего обновления учетной записи',
    format: 'date-time',
  })
  updatedAt: string;
}
