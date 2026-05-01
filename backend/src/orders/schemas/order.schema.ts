import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum OrderStatus {
  AwaitingPayment = 'awaiting_payment',
  Pending = 'pendiente',
  InProcess = 'en_proceso',
  Shipped = 'enviado',
  Delivered = 'entregado',
  Cancelled = 'cancelado',
}

export enum PaymentMethod {
  Whatsapp = 'whatsapp',
  Transfer = 'transfer',
  CashOnDelivery = 'cod',
}

export enum PaymentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Failed = 'failed',
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

  @Prop({ default: OrderStatus.AwaitingPayment, enum: OrderStatus, index: true })
  status: OrderStatus;

  @Prop({ enum: PaymentMethod, required: true, default: PaymentMethod.Whatsapp })
  paymentMethod: PaymentMethod;

  @Prop({ enum: PaymentStatus, required: true, default: PaymentStatus.Pending, index: true })
  paymentStatus: PaymentStatus;

  @Prop({
    type: {
      name: String,
      phone: String,
      address: String,
      city: String,
      department: String,
      postalCode: String,
      notes: String,
    },
  })
  shippingAddress?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    department?: string;
    postalCode?: string;
    notes?: string;
  };

  @Prop()
  customerNotes?: string;

  @Prop()
  notes: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'items.product': 1 });
OrderSchema.index({ paymentMethod: 1, status: 1 });
