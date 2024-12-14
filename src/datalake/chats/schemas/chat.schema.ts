import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';
// eslint-disable-next-line import/no-cycle
import { ChatModelInterface } from '../../../common/types/chats.types';
import { ChatType } from '../../../common/types/system.types';

@Schema({
  timestamps: true,
  discriminatorKey: 'type',
  toObject: {
    versionKey: false,
    virtuals: true,
    flattenObjectIds: true,
  },
})
export class Chat extends Document implements ChatModelInterface {
  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
  })
  _id: ObjectId;

  @Prop({
    required: true,
    type: SchemaTypes.String,
    enum: Object.values(ChatType),
  })
  type: ChatType;

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

  @Prop({
    required: true,
    type: SchemaTypes.Boolean,
  })
  isActive: boolean;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
