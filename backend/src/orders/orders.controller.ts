import { Controller, Post, Get, Body, UseGuards, Param, Patch, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.Buyer)
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(dto, user);
  }

  @Get('my')
  @Roles(Role.Buyer)
  my(@CurrentUser() user: any) {
    return this.ordersService.myOrders(user);
  }

  @Get('artisan')
  @Roles(Role.Artisan)
  artisan(@CurrentUser() user: any) {
    return this.ordersService.artisanOrders(user);
  }

  @Get('status/:status')
  @Roles(Role.Admin, Role.SuperAdmin, Role.Artisan)
  byStatus(@Param('status') status: string) {
    return this.ordersService.findByStatus(status);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.SuperAdmin, Role.Artisan, Role.Buyer)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.findByIdWithAuth(id, user);
  }

  @Patch(':id/status')
  @Roles(Role.Admin, Role.SuperAdmin, Role.Artisan)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.updateStatus(id, dto, user);
  }

  @Patch(':id/confirm-payment')
  @Roles(Role.Admin, Role.SuperAdmin, Role.Artisan)
  confirmPayment(@Param('id') id: string) {
    return this.ordersService.confirmPayment(id);
  }

  @Get()
  @Roles(Role.Admin, Role.SuperAdmin)
  all() {
    return this.ordersService.all();
  }
}
