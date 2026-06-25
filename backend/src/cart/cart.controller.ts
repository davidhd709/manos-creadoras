import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';
import { SyncCartDto } from './dto/sync-cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: Request) {
    return this.cartService.getCart((req.user as any).sub);
  }

  @Put('items')
  upsertItem(@Req() req: Request, @Body() dto: UpsertCartItemDto) {
    return this.cartService.upsertItem((req.user as any).sub, dto);
  }

  @Delete('items/:productId')
  removeItem(@Req() req: Request, @Param('productId') productId: string) {
    return this.cartService.removeItem((req.user as any).sub, productId);
  }

  @Delete()
  clearCart(@Req() req: Request) {
    return this.cartService.clearCart((req.user as any).sub);
  }

  @Post('sync')
  syncItems(@Req() req: Request, @Body() dto: SyncCartDto) {
    return this.cartService.syncItems((req.user as any).sub, dto);
  }
}
