import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MovementType {
  Entry = 'entrada',
  Exit = 'salida',
  Adjustment = 'ajuste',
}

@Schema({ timestamps: true })
export class InventoryMovement extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  product: Types.ObjectId;

  @Prop({ required: true, enum: MovementType })
  type: MovementType;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  previousStock: number;

  @Prop({ required: true })
  newStock: number;

  @Prop()
  reason: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  performedBy: Types.ObjectId;
}

export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);
