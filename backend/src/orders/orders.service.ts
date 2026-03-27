import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { ProductsRepository } from '../products/products.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { ClientsRepository } from '../clients/clients.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from './schemas/order.schema';
import { MovementType } from '../inventory/schemas/inventory.schema';
import { Role } from '../common/roles.enum';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly clientsRepository: ClientsRepository,
  ) {}

  async create(dto: CreateOrderDto, user: any) {
    // Verificar que el comprador tenga dirección de envío
    const clientProfile = await this.clientsRepository.findByUserId(user.userId);
    if (!clientProfile || !clientProfile.address || !clientProfile.city) {
      throw new BadRequestException(
        'Debes completar tu perfil con dirección de envío antes de realizar un pedido',
      );
    }

    // Validar stock y recalcular precios desde la BD (nunca confiar en el cliente)
    const verifiedItems: { product: string; quantity: number; unitPrice: number; totalItem: number }[] = [];

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

      // Precio real desde la BD — ignora lo que envió el cliente
      const realPrice = product.isPromotion && product.promotionPrice != null
        ? product.promotionPrice
        : product.price;

      verifiedItems.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: realPrice,
        totalItem: realPrice * item.quantity,
      });
    }

    const totalOrder = verifiedItems.reduce((sum, i) => sum + i.totalItem, 0);

    // Descontar stock con operación atómica y registrar movimiento de inventario
    for (const item of verifiedItems) {
      const product = await this.productsRepository.atomicDecrementStock(item.product, item.quantity);
      if (!product) {
        throw new BadRequestException(
          `No se pudo reservar stock para el producto. Otro pedido pudo haberlo tomado.`,
        );
      }

      // Registrar movimiento de inventario
      await this.inventoryRepository.create({
        product: item.product as any,
        type: MovementType.Exit,
        quantity: item.quantity,
        previousStock: product.stock + item.quantity,
        newStock: product.stock,
        reason: `Venta - Pedido de ${user.email || user.userId}`,
        performedBy: user.userId,
      });
    }

    return this.ordersRepository.create({
      items: verifiedItems,
      totalOrder,
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

    // Si se cancela, restaurar el stock y registrar movimiento
    if (dto.status === OrderStatus.Cancelled) {
      for (const item of order.items) {
        const productId = item.product.toString();
        const updatedProduct = await this.productsRepository.updateStock(productId, item.quantity);

        await this.inventoryRepository.create({
          product: productId as any,
          type: MovementType.Entry,
          quantity: item.quantity,
          previousStock: (updatedProduct?.stock || 0) - item.quantity,
          newStock: updatedProduct?.stock || 0,
          reason: `Cancelación de pedido #${id}`,
          performedBy: user.userId,
        });
      }
    }

    // Si se entrega, actualizar perfil del cliente
    if (dto.status === OrderStatus.Delivered) {
      await this.clientsRepository.incrementPurchaseStats(
        order.buyer.toString(),
        order.totalOrder,
      );
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
    return this.ordersRepository.findByArtisan(user.userId);
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
