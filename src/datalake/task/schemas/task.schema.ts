import mongoose, { Document, ObjectId, SchemaTypes } from 'mongoose';
import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ResolveStatus,
  TaskInterface,
  TaskModelInterface,
  TaskReport,
  TaskStatus,
} from '../../../common/types/task.types';
import { PointGeoJSON, PointGeoJSONSchema } from '../../../common/schemas/PointGeoJSON.schema';
import { UserProfile } from '../../../common/types/user.types';
import {
  rawCategory,
  rawUserProfile,
} from '../../../common/constants/mongoose-fields-raw-definition';
import { CategoryInterface } from '../../../common/types/category.types';

@Schema({
  timestamps: true,
  toObject: {
    versionKey: false,
    virtuals: false,
    flattenObjectIds: true,
  },
})
export class Task
  extends Document<ObjectId, Record<string, never>, TaskInterface>
  implements TaskInterface
{
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
  })
  _id: ObjectId;

  @Prop({ type: mongoose.SchemaTypes.String, required: true })
  address: string;

  @Prop({
    default: TaskStatus.CREATED,
    type: mongoose.SchemaTypes.String,
    enum: Object.values(TaskStatus),
  })
  status: TaskStatus;

  @Prop({
    default: null,
    type: mongoose.SchemaTypes.String,
    enum: [...Object.values<string>(ResolveStatus), null],
    required: false,
  })
  adminResolve: ResolveStatus | null;

  @Prop({ type: raw(rawUserProfile), required: false, default: null })
  moderator: UserProfile | null;

  @Prop({ type: raw(rawCategory), required: true, immutable: true })
  category: CategoryInterface;

  @Prop({ required: false, type: mongoose.SchemaTypes.Date })
  date: Date | null;

  @Prop({ required: true, type: PointGeoJSONSchema, index: '2dsphere' })
  location: PointGeoJSON;

  @Prop({ type: raw(rawUserProfile), required: true, immutable: true })
  recipient: UserProfile;

  @Prop({
    default: null,
    type: mongoose.SchemaTypes.String,
    enum: [...Object.values<string>(TaskReport), null],
    required: false,
  })
  recipientReport: TaskReport | null;

  @Prop({ type: raw(rawUserProfile), required: false })
  volunteer: UserProfile;

  @Prop({
    default: null,
    type: mongoose.SchemaTypes.String,
    enum: [...Object.values<string>(TaskReport), null],
    required: false,
  })
  volunteerReport: TaskReport | null;

  @Prop({ type: mongoose.SchemaTypes.Boolean, default: false })
  isPendingChanges: boolean;

  @Prop({ type: mongoose.SchemaTypes.String, required: true })
  description: string;

  @Prop({
    required: true,
    type: SchemaTypes.Date,
  })
  createdAt: Date;

  @Prop({
    required: true,
    type: SchemaTypes.Date,
  })
  updatedAt: Date;

  /* static async findWithin(center: GeoCoordinates, distance: number): Promise<Array<Task>> {
    return Task.find({
      location: {
        $near: {
          $geometry: center,
          $maxDistance: distance,
        },
      },
    });
  } */
}
export const TaskSchema = SchemaFactory.createForClass<TaskModelInterface>(Task);
