import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaTypes } from 'mongoose';
// eslint-disable-next-line import/no-cycle
import { ChatModelInterface } from '../../../common/types/chats.types';
import { ChatType, ChatTypes } from '../../../common/types/system.types';

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
    auto: true,
    type: SchemaTypes.ObjectId,
  })
  _id: ObjectId;

  @Prop({
    required: true,
    type: SchemaTypes.String,
    enum: Object.values(ChatType),
  })
  type: ChatTypes;

  @Prop({
    required: false,
    auto: true,
    type: SchemaTypes.Date,
  })
  createdAt: Date;

  @Prop({
    required: true,
    auto: true,
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
