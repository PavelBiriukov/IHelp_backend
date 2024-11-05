import { ApiProperty } from '@nestjs/swagger';

import { ContactsInterface } from '../../../common/types/contacts.types';

export class UpdatedContactsDto implements ContactsInterface {
  @ApiProperty({
    example: '66d45e77b279ac443e001e35',
    description: 'Идентификатор записи',
  })
  _id: string;

  @ApiProperty({
    example: 'www@yandex.ru',
    description: 'Email пользователя',
  })
  email: string;

  @ApiProperty({
    example: 'https://vk.com/me2help',
    description: 'Ссылка на профиль в социальной сети',
  })
  socialNetwork: string;

  @ApiProperty({
    example: '2024-09-01T12:30:47.361Z',
    description: 'Дата создания записи',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-09-01T12:30:47.361Z',
    description: 'Дата последнего обновления записи',
  })
  updatedAt: string;
}
