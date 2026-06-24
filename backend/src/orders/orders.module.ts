import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { ProductsModule } from '../products/products.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ClientsModule } from '../clients/clients.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    forwardRef(() => ProductsModule),
    forwardRef(() => InventoryModule),
    forwardRef(() => ClientsModule),
    MailModule,
  ],
  providers: [OrdersService, OrdersRepository],
  controllers: [OrdersController],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
