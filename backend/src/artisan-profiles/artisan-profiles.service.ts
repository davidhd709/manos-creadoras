import { Injectable, NotFoundException } from '@nestjs/common';
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
    const hasFirstSale = false;
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

  listPublic(filter: { craft?: string; region?: string; limit?: number }) {
    return this.repo.findPublic(filter);
  }

  featured(limit = 3) {
    return this.repo.featured(limit);
  }

  async getPublicBySlug(slug: string) {
    const profile = await this.repo.findBySlug(slug);
    if (!profile) throw new NotFoundException('Artesano no encontrado');
    const user: any = profile.user;
    if (!user || !user.isActive || user.verificationStatus !== 'approved') {
      throw new NotFoundException('Artesano no disponible');
    }
    const products = await this.productsRepo.findByArtisan(user._id.toString());
    return { profile, products };
  }
}
