import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  Pending = 'pendiente',
  InProcess = 'en_proceso',
  Shipped = 'enviado',
  Delivered = 'entregado',
  Cancelled = 'cancelado',
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  buyer: Types.ObjectId;

  @Prop({
    type: [
      {
        product: { type: Types.ObjectId, ref: 'Product' },
        quantity: Number,
        unitPrice: Number,
        totalItem: Number,
      },
    ],
  })
  items: { product: Types.ObjectId; quantity: number; unitPrice: number; totalItem: number }[];

  @Prop({ required: true })
  totalOrder: number;

  @Prop({ default: OrderStatus.Pending, enum: OrderStatus, index: true })
  status: OrderStatus;

  @Prop()
  notes: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
