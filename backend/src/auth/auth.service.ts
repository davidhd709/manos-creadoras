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
import { RegisterArtisanDto } from './dto/register-artisan.dto';
import { Role } from '../common/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.role && dto.role !== Role.Buyer) {
      throw new ForbiddenException('Solo puedes registrarte como comprador. Las cuentas de artesano son creadas por el administrador.');
    }

    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new ConflictException('El correo ya esta registrado');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({ ...dto, role: Role.Buyer, password: hashed } as any);
    return this.signToken(user);
  }

  async registerArtisan(dto: RegisterArtisanDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new ConflictException('El correo ya esta registrado');

    let referredById: string | undefined;
    if (dto.referralCode) {
      const referrer = await this.usersService.findById(dto.referralCode);
      if (referrer && referrer.role === Role.Artisan) {
        referredById = referrer.id;
      }
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: Role.Artisan,
      whatsapp: dto.whatsapp,
      instagram: dto.instagram,
      craft: dto.craft,
      region: dto.region,
      applicationNotes: dto.applicationNotes,
      verificationStatus: 'pending',
      isActive: false,
      mustChangePassword: false,
      referredById,
    } as any);

    await this.mailService.sendArtisanApplicationReceived(user.email, user.name).catch(() => {});
    await this.mailService.notifyAdminNewArtisanApplication(user).catch(() => {});

    return {
      message: 'Recibimos tu solicitud. Te avisaremos en menos de 24 horas cuando tu cuenta este aprobada.',
      status: 'pending',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales invalidas');
    if (!user.isActive) {
      if (user.verificationStatus === 'pending') {
        throw new UnauthorizedException('Tu solicitud de artesano esta en revision. Te avisaremos por correo cuando este aprobada.');
      }
      if (user.verificationStatus === 'rejected') {
        throw new UnauthorizedException('Tu solicitud de artesano fue rechazada. Escribenos para mas detalles.');
      }
      throw new UnauthorizedException('Tu cuenta ha sido desactivada');
    }
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
    const genericResponse = { message: 'Si el correo existe, recibiras instrucciones para restablecer tu contrasena' };

    if (!user || !user.isActive) return genericResponse;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await this.usersService.update(user.id, {
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
    await this.usersService.update(user.id, {
      password: hashed,
      passwordResetToken: null,
      passwordResetExpires: null,
      mustChangePassword: false,
    } as any);

    return { message: 'Contrasena restablecida exitosamente' };
  }

  private signToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const { password, passwordResetToken, passwordResetExpires, ...safeUser } = user;
    return { access_token: this.jwtService.sign(payload), user: safeUser };
  }
}
