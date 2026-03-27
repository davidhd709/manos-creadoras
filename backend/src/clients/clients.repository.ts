import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client } from './schemas/client.schema';

@Injectable()
export class ClientsRepository {
  constructor(@InjectModel(Client.name) private readonly clientModel: Model<Client>) {}

  async create(data: Partial<Client>): Promise<Client> {
    return this.clientModel.create(data);
  }

  async findByUserId(userId: string): Promise<Client | null> {
    return this.clientModel.findOne({ user: userId }).populate('user', 'name email').exec();
  }

  async findAll(): Promise<Client[]> {
    return this.clientModel.find().populate('user', 'name email').sort({ totalSpent: -1 }).exec();
  }

  async update(userId: string, data: Partial<Client>): Promise<Client | null> {
    return this.clientModel
      .findOneAndUpdate({ user: userId }, data, { new: true, upsert: true })
      .populate('user', 'name email')
      .exec();
  }

  async incrementPurchases(userId: string, amount: number): Promise<void> {
    await this.clientModel.findOneAndUpdate(
      { user: userId },
      { $inc: { totalPurchases: 1, totalSpent: amount } },
      { upsert: true },
    );
  }

  async incrementPurchaseStats(userId: string, totalSpent: number): Promise<void> {
    await this.clientModel.findOneAndUpdate(
      { user: userId },
      { $inc: { totalPurchases: 1, totalSpent } },
      { upsert: true },
    );
  }

  async count(): Promise<number> {
    return this.clientModel.countDocuments().exec();
  }

  async getTopClients(limit = 10): Promise<Client[]> {
    return this.clientModel
      .find()
      .populate('user', 'name email')
      .sort({ totalSpent: -1 })
      .limit(limit)
      .exec();
  }
}
