import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryRepository } from './inventory.repository';
import { InventoryMovement, InventoryMovementSchema } from './schemas/inventory.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InventoryMovement.name, schema: InventoryMovementSchema },
    ]),
    ProductsModule,
  ],
  providers: [InventoryService, InventoryRepository],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
