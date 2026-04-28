import { Module } from '@nestjs/common';
import { SeoService } from './seo.service';
import { SeoController } from './seo.controller';
import { ProductsModule } from '../products/products.module';
import { ArtisanProfilesModule } from '../artisan-profiles/artisan-profiles.module';

@Module({
  imports: [ProductsModule, ArtisanProfilesModule],
  providers: [SeoService],
  controllers: [SeoController],
})
export class SeoModule {}
