import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ArtisanProfile } from './schemas/artisan-profile.schema';

@Injectable()
export class ArtisanProfilesRepository {
  constructor(
    @InjectModel(ArtisanProfile.name) private readonly model: Model<ArtisanProfile>,
  ) {}

  async findByUserId(userId: string): Promise<ArtisanProfile | null> {
    return this.model.findOne({ user: userId }).populate('user', 'name email').exec();
  }

  async upsert(userId: string, data: Partial<ArtisanProfile>): Promise<ArtisanProfile> {
    return this.model
      .findOneAndUpdate({ user: userId }, { ...data, user: userId }, { new: true, upsert: true })
      .populate('user', 'name email')
      .exec();
  }

  async findAll(): Promise<ArtisanProfile[]> {
    return this.model.find().populate('user', 'name email').exec();
  }
}
