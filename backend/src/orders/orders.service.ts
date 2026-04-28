import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrdersRepository } from './orders.repository';
import { ProductsRepository } from '../products/products.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { ClientsRepository } from '../clients/clients.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, PaymentMethod, PaymentStatus } from './schemas/order.schema';
import { MovementType } from '../inventory/schemas/inventory.schema';
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

    const verifiedItems: { product: string; quantity: number; unitPrice: number; totalItem: number }[] = [];
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
        product: item.product,
        quantity: item.quantity,
        unitPrice: realPrice,
        totalItem: realPrice * item.quantity,
      });
      productSnapshots.push(product);
    }

    const totalOrder = verifiedItems.reduce((sum, i) => sum + i.totalItem, 0);

    // Reservar stock para WhatsApp y transferencia (paymentStatus pendiente).
    // Para contra entrega no descontamos hasta que el artesano marque enviado.
    const shouldReserveStock = dto.paymentMethod !== PaymentMethod.CashOnDelivery;
    if (shouldReserveStock) {
      for (const item of verifiedItems) {
        const product = await this.productsRepository.atomicDecrementStock(item.product, item.quantity);
        if (!product) {
          throw new BadRequestException(
            `No se pudo reservar stock para el producto. Otro pedido pudo haberlo tomado.`,
          );
        }
        await this.inventoryRepository.create({
          product: item.product as any,
          type: MovementType.Exit,
          quantity: item.quantity,
          previousStock: product.stock + item.quantity,
          newStock: product.stock,
          reason: `Reserva - Pedido de ${user.email || user.userId}`,
          performedBy: user.userId,
        });
      }
    }

    const order = await this.ordersRepository.create({
      items: verifiedItems,
      totalOrder,
      buyer: user.userId,
      status: OrderStatus.AwaitingPayment,
      paymentMethod: dto.paymentMethod,
      paymentStatus: PaymentStatus.Pending,
      customerNotes: dto.customerNotes,
      shippingAddress: {
        name: (clientProfile as any).user?.name,
        phone: clientProfile.phone,
        address: clientProfile.address,
        city: clientProfile.city,
        department: clientProfile.department,
        postalCode: clientProfile.postalCode,
      },
    } as any);

    // Notificaciones (no bloquean si fallan)
    const buyerEmail = (clientProfile as any).user?.email || user.email;
    const buyerName = (clientProfile as any).user?.name || user.name || 'comprador';
    this.mailService.sendOrderCreatedBuyer(buyerEmail, buyerName, order, productSnapshots).catch(() => {});
    this.mailService.notifyArtisansNewOrder(productSnapshots, order).catch(() => {});

    return order;
  }

  async confirmPayment(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.paymentStatus === PaymentStatus.Confirmed) return order;

    return this.ordersRepository.updatePaymentAndStatus(id, PaymentStatus.Confirmed, OrderStatus.Pending);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, user: any) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');

    const transitions: Record<string, string[]> = {
      [OrderStatus.AwaitingPayment]: [OrderStatus.Pending, OrderStatus.Cancelled],
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

    if (dto.status === OrderStatus.Cancelled) {
      // Solo restaurar stock si efectivamente se descontó (cualquier método ≠ COD o COD que ya estaba enviado).
      const wasReserved = order.paymentMethod !== PaymentMethod.CashOnDelivery
        || order.status === OrderStatus.Shipped;
      if (wasReserved) {
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
    }

    // Para COD, descontar stock al marcar enviado.
    if (dto.status === OrderStatus.Shipped && order.paymentMethod === PaymentMethod.CashOnDelivery) {
      for (const item of order.items) {
        const product = await this.productsRepository.atomicDecrementStock(item.product.toString(), item.quantity);
        if (!product) {
          throw new BadRequestException(
            `No se pudo descontar stock al despachar (producto agotado).`,
          );
        }
        await this.inventoryRepository.create({
          product: item.product as any,
          type: MovementType.Exit,
          quantity: item.quantity,
          previousStock: product.stock + item.quantity,
          newStock: product.stock,
          reason: `Despacho COD - Pedido #${id}`,
          performedBy: user.userId,
        });
      }
    }

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

  async findByIdWithAuth(id: string, user: any) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Orden no encontrada');

    if (user.role === Role.Admin) return order;

    const buyerId = (order.buyer as any)?._id?.toString() ?? order.buyer.toString();
    if (user.role === Role.Buyer && buyerId !== user.userId) {
      throw new ForbiddenException('No tienes permiso para ver esta orden');
    }

    if (user.role === Role.Artisan) {
      const hasArtisanProduct = order.items.some((item: any) => {
        const artisan = item.product?.artisan;
        const artisanId = artisan?._id?.toString() ?? artisan?.toString();
        return artisanId === user.userId;
      });
      if (!hasArtisanProduct) {
        throw new ForbiddenException('No tienes permiso para ver esta orden');
      }
    }

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
