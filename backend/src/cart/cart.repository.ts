import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const PRODUCT_SELECT = {
  id: true,
  title: true,
  price: true,
  promotionPrice: true,
  isPromotion: true,
  stock: true,
  images: true,
  category: true,
};

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { select: PRODUCT_SELECT } },
          orderBy: { id: 'asc' },
        },
      },
    });
    return cart ?? { items: [] };
  }

  async upsertItem(userId: string, productId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);

    if (quantity <= 0) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId },
      });
    } else {
      await this.prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId } },
        create: { cartId: cart.id, productId, quantity },
        update: { quantity },
      });
    }

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) return { items: [] };

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { items: [] };
  }

  async syncItems(userId: string, items: { productId: string; quantity: number }[]) {
    const cart = await this.getOrCreateCart(userId);

    await this.prisma.$transaction(
      items
        .filter((i) => i.quantity > 0)
        .map((i) =>
          this.prisma.cartItem.upsert({
            where: { cartId_productId: { cartId: cart.id, productId: i.productId } },
            create: { cartId: cart.id, productId: i.productId, quantity: i.quantity },
            update: { quantity: { set: Math.max(i.quantity, 1) } },
          }),
        ),
    );

    return this.getCart(userId);
  }
}
