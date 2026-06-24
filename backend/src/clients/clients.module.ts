import { Module, forwardRef } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ClientsRepository } from './clients.repository';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  controllers: [ClientsController],
  providers: [ClientsService, ClientsRepository],
  exports: [ClientsService, ClientsRepository],
})
export class ClientsModule {}
