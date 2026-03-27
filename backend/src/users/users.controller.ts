import { Controller, Get, Put, Post, Body, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateArtisanDto } from './dto/create-artisan.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usersService.findById(user.userId);
  }

  @Get()
  @Roles(Role.Admin)
  getAll() {
    return this.usersService.findAll();
  }

  @Get('role/:role')
  @Roles(Role.Admin)
  getByRole(@Param('role') role: string) {
    return this.usersService.findByRole(role);
  }

  @Put('me')
  updateProfile(@CurrentUser() user: any, @Body() data: { name?: string }) {
    return this.usersService.update(user.userId, data);
  }

  @Post('artisans')
  @Roles(Role.SuperAdmin)
  createArtisan(@Body() dto: CreateArtisanDto) {
    return this.usersService.createArtisan(dto);
  }
}
