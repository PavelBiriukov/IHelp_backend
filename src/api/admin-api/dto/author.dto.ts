import { ApiProperty } from '@nestjs/swagger';
import { NewProfileInterface } from '../../../common/types/api.types';

export class AuthorDto implements NewProfileInterface {
  @ApiProperty({
    example: '66e286b3b279ac443e0029e5',
    description: 'Уникальный идентификатор пользователя',
  })
  _id: string;

  @ApiProperty({ example: 'name4', description: 'Имя автора', required: true })
  name: string;

  @ApiProperty({ example: '+79203332233', description: 'Телефон автора', required: true })
  phone: string;

  @ApiProperty({ example: 'new adress2', description: 'Адрес автора', required: true })
  address: string;

  @ApiProperty({
    example: 'https://kspshnik.com/pub/img/brienzersee_pre.jpg',
    description: 'Аватар автора',
    required: false,
  })
  avatar?: string;
}
