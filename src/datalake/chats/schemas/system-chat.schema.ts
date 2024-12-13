import { SchemaTypes, Document } from 'mongoose';
import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { SystemChatModelInterface } from '../../../common/types/chats.types';
import {
  VolunteerInterface,
  RecipientInterface,
  AdminInterface,
} from '../../../common/types/user.types';
import { rawUserProfile } from '../../../common/constants/mongoose-fields-raw-definition';

@Schema({
  timestamps: true,
  toObject: {
    versionKey: false,
    virtuals: true,
    flattenObjectIds: true,
  },
})
export class SystemChat extends Document implements SystemChatModelInterface {
  @Prop({
    required: false,
    default: null,
    type: SchemaTypes.Date,
  })
  userLastReadAt: Date | null;

  @Prop({
    required: false,
    default: null,
    type: SchemaTypes.Date,
  })
  adminLastReadAt: Date | null;

  @Prop({
    required: true,
    type: raw(rawUserProfile),
  })
  user: VolunteerInterface | RecipientInterface;

  @Prop({
    required: false,
    default: null,
    type: raw(rawUserProfile),
  })
  admin: AdminInterface | null;
}

export const SystemChatSchema = SchemaFactory.createForClass(SystemChat);
