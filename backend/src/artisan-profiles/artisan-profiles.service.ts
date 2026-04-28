import { Injectable } from '@nestjs/common';
import { ArtisanProfilesRepository } from './artisan-profiles.repository';
import { CreateArtisanProfileDto } from './dto/create-artisan-profile.dto';
import { ProductsRepository } from '../products/products.repository';

function slugify(value: string) {
  return (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);
}

@Injectable()
export class ArtisanProfilesService {
  constructor(
    private readonly repo: ArtisanProfilesRepository,
    private readonly productsRepo: ProductsRepository,
  ) {}

  getProfile(userId: string) {
    return this.repo.findByUserId(userId);
  }

  async upsertProfile(userId: string, dto: CreateArtisanProfileDto) {
    const data: any = { ...dto };
    if (!data.slug && data.businessName) {
      data.slug = `${slugify(data.businessName)}-${userId.toString().slice(-4)}`;
    }
    const productCount = await this.productsRepo.countByArtisan(userId);
    data.onboardingCompleted = Boolean(
      data.businessName && data.story && data.region && data.craft && productCount > 0,
    );
    return this.repo.upsert(userId, data);
  }

  async getOnboardingStatus(userId: string) {
    const [profile, productCount] = await Promise.all([
      this.repo.findByUserId(userId),
      this.productsRepo.countByArtisan(userId),
    ]);
    const hasProfile = Boolean(profile?.businessName && profile?.story && profile?.region && profile?.craft);
    const hasProduct = productCount > 0;
    const hasFirstSale = false; // se conecta cuando haya pedidos por artesano
    return {
      profile: hasProfile,
      product: hasProduct,
      firstSale: hasFirstSale,
      productCount,
      completed: hasProfile && hasProduct,
    };
  }

  findAll() {
    return this.repo.findAll();
  }
}
