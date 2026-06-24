import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const ORDER_INCLUDE = {
  buyer: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      product: {
        include: { artisan: { select: { id: true, name: true } } },
      },
    },
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.OrderUncheckedCreateInput) {
    return this.prisma.order.create({ data: data as any, include: ORDER_INCLUDE });
  }

  async findById(id: string) {
    return this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  }

  async findByBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: ORDER_INCLUDE,
    });
  }

  async updatePaymentAndStatus(id: string, paymentStatus: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus: paymentStatus as any, status: status as any },
      include: ORDER_INCLUDE,
    });
  }

  async findByStatus(status: string) {
    return this.prisma.order.findMany({
      where: { status: status as any },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count() {
    return this.prisma.order.count();
  }

  async countByStatus(status: string) {
    return this.prisma.order.count({ where: { status: status as any } });
  }

  async calculateTotalRevenue() {
    const result = await this.prisma.order.aggregate({
      where: { status: { not: 'cancelado' as any } },
      _sum: { totalOrder: true },
    });
    return result._sum.totalOrder ?? 0;
  }

  async calculateRevenueByArtisan(artisanId: string) {
    const result = await this.prisma.$queryRaw<{ total: number }[]>`
      SELECT COALESCE(SUM(oi."totalItem"), 0)::float AS total
      FROM "Order" o
      JOIN "OrderItem" oi ON oi."orderId" = o.id
      JOIN "Product" p ON p.id = oi."productId"
      WHERE o.status != 'cancelado'
        AND p."artisanId" = ${artisanId}
    `;
    return result[0]?.total ?? 0;
  }

  async getRecentOrders(limit = 10) {
    return this.prisma.order.findMany({
      include: {
        buyer: { select: { id: true, name: true } },
        items: { include: { product: { select: { id: true, title: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByArtisan(artisanId: string) {
    return this.prisma.order.findMany({
      where: {
        items: { some: { product: { artisanId } } },
      },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveByProduct(productId: string) {
    return this.prisma.order.findMany({
      where: {
        items: { some: { productId } },
        status: { in: ['pendiente', 'en_proceso', 'enviado'] as any[] },
      },
    });
  }

  async hasBuyerPurchasedProduct(buyerId: string, productId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        buyerId,
        status: { in: ['entregado', 'enviado', 'en_proceso'] as any[] },
        items: { some: { productId } },
      },
      select: { id: true },
    });
    return !!order;
  }

  async getMonthlySales() {
    return this.prisma.$queryRaw<{ month: string; total: number; count: number }[]>`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM') AS month,
        SUM("totalOrder")::float        AS total,
        COUNT(*)::int                   AS count
      FROM "Order"
      WHERE status != 'cancelado'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;
  }

  async getMonthlySalesByArtisan(artisanId: string) {
    return this.prisma.$queryRaw<{ month: string; total: number; count: number }[]>`
      SELECT
        TO_CHAR(o."createdAt", 'YYYY-MM') AS month,
        SUM(oi."totalItem")::float         AS total,
        SUM(oi.quantity)::int              AS count
      FROM "Order" o
      JOIN "OrderItem" oi ON oi."orderId" = o.id
      JOIN "Product" p ON p.id = oi."productId"
      WHERE o.status != 'cancelado'
        AND p."artisanId" = ${artisanId}
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;
  }

  async getRevenueByProductForArtisan(artisanId: string) {
    return this.prisma.$queryRaw<{ productId: string; productTitle: string; totalRevenue: number; totalSold: number }[]>`
      SELECT
        p.id                       AS "productId",
        p.title                    AS "productTitle",
        SUM(oi."totalItem")::float AS "totalRevenue",
        SUM(oi.quantity)::int      AS "totalSold"
      FROM "OrderItem" oi
      JOIN "Product" p ON p.id = oi."productId"
      JOIN "Order" o ON o.id = oi."orderId"
      WHERE o.status != 'cancelado'
        AND p."artisanId" = ${artisanId}
      GROUP BY p.id, p.title
      ORDER BY "totalRevenue" DESC
      LIMIT 20
    `;
  }
}
