import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { ProductsRepository } from '../products/products.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { ClientsRepository } from '../clients/clients.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Role } from '../common/roles.enum';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly clientsRepository: ClientsRepository,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateOrderDto, user: any) {
    const clientProfile = await this.clientsRepository.findByUserId(user.userId);
    if (!clientProfile || !clientProfile.address || !clientProfile.city) {
      throw new BadRequestException(
        'Debes completar tu perfil con dirección de envío antes de realizar un pedido',
      );
    }
    if (!clientProfile.phone || clientProfile.phone.trim().length < 7) {
      throw new BadRequestException(
        'Debes registrar un teléfono válido para que el artesano pueda coordinar tu pedido',
      );
    }
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Tu carrito está vacío');
    }

    const verifiedItems: { productId: string; quantity: number; unitPrice: number; totalItem: number }[] = [];
    const productSnapshots: any[] = [];

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

      const realPrice = product.isPromotion && product.promotionPrice != null
        ? product.promotionPrice
        : product.price;

      verifiedItems.push({
        productId: item.product,
        quantity: item.quantity,
        unitPrice: realPrice,
        totalItem: realPrice * item.quantity,
      });
      productSnapshots.push(product);
    }

    const totalOrder = verifiedItems.reduce((sum, i) => sum + i.totalItem, 0);

    const shouldReserveStock = dto.paymentMethod !== 'cod';
    if (shouldReserveStock) {
      for (const item of verifiedItems) {
        const product = await this.productsRepository.atomicDecrementStock(item.productId, item.quantity);
        if (!product) {
          throw new BadRequestException(
            `No se pudo reservar stock para el producto. Otro pedido pudo haberlo tomado.`,
          );
        }
        await this.inventoryRepository.create({
          productId: item.productId,
          type: 'salida',
          quantity: item.quantity,
          previousStock: product.stock + item.quantity,
          newStock: product.stock,
          reason: `Reserva - Pedido de ${user.email || user.userId}`,
          performedById: user.userId,
        });
      }
    }

    const order = await this.ordersRepository.create({
      buyerId: user.userId,
      totalOrder,
      status: 'awaiting_payment',
      paymentMethod: dto.paymentMethod as any,
      paymentStatus: 'pending',
      customerNotes: dto.customerNotes,
      shippingName: (clientProfile as any).user?.name ?? user.name,
      shippingPhone: clientProfile.phone,
      shippingAddress: clientProfile.address,
      shippingCity: clientProfile.city,
      shippingDept: clientProfile.department,
      shippingPostal: clientProfile.postalCode,
      shippingNotes: dto.customerNotes ?? null,
      items: {
        create: verifiedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalItem: item.totalItem,
        })),
      },
    } as any);

    const buyerEmail = (clientProfile as any).user?.email ?? user.email;
    const buyerName = (clientProfile as any).user?.name ?? user.name ?? 'comprador';
    this.mailService.sendOrderCreatedBuyer(buyerEmail, buyerName, order, productSnapshots).catch(() => {});
    this.mailService.notifyArtisansNewOrder(productSnapshots, order).catch(() => {});

    return order;
  }

  async confirmPayment(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.paymentStatus === 'confirmed') return order;

    return this.ordersRepository.updatePaymentAndStatus(id, 'confirmed', 'pendiente');
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, user: any) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');

    const transitions: Record<string, string[]> = {
      awaiting_payment: ['pendiente', 'cancelado'],
      pendiente: ['en_proceso', 'cancelado'],
      en_proceso: ['enviado', 'cancelado'],
      enviado: ['entregado'],
      entregado: [],
      cancelado: [],
    };

    const allowed = transitions[order.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `No se puede cambiar de "${order.status}" a "${dto.status}". Transiciones permitidas: ${allowed.join(', ') || 'ninguna'}`,
      );
    }

    if (dto.status === 'cancelado') {
      const wasReserved = order.paymentMethod !== 'cod' || order.status === 'enviado';
      if (wasReserved) {
        for (const item of order.items as any[]) {
          const productId = item.productId;
          const updatedProduct = await this.productsRepository.updateStock(productId, item.quantity);
          await this.inventoryRepository.create({
            productId,
            type: 'entrada',
            quantity: item.quantity,
            previousStock: (updatedProduct?.stock || 0) - item.quantity,
            newStock: updatedProduct?.stock || 0,
            reason: `Cancelación de pedido #${id}`,
            performedById: user.userId,
          });
        }
      }
    }

    if (dto.status === 'enviado' && order.paymentMethod === 'cod') {
      for (const item of order.items as any[]) {
        const product = await this.productsRepository.atomicDecrementStock(item.productId, item.quantity);
        if (!product) {
          throw new BadRequestException(`No se pudo descontar stock al despachar (producto agotado).`);
        }
        await this.inventoryRepository.create({
          productId: item.productId,
          type: 'salida',
          quantity: item.quantity,
          previousStock: product.stock + item.quantity,
          newStock: product.stock,
          reason: `Despacho COD - Pedido #${id}`,
          performedById: user.userId,
        });
      }
    }

    if (dto.status === 'entregado') {
      await this.clientsRepository.incrementPurchaseStats(order.buyerId, order.totalOrder);
    }

    return this.ordersRepository.updateStatus(id, dto.status);
  }

  async findById(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  async findByIdWithAuth(id: string, user: any) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');

    if (user.role === Role.Admin || user.role === Role.SuperAdmin) return order;

    if (user.role === Role.Buyer && order.buyerId !== user.userId) {
      throw new ForbiddenException('No tienes permiso para ver esta orden');
    }

    if (user.role === Role.Artisan) {
      const hasArtisanProduct = (order.items as any[]).some((item) =>
        item.product?.artisan?.id === user.userId || item.product?.artisanId === user.userId,
      );
      if (!hasArtisanProduct) {
        throw new ForbiddenException('No tienes permiso para ver esta orden');
      }
    }

    return order;
  }

  myOrders(user: any) {
    return this.ordersRepository.findByBuyer(user.userId);
  }

  artisanOrders(user: any) {
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
