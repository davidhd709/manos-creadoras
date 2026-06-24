import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const ARTISAN_SELECT = { id: true, name: true, email: true };

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: { artisan: { select: ARTISAN_SELECT } },
    });
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { artisan: { select: ARTISAN_SELECT } },
    });
  }

  async findPaginated(
    filter: Prisma.ProductWhereInput,
    page: number,
    limit: number,
    orderBy: Prisma.ProductOrderByWithRelationInput = { soldCount: 'desc' },
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: filter,
        include: { artisan: { select: { id: true, name: true } } },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where: filter }),
    ]);
    return { data, total };
  }

  async findTop(limit = 10) {
    return this.prisma.product.findMany({
      orderBy: { soldCount: 'desc' },
      take: limit,
      include: { artisan: { select: ARTISAN_SELECT } },
    });
  }

  async findByArtisan(artisanId: string) {
    return this.prisma.product.findMany({ where: { artisanId } });
  }

  async aggregateArtisanStats(artisanId: string) {
    const agg = await this.prisma.product.aggregate({
      where: { artisanId },
      _count: { id: true },
      _sum: { soldCount: true },
      _avg: { ratingAverage: true },
    });
    const ratedProducts = await this.prisma.product.count({
      where: { artisanId, ratingAverage: { gt: 0 } },
    });
    return {
      totalProducts: agg._count.id,
      totalSold: agg._sum.soldCount ?? 0,
      avgRating: agg._avg.ratingAverage ?? 0,
      ratedProducts,
    };
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.product.delete({ where: { id } });
  }

  async updateStock(id: string, quantity: number) {
    return this.prisma.product.update({
      where: { id },
      data: { stock: { increment: quantity }, soldCount: { decrement: quantity } },
    });
  }

  async decrementStock(id: string, quantity: number) {
    return this.prisma.product.update({
      where: { id },
      data: { stock: { decrement: quantity }, soldCount: { increment: quantity } },
    });
  }

  async atomicDecrementStock(id: string, quantity: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.findFirst({
          where: { id, stock: { gte: quantity } },
          select: { id: true },
        });
        if (!product) return null;
        return tx.product.update({
          where: { id },
          data: { stock: { decrement: quantity }, soldCount: { increment: quantity } },
        });
      });
    } catch {
      return null;
    }
  }

  async findLowStock(threshold = 5) {
    return this.prisma.product.findMany({
      where: { stock: { lte: threshold, gt: 0 } },
      include: { artisan: { select: { id: true, name: true } } },
    });
  }

  async findOutOfStock() {
    return this.prisma.product.findMany({
      where: { stock: 0 },
      include: { artisan: { select: { id: true, name: true } } },
    });
  }

  async count() {
    return this.prisma.product.count();
  }

  async countByArtisan(artisanId: string) {
    return this.prisma.product.count({ where: { artisanId } });
  }

  async createReview(data: Prisma.ReviewCreateInput) {
    return this.prisma.review.create({
      data,
      include: { buyer: { select: { id: true, name: true } } },
    });
  }

  async findReviewsByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: { buyer: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async hasUserReviewed(productId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { buyerId_productId: { buyerId: userId, productId } },
      select: { id: true },
    });
    return !!review;
  }

  async calculateAverageRating(productId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });
    return agg._avg.rating ?? 0;
  }

  async updateRating(productId: string, rating: number) {
    await this.prisma.product.update({
      where: { id: productId },
      data: { ratingAverage: rating },
    });
  }
}
