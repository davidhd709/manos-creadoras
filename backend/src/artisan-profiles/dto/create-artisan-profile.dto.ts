import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateArtisanProfileDto {
  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsObject()
  socialMedia?: { facebook?: string; instagram?: string; whatsapp?: string };

  @IsOptional()
  @IsString()
  nit?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  bankName?: string;
}
