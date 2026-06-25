import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    const where: Prisma.ProductWhereInput = {};

    if (filter.category) where.category = filter.category;

    if (filter.search) {
      const term = filter.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (filter.isPromotion === 'true') where.isPromotion = true;
    if (filter.artisan) where.artisanId = filter.artisan;

    const minPrice = parseFloat(filter.minPrice);
    const maxPrice = parseFloat(filter.maxPrice);
    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
      where.price = {};
      if (!Number.isNaN(minPrice)) (where.price as any).gte = minPrice;
      if (!Number.isNaN(maxPrice)) (where.price as any).lte = maxPrice;
    }

    const minRating = parseFloat(filter.minRating);
    if (!Number.isNaN(minRating) && minRating > 0) {
      where.ratingAverage = { gte: minRating };
    }

    if (filter.inStock === 'true') where.stock = { gt: 0 };

    const sortMap: Record<string, Prisma.ProductOrderByWithRelationInput[]> = {
      relevance: [{ soldCount: 'desc' }, { ratingAverage: 'desc' }, { createdAt: 'desc' }],
      price_asc: [{ price: 'asc' }],
      price_desc: [{ price: 'desc' }],
      newest: [{ createdAt: 'desc' }],
      bestsellers: [{ soldCount: 'desc' }],
      rating: [{ ratingAverage: 'desc' }, { soldCount: 'desc' }],
    };
    const orderBy = sortMap[filter.sort] || sortMap.relevance;

    const page = Math.max(1, parseInt(filter.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(filter.limit, 10) || 12));

    const { data, total } = await this.productsRepository.findPaginated(where, page, limit, orderBy);

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
    return this.productsRepository.create({
      ...dto,
      artisan: { connect: { id: user.sub || user.userId } },
    });
  }

  async update(id: string, dto: UpdateProductDto, user: any) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');

    const isPlatformAdmin = user.role === Role.Admin || user.role === Role.SuperAdmin;
    if (!isPlatformAdmin && product.artisanId !== (user.sub || user.userId)) {
      throw new ForbiddenException('No tienes permiso para editar este producto');
    }

    const updateData: Prisma.ProductUpdateInput = { ...dto };
    if (dto.isPromotion === false) updateData.promotionPrice = null;

    return this.productsRepository.update(id, updateData);
  }

  async remove(id: string, user: any) {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');

    const isPlatformAdmin = user.role === Role.Admin || user.role === Role.SuperAdmin;
    if (!isPlatformAdmin && product.artisanId !== (user.sub || user.userId)) {
      throw new ForbiddenException('No tienes permiso para eliminar este producto');
    }

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

    const userId = user.sub || user.userId;

    const hasPurchased = await this.ordersRepository.hasBuyerPurchasedProduct(userId, productId);
    if (!hasPurchased) {
      throw new BadRequestException('Solo puedes opinar sobre productos que hayas comprado');
    }

    const alreadyReviewed = await this.productsRepository.hasUserReviewed(productId, userId);
    if (alreadyReviewed) {
      throw new BadRequestException('Ya has dejado una reseña para este producto');
    }

    const review = await this.productsRepository.createReview({
      product: { connect: { id: productId } },
      buyer: { connect: { id: userId } },
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
