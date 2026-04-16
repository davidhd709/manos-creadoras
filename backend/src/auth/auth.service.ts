import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Role } from '../common/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    // Solo compradores pueden auto-registrarse
    if (dto.role && dto.role !== Role.Buyer) {
      throw new ForbiddenException('Solo puedes registrarte como comprador. Las cuentas de artesano son creadas por el administrador.');
    }

    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new ConflictException('El correo ya esta registrado');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ ...dto, role: Role.Buyer, password: hashed });
    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales invalidas');
    if (!user.isActive) throw new UnauthorizedException('Tu cuenta ha sido desactivada');
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales invalidas');

    const tokenData = this.signToken(user);
    return {
      ...tokenData,
      mustChangePassword: user.mustChangePassword || false,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findByIdWithPassword(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('La contrasena actual es incorrecta');

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('La nueva contrasena debe ser diferente a la actual');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.update(userId, {
      password: hashed,
      mustChangePassword: false,
    } as any);

    return { message: 'Contrasena actualizada exitosamente' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    // Respuesta generica para evitar enumeracion de usuarios
    const genericResponse = { message: 'Si el correo existe, recibiras instrucciones para restablecer tu contrasena' };

    if (!user || !user.isActive) return genericResponse;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.usersService.update(user._id.toString(), {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    } as any);

    await this.mailService.sendPasswordReset(user.email, user.name, rawToken);

    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashedToken = crypto.createHash('sha256').update(dto.token).digest('hex');
    const user = await this.usersService.findByResetToken(hashedToken);

    if (!user) {
      throw new BadRequestException('Token invalido o expirado');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.update(user._id.toString(), {
      password: hashed,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      mustChangePassword: false,
    } as any);

    return { message: 'Contrasena restablecida exitosamente' };
  }

  private signToken(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    const { password, ...safeUser } = user.toObject ? user.toObject() : user;
    return { access_token: this.jwtService.sign(payload), user: safeUser };
  }
}
