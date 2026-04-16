import { Injectable, ForbiddenException, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { OrdersRepository } from '../orders/orders.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '../common/roles.enum';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    @Inject(forwardRef(() => OrdersRepository))
    private readonly ordersRepository: OrdersRepository,
  ) {}

  async list(filter: any) {
    const q: any = {};
    if (filter.category) q.category = filter.category;
    if (filter.search) {
      const escaped = filter.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      q.title = { $regex: escaped, $options: 'i' };
    }
    if (filter.isPromotion === 'true') q.isPromotion = true;
    if (filter.artisan) q.artisan = filter.artisan;

    const page = Math.max(1, parseInt(filter.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(filter.limit, 10) || 12));

    const { data, total } = await this.productsRepository.findPaginated(q, page, limit);

    return {
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  top() {
    return this.productsRepository.findTop(10);
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(dto: CreateProductDto, user: any) {
    return this.productsRepository.create({ ...dto, artisan: user.userId });
  }

  async update(id: string, dto: UpdateProductDto, user: any) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    const artisanId = (product.artisan as any)?._id?.toString() ?? product.artisan.toString();
    if (user.role !== Role.Admin && artisanId !== user.userId) {
      throw new ForbiddenException('No tienes permiso para editar este producto');
    }

    const updateData: any = { ...dto };
    if (dto.isPromotion === false) {
      updateData.promotionPrice = undefined;
    }

    return this.productsRepository.update(id, updateData);
  }

  async remove(id: string, user: any) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    const artisanId = (product.artisan as any)?._id?.toString() ?? product.artisan.toString();
    if (user.role !== Role.Admin && artisanId !== user.userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este producto');
    }

    // Verificar que no haya órdenes activas con este producto
    const activeOrders = await this.ordersRepository.findActiveByProduct(id);
    if (activeOrders.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar: hay ${activeOrders.length} orden(es) activa(s) con este producto`,
      );
    }

    await this.productsRepository.delete(id);
    return { message: 'Producto eliminado correctamente' };
  }

  async addReview(productId: string, user: any, rating: number, comment: string) {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundException('Producto no encontrado');

    // Validar que el comprador haya comprado el producto
    const hasPurchased = await this.ordersRepository.hasBuyerPurchasedProduct(user.userId, productId);
    if (!hasPurchased) {
      throw new BadRequestException('Solo puedes opinar sobre productos que hayas comprado');
    }

    // Prevenir reviews duplicados
    const alreadyReviewed = await this.productsRepository.hasUserReviewed(productId, user.userId);
    if (alreadyReviewed) {
      throw new BadRequestException('Ya has dejado una reseña para este producto');
    }

    const review = await this.productsRepository.createReview({
      product: productId as any,
      buyer: user.userId,
      rating,
      comment,
    });

    const avg = await this.productsRepository.calculateAverageRating(productId);
    await this.productsRepository.updateRating(productId, avg);

    return review;
  }

  reviews(productId: string) {
    return this.productsRepository.findReviewsByProduct(productId);
  }

  findByArtisan(artisanId: string) {
    return this.productsRepository.findByArtisan(artisanId);
  }

  findLowStock(threshold = 5) {
    return this.productsRepository.findLowStock(threshold);
  }

  findOutOfStock() {
    return this.productsRepository.findOutOfStock();
  }
}
