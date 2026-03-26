import { Controller, Get, Post, Body, Param, Query, UseGuards, Put, Delete, Patch } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ReviewDto } from './dto/review.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query() query) {
    return this.productsService.list(query);
  }

  @Get('top')
  top() {
    return this.productsService.top();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Artisan)
  @Post()
  create(@Body() dto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Artisan, Role.Admin)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: any) {
    return this.productsService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Artisan, Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.remove(id, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Buyer)
  @Post(':id/reviews')
  review(@Param('id') id: string, @Body() dto: ReviewDto, @CurrentUser() user: any) {
    return this.productsService.addReview(id, user, dto.rating, dto.comment);
  }

  @Get(':id/reviews')
  reviews(@Param('id') id: string) {
    return this.productsService.reviews(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Artisan, Role.Admin)
  @Patch(':id/promotion')
  promotion(@Param('id') id: string, @Body() dto: UpdateProductDto, @CurrentUser() user: any) {
    return this.productsService.update(id, dto, user);
  }
}
