import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { type ObjectId, Document, SchemaTypes } from 'mongoose';
// eslint-disable-next-line import/no-cycle
import { ConflictChatWithRecipientModelInterface } from '../../../common/types/chats.types';
import { AdminInterface, RecipientInterface } from '../../../common/types/user.types';
import { rawUserProfile } from '../../../common/constants/mongoose-fields-raw-definition';
import { MongooseIdAndTimestampsInterface } from '../../../common/types/system.types';
import { Chat } from './chat.schema';

@Schema({
  timestamps: true,
  toObject: {
    versionKey: false,
    virtuals: true,
    flattenObjectIds: true,
  },
})
export class ConflictChatWithRecipient
  extends Document<
    ObjectId,
    Record<string, never>,
    ConflictChatWithRecipientModelInterface & MongooseIdAndTimestampsInterface
  >
  implements ConflictChatWithRecipientModelInterface
{
  @Prop({
    required: true,
    type: raw(rawUserProfile),
    immutable: true,
  })
  recipient: RecipientInterface;

  @Prop({
    required: false,
    default: null,
    type: SchemaTypes.Date,
  })
  recipientLastReadAt: Date | null;

  @Prop({
    required: true,
    type: SchemaTypes.ObjectId,
  })
  taskId: ObjectId;

  @Prop({
    required: false,
    default: null,
    type: SchemaTypes.ObjectId,
  })
  opponentChat: ObjectId | null;

  @Prop({
    required: false,
    default: null,
    type: raw(rawUserProfile),
  })
  admin: AdminInterface | null;

  @Prop({
    required: false,
    default: null,
    type: SchemaTypes.Date,
  })
  adminLastReadAt: Date | null;
}

export const ConflictChatWithRecipientSchema =
  SchemaFactory.createForClass(ConflictChatWithRecipient);

export type ConflictChatWithRecipientDoc = ConflictChatWithRecipient & Chat;
