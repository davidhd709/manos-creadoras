import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      omit: { password: true, passwordResetToken: true, passwordResetExpires: true },
    });
  }

  async findByIdWithPassword(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByDocumentNumber(documentNumber: string) {
    return this.prisma.user.findFirst({ where: { documentNumber } });
  }

  async findByResetToken(hashedToken: string) {
    return this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      omit: { password: true, passwordResetToken: true, passwordResetExpires: true },
    });
  }

  async findByRole(role: string) {
    return this.prisma.user.findMany({
      where: { role: role as any },
      omit: { password: true, passwordResetToken: true, passwordResetExpires: true },
    });
  }

  async findPendingArtisans() {
    return this.prisma.user.findMany({
      where: { role: 'artisan', verificationStatus: 'pending' },
      omit: { password: true, passwordResetToken: true, passwordResetExpires: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      omit: { password: true, passwordResetToken: true, passwordResetExpires: true },
    });
  }

  async deleteByRole(role: string) {
    await this.prisma.user.deleteMany({ where: { role: role as any } });
  }

  async count() {
    return this.prisma.user.count();
  }

  async countByRole(role: string) {
    return this.prisma.user.count({ where: { role: role as any } });
  }
}
