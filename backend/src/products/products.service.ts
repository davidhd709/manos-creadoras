import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '../common/roles.enum';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async list(filter: any) {
    const q: any = {};
    if (filter.category) q.category = filter.category;
    if (filter.search) q.title = { $regex: filter.search, $options: 'i' };
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
    if (user.role !== Role.Admin && product.artisan.toString() !== user.userId) {
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
    if (user.role !== Role.Admin && product.artisan.toString() !== user.userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este producto');
    }
    await this.productsRepository.delete(id);
    return { message: 'Producto eliminado correctamente' };
  }

  async addReview(productId: string, user: any, rating: number, comment: string) {
    const product = await this.productsRepository.findById(productId);
    if (!product) throw new NotFoundException('Producto no encontrado');

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
