import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { ProductsRepository } from '../products/products.repository';
import { UpdateStockDto } from './dto/update-stock.dto';
import { MovementType } from './schemas/inventory.schema';

@Injectable()
export class InventoryService {
  constructor(
    private readonly inventoryRepository: InventoryRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async updateStock(productId: string, dto: UpdateStockDto, user: any) {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundException('Producto no encontrado');

    const previousStock = product.stock;
    let newStock: number;

    switch (dto.type) {
      case MovementType.Entry:
        newStock = previousStock + dto.quantity;
        break;
      case MovementType.Exit:
        if (previousStock < dto.quantity) {
          throw new BadRequestException(
            `Stock insuficiente. Disponible: ${previousStock}, solicitado: ${dto.quantity}`,
          );
        }
        newStock = previousStock - dto.quantity;
        break;
      case MovementType.Adjustment:
        newStock = dto.quantity;
        break;
    }

    await this.productsRepository.update(productId, { stock: newStock });

    return this.inventoryRepository.create({
      product: productId as any,
      type: dto.type,
      quantity: dto.quantity,
      previousStock,
      newStock,
      reason: dto.reason,
      performedBy: user.userId,
    });
  }

  getMovements(productId: string) {
    return this.inventoryRepository.findByProduct(productId);
  }

  getRecentMovements(limit = 20) {
    return this.inventoryRepository.findRecent(limit);
  }

  async getLowStockProducts(threshold = 5) {
    return this.productsRepository.findLowStock(threshold);
  }

  async getOutOfStockProducts() {
    return this.productsRepository.findOutOfStock();
  }

  async getStockAlerts() {
    const [lowStock, outOfStock] = await Promise.all([
      this.productsRepository.findLowStock(5),
      this.productsRepository.findOutOfStock(),
    ]);

    return {
      lowStock: { count: lowStock.length, products: lowStock },
      outOfStock: { count: outOfStock.length, products: outOfStock },
      totalAlerts: lowStock.length + outOfStock.length,
    };
  }
}
