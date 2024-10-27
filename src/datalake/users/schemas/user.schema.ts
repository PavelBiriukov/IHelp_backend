/* eslint-disable no-use-before-define */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, SchemaTypes } from 'mongoose';
import { GenericUserModelInterface } from '../../../common/types/user.types';

@Schema({
  timestamps: true,
  discriminatorKey: 'role',
  toObject: {
    versionKey: false,
    virtuals: false,
    flattenObjectIds: true,
  },
  id: false,
})
export class User extends Document implements GenericUserModelInterface {
  @Prop({ required: true, type: mongoose.SchemaTypes.String })
  address: string;

  @Prop({ default: '', type: mongoose.SchemaTypes.String })
  avatar: string;

  @Prop({ required: true, type: mongoose.SchemaTypes.String })
  name: string;

  @Prop({ required: true, type: mongoose.SchemaTypes.String })
  phone: string;

  @Prop({ required: true, unique: true, type: SchemaTypes.String })
  vkId: string;

  @Prop({
    type: SchemaTypes.String,
    required: true,
    enum: ['GeneralUser', 'Admin', 'Recipient', 'Volunteer'],
  })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass<GenericUserModelInterface>(User);
