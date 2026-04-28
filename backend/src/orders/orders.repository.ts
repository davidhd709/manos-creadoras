import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  async updatePaymentAndStatus(id: string, paymentStatus: string, status: string): Promise<Order | null> {
    return this.orderModel
      .findByIdAndUpdate(id, { paymentStatus, status }, { new: true })
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
      { $match: { status: { $ne: 'cancelado' } } },
      { $group: { _id: null, total: { $sum: '$totalOrder' } } },
    ]);
    return result[0]?.total || 0;
  }

  async calculateRevenueByArtisan(artisanId: string): Promise<number> {
    const result = await this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelado' } } },
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
      { $match: { 'productData.artisan': new Types.ObjectId(artisanId) } },
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

  async findByArtisan(artisanId: string): Promise<Order[]> {
    return this.orderModel.aggregate([
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
      { $match: { 'productData.artisan': new Types.ObjectId(artisanId) } },
      {
        $group: {
          _id: '$_id',
          buyer: { $first: '$buyer' },
          items: { $push: '$items' },
          totalOrder: { $first: '$totalOrder' },
          status: { $first: '$status' },
          notes: { $first: '$notes' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }

  async findActiveByProduct(productId: string): Promise<Order[]> {
    return this.orderModel
      .find({
        'items.product': new Types.ObjectId(productId),
        status: { $in: ['pendiente', 'en_proceso', 'enviado'] },
      })
      .exec();
  }

  async hasBuyerPurchasedProduct(buyerId: string, productId: string): Promise<boolean> {
    const order = await this.orderModel.findOne({
      buyer: new Types.ObjectId(buyerId),
      'items.product': new Types.ObjectId(productId),
      status: { $in: ['entregado', 'enviado', 'en_proceso'] },
    }).exec();
    return !!order;
  }

  async getMonthlySales(): Promise<{ month: string; total: number; count: number }[]> {
    return this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelado' } } },
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

  async getMonthlySalesByArtisan(artisanId: string): Promise<any[]> {
    return this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelado' } } },
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
      { $match: { 'productData.artisan': new Types.ObjectId(artisanId) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$items.totalItem' },
          count: { $sum: '$items.quantity' },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 12 },
      { $project: { month: '$_id', total: 1, count: 1, _id: 0 } },
    ]);
  }

  async getRevenueByProductForArtisan(artisanId: string): Promise<any[]> {
    return this.orderModel.aggregate([
      { $match: { status: { $ne: 'cancelado' } } },
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
      { $match: { 'productData.artisan': new Types.ObjectId(artisanId) } },
      {
        $group: {
          _id: '$items.product',
          productTitle: { $first: '$productData.title' },
          totalRevenue: { $sum: '$items.totalItem' },
          totalSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 20 },
    ]);
  }
}
