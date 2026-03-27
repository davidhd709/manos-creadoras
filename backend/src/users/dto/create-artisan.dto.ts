import { IsEmail, IsEnum, IsString, IsOptional, MinLength } from 'class-validator';

export class CreateArtisanDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(['CC', 'CE', 'NIT', 'PAS'])
  documentType: string;

  @IsString()
  documentNumber: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  provisionalPassword?: string;
}
