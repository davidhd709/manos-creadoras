import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [UsersModule, ProductsModule, OrdersModule],
  providers: [MetricsService],
  controllers: [MetricsController],
})
export class MetricsModule {}
