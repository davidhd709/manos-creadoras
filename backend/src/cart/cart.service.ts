import { Injectable } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';
import { SyncCartDto } from './dto/sync-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly repo: CartRepository) {}

  getCart(userId: string) {
    return this.repo.getCart(userId);
  }

  upsertItem(userId: string, dto: UpsertCartItemDto) {
    return this.repo.upsertItem(userId, dto.productId, dto.quantity);
  }

  removeItem(userId: string, productId: string) {
    return this.repo.removeItem(userId, productId);
  }

  clearCart(userId: string) {
    return this.repo.clearCart(userId);
  }

  syncItems(userId: string, dto: SyncCartDto) {
    return this.repo.syncItems(userId, dto.items);
  }
}
