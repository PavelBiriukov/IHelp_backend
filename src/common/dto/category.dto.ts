import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { UserStatus } from '../types/user.types';

export type CreateCategoryDto = {
  title: string;
  points: number;
  accessLevel: UserStatus;
};

export type UpdateCategoryDto = Partial<CreateCategoryDto> & {
  _id?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export class CategoryDto {
  @IsString()
  @ApiProperty({
    example: '66d193fa211c8a47b0f07785',
    description: 'ай ди категории',
  })
  _id: string;

  @ApiProperty({
    example: 'Pets',
    description: 'название категории',
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: Number,
    example: 10,
    description: 'количество очков',
  })
  @IsNumber()
  points: number;

  @ApiProperty({
    type: Number,
    example: 1,
    description: 'уровень доступа',
  })
  @IsNumber()
  accessLevel: number;
}
