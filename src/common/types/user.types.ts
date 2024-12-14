import { PointGeoJSONInterface } from './point-geojson.types';
import { MongooseIdAndTimestampsInterface } from './system.types';
// eslint-disable-next-line import/no-cycle
import { AccessRights } from './access-rights.types';

/* export type UserProfile = {
  firstName: string;
  middleName: string;
  lastName: string;
  phone: string;
  avatar: string;
  address: string;
}; */

export enum UserStatus {
  BLOCKED = -1,
  UNCONFIRMED = 0,
  CONFIRMED = 1,
  VERIFIED = 2,
  ACTIVATED = 3,
}

export enum UserRole {
  ADMIN = 'Admin',
  RECIPIENT = 'Recipient',
  VOLUNTEER = 'Volunteer',
  USER = 'GeneralUser',
}

export type UserRoleType = `${UserRole}`;

export enum AdminPermission {
  CONFIRMATION = AccessRights.confirmUser,
  TASKS = AccessRights.createTask,
  KEYS = AccessRights.giveKey,
  CONFLICTS = AccessRights.resolveConflict,
  BLOG = AccessRights.contentEditor,
  CATEGORIES = AccessRights.categoryPoints,
}
/* export enum ResolveStatus {
  PENDING = 'pending',
  FULLFILLED = 'fullfilled',
  REJECTED = 'rejected',
} */

export interface GenericUserModelInterface {
  name: string;
  phone: string;
  avatar: string;
  address: string;
  vkId: string;
  role: string;
}

export interface UserProfile extends GenericUserModelInterface {
  _id: string;
}

export interface VolunteerUserModelInterface {
  score: number;
  status: UserStatus;
  location: PointGeoJSONInterface;
  keys: boolean;
  tasksCompleted: number;
}

export interface RecipientUserModelInterface {
  status: UserStatus;
  location: PointGeoJSONInterface;
}

export interface AdminUserModelInterface {
  permissions: AdminPermission[];
  login: string;
  password: string;
  isRoot: boolean;
  isActive: boolean;
}

export interface VolunteerInterface
  extends GenericUserModelInterface,
    VolunteerUserModelInterface,
    MongooseIdAndTimestampsInterface {}
export interface RecipientInterface
  extends GenericUserModelInterface,
    RecipientUserModelInterface,
    MongooseIdAndTimestampsInterface {}
export interface AdminInterface
  extends GenericUserModelInterface,
    AdminUserModelInterface,
    MongooseIdAndTimestampsInterface {}

export interface AnyUserModelInterface
  extends GenericUserModelInterface,
    VolunteerUserModelInterface,
    RecipientUserModelInterface,
    AdminUserModelInterface {}
export interface AnyUserInterface
  extends VolunteerInterface,
    RecipientInterface,
    AdminInterface,
    MongooseIdAndTimestampsInterface {}

export interface UserModelVirtuals {
  fullName: string;
  profile: UserProfile;
}

export interface AuthorProfile {
  name: string;
  avatar: string;
  userId: string;
}
