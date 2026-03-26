import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Client extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  department: string;

  @Prop()
  postalCode: string;

  @Prop({ default: 0 })
  totalPurchases: number;

  @Prop({ default: 0 })
  totalSpent: number;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
