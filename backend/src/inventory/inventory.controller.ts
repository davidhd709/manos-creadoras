import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { UpdateStockDto } from './dto/update-stock.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post(':productId/stock')
  @Roles(Role.Artisan, Role.Admin)
  updateStock(
    @Param('productId') productId: string,
    @Body() dto: UpdateStockDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.updateStock(productId, dto, user);
  }

  @Get(':productId/movements')
  @Roles(Role.Artisan, Role.Admin)
  getMovements(@Param('productId') productId: string) {
    return this.inventoryService.getMovements(productId);
  }

  @Get('movements/recent')
  @Roles(Role.Artisan, Role.Admin)
  getRecentMovements(@Query('limit') limit?: string) {
    return this.inventoryService.getRecentMovements(limit ? parseInt(limit, 10) : 20);
  }

  @Get('alerts')
  @Roles(Role.Artisan, Role.Admin)
  getAlerts() {
    return this.inventoryService.getStockAlerts();
  }

  @Get('low-stock')
  @Roles(Role.Artisan, Role.Admin)
  getLowStock(@Query('threshold') threshold?: string) {
    return this.inventoryService.getLowStockProducts(threshold ? parseInt(threshold, 10) : 5);
  }

  @Get('out-of-stock')
  @Roles(Role.Artisan, Role.Admin)
  getOutOfStock() {
    return this.inventoryService.getOutOfStockProducts();
  }

  @Get('artisan/summary')
  @Roles(Role.Artisan)
  getArtisanSummary(@CurrentUser() user: any) {
    return this.inventoryService.getArtisanInventorySummary(user.userId);
  }
}
