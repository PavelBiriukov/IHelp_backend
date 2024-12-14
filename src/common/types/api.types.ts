import { RecipientInterface, UserRole } from './user.types';
import { PointGeoJSONInterface } from './point-geojson.types';
import { User } from '../../datalake/users/schemas/user.schema';
import { Volunteer } from '../../datalake/users/schemas/volunteer.schema';
import { Recipient } from '../../datalake/users/schemas/recipient.schema';
import { Admin } from '../../datalake/users/schemas/admin.schema';
import { AccessRights } from './access-rights.types';
import { CategoryInterface } from './category.types';

export interface VKLoginDtoInterface {
  code: string;
  redirectUrl: string;
  state?: string;
}

interface VKResponseOKInterface {
  access_token: string;
  user_id: number;
  expires_in: number;
  email: string;
}

interface VKResponseErrorInterface {
  error: string;
  error_description: string;
}

export interface VKResponseInterface extends VKResponseOKInterface, VKResponseErrorInterface {}

// TODO: Сделать более строгую типизацию после разъяснения ситуации с типизацией дискриминированных схем
export type PayloadType = Record<string, unknown>;

export interface NewProfileInterface {
  name: string;
  phone: string;
  avatar?: string;
  address: string;
}

export interface NewUserInterface extends NewProfileInterface {
  role: UserRole;
  vkId: string;
}

export interface VKNewUserInterface extends NewUserInterface {
  location?: PointGeoJSONInterface;
}

export interface NewAdminInterface extends Omit<NewUserInterface, 'role'> {
  login: string;
  password: string;
}

export type jwtPayload = {
  _id: string;
  role: UserRole;
  permissions: Array<AccessRights>;
  isRoot: boolean;
};

export interface EnrichedRequest extends Request {
  user?: User & (Volunteer | Recipient | Admin);
}

export interface UpdatePasswordDtoInterface {
  password: string;
}

export interface PublicTaskResponseDto {
  description?: string;
  location: PointGeoJSONInterface;
  category: Pick<CategoryInterface, 'points' | 'title'>;
  recipient: Pick<RecipientInterface, 'name' | '_id' | 'avatar'>;
}

export type PublicTasksResponseDto = Array<PublicTaskResponseDto>;
