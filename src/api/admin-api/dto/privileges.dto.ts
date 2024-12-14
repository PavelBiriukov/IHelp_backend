import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDefined, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { AdminPermission } from '../../../common/types/user.types';

export class ApiPrivilegesDto {
  @ApiProperty({
    enum: AdminPermission,
    isArray: true,
    description: 'Массив с перечислением привилегий администратора',
    example: [AdminPermission.CONFLICTS, AdminPermission.CATEGORIES],
  })
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @IsIn(
    [
      AdminPermission.CONFLICTS,
      AdminPermission.CATEGORIES,
      AdminPermission.KEYS,
      AdminPermission.BLOG,
      AdminPermission.TASKS,
      AdminPermission.CONFIRMATION,
    ],
    { each: true }
  )
  privileges: AdminPermission[];
}
