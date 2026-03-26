import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/roles.enum';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}
