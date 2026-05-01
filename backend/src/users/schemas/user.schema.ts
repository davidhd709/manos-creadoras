import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../common/roles.enum';

export enum DocumentType {
  CC = 'CC',
  CE = 'CE',
  NIT = 'NIT',
  PAS = 'PAS',
}

export enum VerificationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
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

  // Solo aplica a artesanos auto-registrados
  @Prop({ enum: VerificationStatus })
  verificationStatus?: VerificationStatus;

  @Prop()
  whatsapp?: string;

  @Prop()
  instagram?: string;

  @Prop()
  craft?: string;

  @Prop()
  region?: string;

  @Prop()
  applicationNotes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  referredBy?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ role: 1, verificationStatus: 1 });
