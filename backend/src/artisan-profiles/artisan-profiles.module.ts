import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtisanProfilesService } from './artisan-profiles.service';
import { ArtisanProfilesController } from './artisan-profiles.controller';
import { ArtisanProfilesRepository } from './artisan-profiles.repository';
import { ArtisanProfile, ArtisanProfileSchema } from './schemas/artisan-profile.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ArtisanProfile.name, schema: ArtisanProfileSchema }]),
    ProductsModule,
  ],
  providers: [ArtisanProfilesService, ArtisanProfilesRepository],
  controllers: [ArtisanProfilesController],
  exports: [ArtisanProfilesService],
})
export class ArtisanProfilesModule {}
