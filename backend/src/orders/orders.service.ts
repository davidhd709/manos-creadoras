import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { ProductsRepository } from '../products/products.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './schemas/order.schema';
import { Role } from '../common/roles.enum';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async create(dto: CreateOrderDto, user: any) {
    // Validar stock disponible
    for (const item of dto.items) {
      const product = await this.productsRepository.findById(item.product);
      if (!product) {
        throw new BadRequestException(`Producto ${item.product} no encontrado`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.title}". Disponible: ${product.stock}, solicitado: ${item.quantity}`,
        );
      }
    }

    // Descontar inventario automáticamente
    for (const item of dto.items) {
      await this.productsRepository.decrementStock(item.product, item.quantity);
    }

    return this.ordersRepository.create({
      ...dto,
      buyer: user.userId,
      status: OrderStatus.Pending,
    } as any);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, user: any) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');

    // Validar transiciones de estado permitidas
    const transitions: Record<string, string[]> = {
      [OrderStatus.Pending]: [OrderStatus.InProcess, OrderStatus.Cancelled],
      [OrderStatus.InProcess]: [OrderStatus.Shipped, OrderStatus.Cancelled],
      [OrderStatus.Shipped]: [OrderStatus.Delivered],
      [OrderStatus.Delivered]: [],
      [OrderStatus.Cancelled]: [],
    };

    const allowed = transitions[order.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `No se puede cambiar de "${order.status}" a "${dto.status}". Transiciones permitidas: ${allowed.join(', ') || 'ninguna'}`,
      );
    }

    // Si se cancela, restaurar el stock
    if (dto.status === OrderStatus.Cancelled) {
      for (const item of order.items) {
        await this.productsRepository.updateStock(item.product.toString(), item.quantity);
      }
    }

    return this.ordersRepository.updateStatus(id, dto.status);
  }

  async findById(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  myOrders(user: any) {
    return this.ordersRepository.findByBuyer(user.userId);
  }

  async artisanOrders(user: any) {
    const orders = await this.ordersRepository.findAll();
    return orders.filter((o) =>
      o.items.some((i: any) => (i.product as any)?.artisan?.toString() === user.userId),
    );
  }

  all() {
    return this.ordersRepository.findAll();
  }

  findByStatus(status: string) {
    return this.ordersRepository.findByStatus(status);
  }

  getRecentOrders(limit = 10) {
    return this.ordersRepository.getRecentOrders(limit);
  }
}
