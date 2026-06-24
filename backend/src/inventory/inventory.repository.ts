import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.InventoryMovementUncheckedCreateInput) {
    return this.prisma.inventoryMovement.create({ data });
  }

  async findByProduct(productId: string) {
    return this.prisma.inventoryMovement.findMany({
      where: { productId },
      include: { performedBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRecent(limit = 20) {
    return this.prisma.inventoryMovement.findMany({
      include: {
        product: { select: { id: true, title: true, stock: true } },
        performedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
