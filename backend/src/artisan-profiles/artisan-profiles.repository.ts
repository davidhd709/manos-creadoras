import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const USER_SELECT = {
  id: true, name: true, email: true, isActive: true,
  verificationStatus: true, craft: true, region: true,
  whatsapp: true, instagram: true,
};

@Injectable()
export class ArtisanProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.artisanProfile.findUnique({
      where: { userId },
      include: { user: { select: USER_SELECT } },
    });
  }

  async upsert(userId: string, data: Record<string, any>) {
    const { businessName, ...rest } = data;
    return this.prisma.artisanProfile.upsert({
      where: { userId },
      update: rest,
      create: { userId, businessName: businessName ?? '', ...rest } as any,
      include: { user: { select: USER_SELECT } },
    });
  }

  async findAll() {
    return this.prisma.artisanProfile.findMany({
      include: { user: { select: USER_SELECT } },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.artisanProfile.findUnique({
      where: { slug },
      include: { user: { select: USER_SELECT } },
    });
  }

  async findPublic(filter: { craft?: string; region?: string; limit?: number } = {}) {
    return this.prisma.artisanProfile.findMany({
      where: {
        onboardingCompleted: true,
        ...(filter.craft ? { craft: filter.craft } : {}),
        ...(filter.region ? { region: filter.region } : {}),
        user: { isActive: true, verificationStatus: 'approved' },
      },
      include: { user: { select: { id: true, name: true, craft: true, region: true } } },
      orderBy: { updatedAt: 'desc' },
      take: filter.limit ?? 24,
    });
  }

  async featured(limit = 3) {
    return this.prisma.artisanProfile.findMany({
      where: {
        onboardingCompleted: true,
        story: { not: null },
        user: { isActive: true, verificationStatus: 'approved' },
      },
      include: { user: { select: { id: true, name: true, craft: true, region: true } } },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }
}
