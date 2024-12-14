import { ApiProperty } from '@nestjs/swagger';
import { ApiPrivilegesDto } from './privileges.dto';

export class UpdatedAdminDto {
  @ApiProperty({
    example: '66fd7b747d8163d4a3c0b515',
    description: 'Уникальный идентификатор',
  })
  _id: string;

  @ApiProperty({
    example: ['CONFIRM_USER'],
    description: 'Список разрешений пользователя',
    isArray: true,
  })
  permissions: ApiPrivilegesDto[];

  @ApiProperty({
    example: 'admin123',
    description: 'Логин пользователя',
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
    description: 'Адрес пользователя',
  })
  address: string;

  @ApiProperty({
    example: 'https://kspshnik.com/pub/img/brienzersee_pre.jpg',
    description: 'Ссылка на аватар пользователя',
  })
  avatar: string;

  @ApiProperty({
    example: 'name5',
    description: 'Имя пользователя',
  })
  name: string;

  @ApiProperty({
    example: '+78776637383',
    description: 'Телефонный номер пользователя',
  })
  phone: string;

  @ApiProperty({
    example: '1948387874309540012',
    description: 'VK ID пользователя в виде строки',
  })
  vkId: string;

  @ApiProperty({
    example: 'Admin',
    description: 'Роль пользователя',
  })
  role: string;

  @ApiProperty({
    example: '2024-10-02T16:57:24.250Z',
    description: 'Дата создания учетной записи',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-10-02T17:15:41.608Z',
    description: 'Дата последнего обновления учетной записи',
    format: 'date-time',
  })
  updatedAt: string;
}
