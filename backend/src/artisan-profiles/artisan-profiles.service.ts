import { Injectable } from '@nestjs/common';
import { ArtisanProfilesRepository } from './artisan-profiles.repository';
import { CreateArtisanProfileDto } from './dto/create-artisan-profile.dto';

@Injectable()
export class ArtisanProfilesService {
  constructor(private readonly repo: ArtisanProfilesRepository) {}

  getProfile(userId: string) {
    return this.repo.findByUserId(userId);
  }

  upsertProfile(userId: string, dto: CreateArtisanProfileDto) {
    return this.repo.upsert(userId, dto);
  }

  findAll() {
    return this.repo.findAll();
  }
}
