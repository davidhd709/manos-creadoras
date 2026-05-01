import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { Review } from './schemas/review.schema';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}

  // --- Products ---

  async create(data: Partial<Product>): Promise<Product> {
    return this.productModel.create(data);
  }

  async findById(id: string): Promise<Product | null> {
    return this.productModel.findById(id).populate('artisan', 'name email').exec();
  }

  async findPaginated(
    filter: Record<string, any>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1> = { soldCount: -1, ratingAverage: -1, createdAt: -1 },
  ): Promise<{ data: Product[]; total: number }> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('artisan', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);
    return { data, total };
  }

  async findTop(limit = 10): Promise<Product[]> {
    return this.productModel.find().sort({ soldCount: -1 }).limit(limit).exec();
  }

  async findByArtisan(artisanId: string): Promise<Product[]> {
    return this.productModel.find({ artisan: artisanId }).exec();
  }

  async aggregateArtisanStats(artisanId: string): Promise<{
    totalProducts: number;
    totalSold: number;
    avgRating: number;
    ratedProducts: number;
  }> {
    const result = await this.productModel.aggregate([
      { $match: { artisan: new Types.ObjectId(artisanId) } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalSold: { $sum: '$soldCount' },
          avgRating: { $avg: { $cond: [{ $gt: ['$ratingAverage', 0] }, '$ratingAverage', null] } },
          ratedProducts: { $sum: { $cond: [{ $gt: ['$ratingAverage', 0] }, 1, 0] } },
        },
      },
    ]);
    const r = result[0] || {};
    return {
      totalProducts: r.totalProducts || 0,
      totalSold: r.totalSold || 0,
      avgRating: r.avgRating || 0,
      ratedProducts: r.ratedProducts || 0,
    };
  }

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    return this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.productModel.findByIdAndDelete(id).exec();
  }

  async updateStock(id: string, quantity: number): Promise<Product | null> {
    return this.productModel
      .findByIdAndUpdate(id, { $inc: { stock: quantity, soldCount: -quantity } }, { new: true })
      .exec();
  }

  async decrementStock(id: string, quantity: number): Promise<Product | null> {
    return this.productModel
      .findByIdAndUpdate(id, { $inc: { stock: -quantity, soldCount: quantity } }, { new: true })
      .exec();
  }

  // Operación atómica: solo decrementa si hay stock suficiente (previene race conditions)
  async atomicDecrementStock(id: string, quantity: number): Promise<Product | null> {
    return this.productModel
      .findOneAndUpdate(
        { _id: id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity, soldCount: quantity } },
        { new: true },
      )
      .exec();
  }

  async findLowStock(threshold = 5): Promise<Product[]> {
    return this.productModel
      .find({ stock: { $lte: threshold, $gt: 0 } })
      .populate('artisan', 'name')
      .exec();
  }

  async findOutOfStock(): Promise<Product[]> {
    return this.productModel.find({ stock: 0 }).populate('artisan', 'name').exec();
  }

  async count(): Promise<number> {
    return this.productModel.countDocuments().exec();
  }

  async countByArtisan(artisanId: string): Promise<number> {
    return this.productModel.countDocuments({ artisan: artisanId }).exec();
  }

  // --- Reviews ---

  async createReview(data: Partial<Review>): Promise<Review> {
    return this.reviewModel.create(data);
  }

  async findReviewsByProduct(productId: string): Promise<Review[]> {
    return this.reviewModel
      .find({ product: productId })
      .populate('buyer', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async hasUserReviewed(productId: string, userId: string): Promise<boolean> {
    const review = await this.reviewModel.findOne({
      product: new Types.ObjectId(productId),
      buyer: new Types.ObjectId(userId),
    }).exec();
    return !!review;
  }

  async calculateAverageRating(productId: string): Promise<number> {
    const agg = await this.reviewModel.aggregate([
      { $match: { product: new Types.ObjectId(productId) } },
      { $group: { _id: '$product', avg: { $avg: '$rating' } } },
    ]);
    return agg[0]?.avg || 0;
  }

  async updateRating(productId: string, rating: number): Promise<void> {
    await this.productModel.findByIdAndUpdate(productId, { ratingAverage: rating });
  }
}
