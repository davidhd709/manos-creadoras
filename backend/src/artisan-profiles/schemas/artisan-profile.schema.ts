import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ArtisanProfile extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  businessName: string;

  @Prop()
  logo: string;

  @Prop()
  description: string;

  @Prop()
  phone: string;

  @Prop()
  city: string;

  @Prop()
  department: string;

  @Prop()
  website: string;

  @Prop({ type: Object, default: {} })
  socialMedia: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };

  @Prop()
  nit: string;

  @Prop()
  bankAccount: string;

  @Prop()
  bankName: string;

  // Perfil público enriquecido
  @Prop()
  story: string;

  @Prop()
  craft: string;

  @Prop()
  region: string;

  @Prop()
  coverImage: string;

  @Prop({ unique: true, sparse: true, index: true })
  slug: string;

  @Prop({ default: false })
  onboardingCompleted: boolean;
}

export const ArtisanProfileSchema = SchemaFactory.createForClass(ArtisanProfile);
