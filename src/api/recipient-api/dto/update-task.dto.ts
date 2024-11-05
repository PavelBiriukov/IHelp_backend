import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

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
import { ApiCreateTaskDto } from './create-task.dto';

export class ApiUpdateTaskDto extends PartialType(ApiCreateTaskDto) {
  @ApiProperty({
    example: '66d193fa211c8a47b0f07785',
    description: 'ай ди категории',
    required: false,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({
    required: false,
    type: [Number, Number],
    example: [58, 58],
    description: 'координаты',
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  location: [number, number];

  @ApiProperty({
    required: false,
    example: '2024-09-11T07:37:16.942+00:00',
    description: 'дата и время',
  })
  @IsOptional()
  @IsDateString()
  date: Date | null;

  @ApiProperty({ required: false, example: 'Москва, Красная Площадь, д.1', description: 'адрес' })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ required: false, example: 'погулять с собачкой', description: 'описание задачи' })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  description: string;
}
