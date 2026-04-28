import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { UsersRepository } from './users.repository';
import { MailService } from '../mail/mail.service';
import { User, VerificationStatus } from './schemas/user.schema';
import { CreateArtisanDto } from './dto/create-artisan.dto';
import { Role } from '../common/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findByResetToken(hashedToken: string) {
    return this.usersRepository.findByResetToken(hashedToken);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  findByIdWithPassword(id: string) {
    return this.usersRepository.findByIdWithPassword(id);
  }

  create(data: Partial<User>) {
    return this.usersRepository.create(data);
  }

  findAll() {
    return this.usersRepository.findAll();
  }

  findByRole(role: string) {
    return this.usersRepository.findByRole(role);
  }

  update(id: string, data: Partial<User>) {
    return this.usersRepository.update(id, data);
  }

  count() {
    return this.usersRepository.count();
  }

  countByRole(role: string) {
    return this.usersRepository.countByRole(role);
  }

  findPendingArtisans() {
    return this.usersRepository.findPendingArtisans();
  }

  async approveArtisan(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.role !== Role.Artisan) throw new BadRequestException('El usuario no es artesano');
    if (user.verificationStatus === VerificationStatus.Approved && user.isActive) {
      return user;
    }
    const updated = await this.usersRepository.update(id, {
      verificationStatus: VerificationStatus.Approved,
      isActive: true,
    } as any);
    if (updated) {
      await this.mailService.sendArtisanApproved(updated.email, updated.name).catch(() => {});
    }
    return updated;
  }

  async rejectArtisan(id: string, reason?: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.role !== Role.Artisan) throw new BadRequestException('El usuario no es artesano');
    const updated = await this.usersRepository.update(id, {
      verificationStatus: VerificationStatus.Rejected,
      isActive: false,
    } as any);
    if (updated) {
      await this.mailService.sendArtisanRejected(updated.email, updated.name, reason).catch(() => {});
    }
    return updated;
  }

  async createArtisan(dto: CreateArtisanDto) {
    const existsByEmail = await this.usersRepository.findByEmail(dto.email);
    if (existsByEmail) throw new ConflictException('El correo ya esta registrado');

    if (dto.documentNumber) {
      const existsByDoc = await this.usersRepository.findByDocumentNumber(dto.documentNumber);
      if (existsByDoc) throw new ConflictException('El numero de documento ya esta registrado');
    }

    const rawPassword = dto.provisionalPassword || crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: Role.Artisan,
      documentType: dto.documentType,
      documentNumber: dto.documentNumber,
      mustChangePassword: true,
      isActive: true,
      verificationStatus: VerificationStatus.Approved,
    } as any);

    // Enviar email con credenciales (no bloquea si falla)
    await this.mailService.sendArtisanWelcome(dto.email, dto.name, rawPassword);

    const { password, ...result } = user.toObject();
    return result;
  }
}
