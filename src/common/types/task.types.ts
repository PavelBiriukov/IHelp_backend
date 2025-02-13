import { PointGeoJSONInterface } from './point-geojson.types';
import { CategoryInterface } from './category.types';
import { UserProfile } from './user.types';
import { MongooseIdAndTimestampsInterface } from './system.types';

export enum TaskStatus {
  CREATED = 'created',
  ACCEPTED = 'accepted',
  COMPLETED = 'completed',
  CONFLICTED = `conflicted`,
}

export enum ResolveStatus {
  VIRGIN = 'virgin',
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

export enum ResolveResult {
  FULFILLED = ResolveStatus.FULFILLED,
  REJECTED = ResolveStatus.REJECTED,
}

export enum ReportStatus {
  PENDING = 'pending',
  REPORTED = 'reported',
}

export enum TaskReport {
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

export interface TaskModelInterface {
  recipient: UserProfile;
  volunteer: UserProfile | null;
  status: TaskStatus;
  description?: string;
  date: Date | null;
  address: string;
  location: PointGeoJSONInterface;
  category: CategoryInterface;
  volunteerReport: TaskReport | null;
  recipientReport: TaskReport | null;
  adminResolve: ResolveStatus | null;
  moderator: UserProfile | null;
  isPendingChanges: boolean;
}

export interface TaskInterface extends TaskModelInterface, MongooseIdAndTimestampsInterface {}

export interface TaskModelVirtuals {
  status: TaskStatus;
}

export interface TaskClosingProps {
  taskId: string;
}

export interface FulfilledTaskClosingProps extends TaskClosingProps {
  volunteerId: string;
  categoryPoints: number;
}

export type TaskClosingConditionalProps =
  | {
      adminResolveResult?: ResolveResult;
      userIndex?: never;
    }
  | {
      adminResolveResult?: never;
      userIndex?: string;
    };
