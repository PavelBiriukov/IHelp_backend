import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateTaskDto } from '../../../common/dto/tasks.dto';

export class ApiCreateTaskDto implements Omit<CreateTaskDto, 'recipientId'> {
  @ApiProperty({
    example: '66d193fa211c8a47b0f07785',
    description: 'Айди категории',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({
    required: true,
    type: [Number, Number],
    example: [58, 58],
    description: 'координаты',
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  location: [number, number];

  @ApiProperty()
  @IsOptional()
  @IsDateString()
  date: Date | null;

  @ApiProperty({
    example: 'Москва, Красная Площадь, д.1',
    description: 'Адрес',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    example: 'Погулять с собачкой',
    description: 'Описание задачи',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  description: string;
}
