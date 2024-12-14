import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiCreateCategoryDto } from './new-category.dto';

// export type updateCategoryDtoType = Partial<ApiCreateCategoryDto>;

export class ApiUpdateCategoryDto implements Partial<ApiCreateCategoryDto> {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  points: number;
}
