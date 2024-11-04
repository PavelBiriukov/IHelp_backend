import { ApiProperty } from '@nestjs/swagger';
import { NewUserInterface } from '../../../common/types/api.types';
import { UserRole } from '../../../common/types/user.types';

export class UserDto implements NewUserInterface {
  @ApiProperty({
    example: '66e286b3b279ac443e0029e5',
    description: 'Уникальный идентификатор пользователя',
  })
  _id: string;

  @ApiProperty({ example: 'Анастасия Волкова', description: 'Имя пользователя' })
  name: string;

  @ApiProperty({ example: '+7 (787) 777-78-87', description: 'Номер телефона' })
  phone: string;

  @ApiProperty({ example: 'Москва, улица Гурьянова', description: 'Адрес пользователя' })
  address: string;

  @ApiProperty({ example: 'Volunteer', description: 'Роль пользователя' })
  role: UserRole;

  @ApiProperty({
    example:
      'https://sun1-55.userapi.com/s/v1/ig2/KUqSBr1y28rrFnR3P5GpUQILqgA3Kzk2G6hwYECeUhg4hHZsysvUNe-nKNtR3gzY4NrIoi5zmnMHbMm6vTA5EHcw.jpg',
    description: 'Аватар пользователя',
  })
  avatar: string;

  @ApiProperty({ example: 0, description: 'Количество выполненных заданий' })
  tasksCompleted: number;

  @ApiProperty({ example: 0, description: 'Счёт пользователя' })
  score: number;

  @ApiProperty({ example: 1, description: 'Статус пользователя' })
  status: number;

  @ApiProperty({ example: '115266365', description: 'Идентификатор VK пользователя' })
  vkId: string;

  @ApiProperty({
    example: { type: 'Point', coordinates: [55.684635, 37.71742] },
    description: 'Координаты местоположения пользователя',
  })
  location: {
    type: string;
    coordinates: number[];
  };

  @ApiProperty({ example: false, description: 'Наличие ключей' })
  keys: boolean;

  @ApiProperty({ example: '2024-09-12T06:14:11.355Z', description: 'Дата создания пользователя' })
  createdAt: string;

  @ApiProperty({
    example: '2024-09-17T13:04:28.759Z',
    description: 'Дата обновления данных пользователя',
  })
  updatedAt: string;
}
