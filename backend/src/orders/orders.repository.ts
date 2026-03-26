import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';

@Injectable()
export class OrdersRepository {
  constructor(@InjectModel(Order.name) private readonly orderModel: Model<Order>) {}

  async create(data: Partial<Order>): Promise<Order> {
    return this.orderModel.create(data);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orderModel
      .findById(id)
      .populate('buyer', 'name email')
      .populate('items.product')
      .exec();
  }

  async findByBuyer(buyerId: string): Promise<Order[]> {
    return this.orderModel
      .find({ buyer: buyerId })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate('buyer', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(id: string, status: string): Promise<Order | null> {
    return this.orderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('buyer', 'name email')
      .populate('items.product')
      .exec();
  }

  async findByStatus(status: string): Promise<Order[]> {
    return this.orderModel
      .find({ status })
      .populate('buyer', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  async count(): Promise<number> {
    return this.orderModel.countDocuments().exec();
  }

  async countByStatus(status: string): Promise<number> {
    return this.orderModel.countDocuments({ status }).exec();
  }

  async calculateTotalRevenue(): Promise<number> {
    const result = await this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalOrder' } } },
    ]);
    return result[0]?.total || 0;
  }

  async calculateRevenueByArtisan(artisanId: string): Promise<number> {
    const result = await this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      { $match: { 'productData.artisan': artisanId } },
      { $group: { _id: null, total: { $sum: '$items.totalItem' } } },
    ]);
    return result[0]?.total || 0;
  }

  async getRecentOrders(limit = 10): Promise<Order[]> {
    return this.orderModel
      .find()
      .populate('buyer', 'name')
      .populate('items.product', 'title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getMonthlySales(): Promise<{ month: string; total: number; count: number }[]> {
    return this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$totalOrder' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
      { $project: { month: '$_id', total: 1, count: 1, _id: 0 } },
    ]);
  }
}
