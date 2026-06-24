import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const USER_SELECT = { id: true, name: true, email: true };

@Injectable()
export class ClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ClientProfileCreateInput) {
    return this.prisma.clientProfile.create({ data, include: { user: { select: USER_SELECT } } });
  }

  async findByUserId(userId: string) {
    return this.prisma.clientProfile.findUnique({
      where: { userId },
      include: { user: { select: USER_SELECT } },
    });
  }

  async findAll() {
    return this.prisma.clientProfile.findMany({
      include: { user: { select: USER_SELECT } },
      orderBy: { totalSpent: 'desc' },
    });
  }

  async update(userId: string, data: Prisma.ClientProfileUpdateInput) {
    return this.prisma.clientProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data } as any,
      include: { user: { select: USER_SELECT } },
    });
  }

  async incrementPurchases(userId: string, amount: number) {
    await this.prisma.clientProfile.upsert({
      where: { userId },
      update: { totalPurchases: { increment: 1 }, totalSpent: { increment: amount } },
      create: { userId, totalPurchases: 1, totalSpent: amount },
    });
  }

  async incrementPurchaseStats(userId: string, totalSpent: number) {
    await this.incrementPurchases(userId, totalSpent);
  }

  async count() {
    return this.prisma.clientProfile.count();
  }

  async getTopClients(limit = 10) {
    return this.prisma.clientProfile.findMany({
      include: { user: { select: USER_SELECT } },
      orderBy: { totalSpent: 'desc' },
      take: limit,
    });
  }
}
