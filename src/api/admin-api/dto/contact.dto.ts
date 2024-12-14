import { ApiProperty } from '@nestjs/swagger';
import { ContactsInterface } from '../../../common/types/contacts.types';

export class ContactInfoDto implements ContactsInterface {
  @ApiProperty({
    example: 'www2@yandex.ru',
    description: 'Электронный адрес',
  })
  email: string;

  @ApiProperty({
    example: 'https://vk.com/me2help',
    description: 'Социальная сеть',
  })
  socialNetwork: string;
}
