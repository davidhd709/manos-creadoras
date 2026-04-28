import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { ProductsRepository } from '../products/products.repository';
import { OrdersRepository } from '../orders/orders.repository';
import { Role } from '../common/roles.enum';

const CACHE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class MetricsService {
  private cache: { data: any; expiresAt: number } | null = null;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  async getPublicMetrics() {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.data;
    }

    const [artisans, products, orders] = await Promise.all([
      this.usersRepository.countByRole(Role.Artisan),
      this.productsRepository.count(),
      this.ordersRepository.count(),
    ]);

    const data = {
      artisans,
      products,
      orders,
      hasMinimumScale: artisans >= 25 && products >= 50,
      generatedAt: new Date().toISOString(),
    };

    this.cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
    return data;
  }
}
