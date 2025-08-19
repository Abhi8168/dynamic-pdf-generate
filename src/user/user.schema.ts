import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsString } from 'class-validator';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  @IsString()
  name: string;

  @Prop({
    unique: true,
    required: true,
    trim: true,
  })
  @IsEmail()
  email: string;

  @Prop({
    required: false,
    select: false,
    default: '',
    trim: true,
  })
  password: string;

  @Prop({
    default: false,
    type: Boolean,
    required: false,
  })
  isDeleted: boolean;

  @Prop({
    required: false,
    select: false,
    trim: true,
    type: String,
    default: '',
  })
  token: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
