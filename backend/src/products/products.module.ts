import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  providers: [ProductsService, ProductsRepository],
  controllers: [ProductsController],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
