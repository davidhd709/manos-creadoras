import { IsEmail, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterArtisanDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_.])[A-Za-z\d@$!%*?&#+\-_.]{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial',
  })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  craft: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  region: string;

  @IsString()
  @MinLength(7)
  @MaxLength(20)
  whatsapp: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  instagram?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  applicationNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  referralCode?: string;
}
