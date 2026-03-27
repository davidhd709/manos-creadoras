import { Module, forwardRef } from '@nestjs/common';
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
    forwardRef(() => ProductsModule),
  ],
  providers: [InventoryService, InventoryRepository],
  controllers: [InventoryController],
  exports: [InventoryService, InventoryRepository],
})
export class InventoryModule {}
