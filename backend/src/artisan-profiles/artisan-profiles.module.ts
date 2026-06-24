import { Module } from '@nestjs/common';
import { ArtisanProfilesController } from './artisan-profiles.controller';
import { ArtisanProfilesService } from './artisan-profiles.service';
import { ArtisanProfilesRepository } from './artisan-profiles.repository';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [ArtisanProfilesController],
  providers: [ArtisanProfilesService, ArtisanProfilesRepository],
  exports: [ArtisanProfilesService, ArtisanProfilesRepository],
})
export class ArtisanProfilesModule {}
