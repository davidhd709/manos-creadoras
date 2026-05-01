import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true, index: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, index: true })
  price: number;

  @Prop({ required: true, index: true })
  stock: number;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  artisan: Types.ObjectId;

  @Prop({ default: false, index: true })
  isPromotion: boolean;

  @Prop()
  promotionPrice?: number;

  @Prop({ default: 0, index: true })
  soldCount: number;

  @Prop({ default: 0, index: true })
  ratingAverage: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ category: 1, soldCount: -1 });
