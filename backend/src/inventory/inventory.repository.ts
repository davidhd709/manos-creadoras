import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryMovement } from './schemas/inventory.schema';

@Injectable()
export class InventoryRepository {
  constructor(
    @InjectModel(InventoryMovement.name)
    private readonly movementModel: Model<InventoryMovement>,
  ) {}

  async create(data: Partial<InventoryMovement>): Promise<InventoryMovement> {
    return this.movementModel.create(data);
  }

  async findByProduct(productId: string): Promise<InventoryMovement[]> {
    return this.movementModel
      .find({ product: productId })
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findRecent(limit = 20): Promise<InventoryMovement[]> {
    return this.movementModel
      .find()
      .populate('product', 'title stock')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
