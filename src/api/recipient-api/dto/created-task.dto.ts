import { ApiProperty } from '@nestjs/swagger';
import { PointGeoJSONDto } from '../../../common/dto/api.dto';
import { ResolveStatus, TaskReport, TaskStatus } from '../../../common/types/task.types';
import { CategoryDto } from '../../../common/dto/category.dto';
import { InTaskUserDto } from './in-task-user.dto';

export class CreatedTaskDto {
  @ApiProperty({
    example: 'Москва, Красная Площадь, д.1',
    description: 'Адрес',
  })
  address: string;

  @ApiProperty({
    example: 'created',
    description: 'статус задачи',
  })
  status: TaskStatus.CREATED;

  @ApiProperty({
    enum: ['VIRGIN', 'PENDING', 'FULFILLED', 'REJECTED'],
    example: 'virgin, pending, fulfilled, rejected или null',
    description: 'статус выполнения',
  })
  adminResolve: ResolveStatus | null;

  @ApiProperty({
    description: 'модератор',
  })
  moderator: InTaskUserDto | null;

  @ApiProperty()
  category: CategoryDto;

  @ApiProperty({
    example: '2024-08-30T13:25:45.910+00:00',
    description: 'дата и время',
  })
  date: Date | null;

  @ApiProperty({
    type: PointGeoJSONDto,
    description: 'данные о локации',
  })
  location: PointGeoJSONDto;

  @ApiProperty({
    description: 'данные реципиента',
  })
  recipient: InTaskUserDto;

  @ApiProperty({
    example: 'fulfilled, rejected или null',
    description: 'статус выполнения выставляемый реципиентом',
  })
  recipientReport: TaskReport | null;

  @ApiProperty({
    description: 'данные волонтера',
  })
  volunteer: InTaskUserDto | null;

  @ApiProperty({
    example: 'fulfilled, rejected или null',
    description: 'статус выполнения выставляемый реципиентом',
  })
  volunteerReport: TaskReport | null;

  @ApiProperty({
    example: 'true',
    description: 'ожидание изменения',
  })
  isPendingChanges: boolean;

  @ApiProperty({
    example: 'walkpets',
    description: 'описание задачи',
  })
  description: string;

  @ApiProperty({
    example: '66d1c8595f28e1f67ef545c0',
    description: 'ай ди задачи',
  })
  _id: string;

  @ApiProperty({
    example: '2024-08-30T13:25:45.910+00:00',
    description: 'дата создания',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-08-30T13:25:45.910+00:00',
    description: 'дата обновления',
  })
  updatedAt: Date;
}
