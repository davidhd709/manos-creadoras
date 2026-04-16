import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async create(data: Partial<User>): Promise<User> {
    return this.userModel.create(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByDocumentNumber(docNumber: string): Promise<User | null> {
    return this.userModel.findOne({ documentNumber: docNumber }).exec();
  }

  async findByResetToken(hashedToken: string): Promise<User | null> {
    return this.userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires').exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findByRole(role: string): Promise<User[]> {
    return this.userModel.find({ role }).select('-password').exec();
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).select('-password').exec();
  }

  async deleteByRole(role: string): Promise<void> {
    await this.userModel.deleteMany({ role }).exec();
  }

  async count(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async countByRole(role: string): Promise<number> {
    return this.userModel.countDocuments({ role }).exec();
  }
}
