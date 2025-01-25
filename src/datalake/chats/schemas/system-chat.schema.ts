import { Document, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
// eslint-disable-next-line import/no-cycle
import { SystemChatModelInterface } from '../../../common/types/chats.types';
import {
  VolunteerInterface,
  RecipientInterface,
  AdminInterface,
} from '../../../common/types/user.types';
import { rawUserProfile } from '../../../common/constants/mongoose-fields-raw-definition';
import { ChatType, ChatTypes } from '../../../common/types/system.types';

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

  @Prop({
    required: false,
    default: true,
    type: SchemaTypes.Boolean,
  })
  isActive: boolean;

  @Prop({
    required: true,
    enum: Object.values<string>(ChatType),
  })
  type: ChatTypes;

  @Prop({
    required: false,
    default: null,
    type: SchemaTypes.Date,
  })
  createdAt: string | Date;

  @Prop({
    required: false,
    default: null,
    type: SchemaTypes.Date,
  })
  updatedAt: string | Date;
}

export const SystemChatSchema = SchemaFactory.createForClass(SystemChat);
