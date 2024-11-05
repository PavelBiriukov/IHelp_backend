/* eslint-disable max-classes-per-file */

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BulkUpdateCategoryInterface } from '../../../common/types/category.types';
import { ApiUpdateCategoryDto } from './update-category.dto';

class BulkUpdateCategory extends ApiUpdateCategoryDto implements BulkUpdateCategoryInterface {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class ApiBulkUpdateCategoriesDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateCategory)
  data: BulkUpdateCategory[];
}
