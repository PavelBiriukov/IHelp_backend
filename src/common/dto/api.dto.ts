/* eslint-disable max-classes-per-file */

import { IsIn, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, IsUrl } from 'class-validator';
import { NewProfileInterface } from '../types/api.types';
import { PointGeoJSONInterface } from '../types/point-geojson.types';
import { IsCoords } from '../decorators/is-coords';
import { AdminPermission, UserRole, UserStatus } from '../types/user.types';

export class PointGeoJSONDto implements PointGeoJSONInterface {
  @ApiProperty()
  @IsCoords()
  @IsNotEmpty()
  coordinates: GeoCoordinates;

  @IsIn(['Point'])
  type: 'Point';
}

export class NewProfileDto implements NewProfileInterface {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsUrl()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsPhoneNumber('RU')
  phone: string;
}

export class UserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  avatar?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  vkId: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => PointGeoJSONDto)
  @IsNotEmpty()
  location: PointGeoJSONDto;

  @ApiProperty()
  @ApiProperty()
  keys?: boolean;

  @ApiProperty()
  @IsNumber()
  score?: number;
}
export class AnswerOkDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  user: UserDto;
}

export class AdminDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  permissions: Array<AdminPermission>;

  @ApiProperty()
  login: string;

  @ApiProperty()
  isRoot: boolean;

  @ApiProperty()
  isActive: true;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  avatar?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  vkId: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}

export class AnswerAdminOkDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  user: AdminDto;
}
