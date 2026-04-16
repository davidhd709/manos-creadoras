import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/roles.enum';

export enum DocumentType {
  CC = 'CC',
  CE = 'CE',
  NIT = 'NIT',
  PAS = 'PAS',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // hashed

  @Prop({ required: true, enum: Role })
  role: Role;

  @Prop({ enum: DocumentType })
  documentType?: string;

  @Prop({ sparse: true })
  documentNumber?: string;

  @Prop({ default: false })
  mustChangePassword: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ select: false })
  passwordResetToken?: string;

  @Prop({ select: false })
  passwordResetExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
