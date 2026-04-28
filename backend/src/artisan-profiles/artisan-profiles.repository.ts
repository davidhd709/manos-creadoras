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

  async findBySlug(slug: string): Promise<ArtisanProfile | null> {
    return this.model
      .findOne({ slug })
      .populate('user', 'name email isActive verificationStatus craft region whatsapp instagram')
      .exec();
  }

  async findPublic(filter: { craft?: string; region?: string; limit?: number } = {}): Promise<ArtisanProfile[]> {
    const q: any = { onboardingCompleted: true };
    if (filter.craft) q.craft = filter.craft;
    if (filter.region) q.region = filter.region;
    return this.model
      .find(q)
      .populate({
        path: 'user',
        match: { isActive: true, verificationStatus: 'approved' },
        select: 'name craft region',
      })
      .sort({ updatedAt: -1 })
      .limit(filter.limit ?? 24)
      .exec()
      .then((rows) => rows.filter((p) => (p as any).user));
  }

  async featured(limit = 3): Promise<ArtisanProfile[]> {
    return this.model
      .find({ onboardingCompleted: true, story: { $exists: true, $ne: '' } })
      .populate({
        path: 'user',
        match: { isActive: true, verificationStatus: 'approved' },
        select: 'name craft region',
      })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec()
      .then((rows) => rows.filter((p) => (p as any).user));
  }
}
