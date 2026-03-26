import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Banner extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop()
  description: string;

  @Prop()
  link: string;

  @Prop({ default: true })
  active: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
