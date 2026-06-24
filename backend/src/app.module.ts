import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { BannersModule } from './banners/banners.module';
import { InventoryModule } from './inventory/inventory.module';
import { ClientsModule } from './clients/clients.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MailModule } from './mail/mail.module';
import { ArtisanProfilesModule } from './artisan-profiles/artisan-profiles.module';
import { UploadModule } from './upload/upload.module';
import { MetricsModule } from './metrics/metrics.module';
import { SeoModule } from './seo/seo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    BannersModule,
    InventoryModule,
    ClientsModule,
    DashboardModule,
    MailModule,
    ArtisanProfilesModule,
    UploadModule,
    MetricsModule,
    SeoModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
