import { Controller, Get, Put, Post, Patch, Body, UseGuards, Param } from '@nestjs/common';
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

  @Get('artisans/pending')
  @Roles(Role.Admin, Role.SuperAdmin)
  pendingArtisans() {
    return this.usersService.findPendingArtisans();
  }

  @Patch('artisans/:id/approve')
  @Roles(Role.Admin, Role.SuperAdmin)
  approveArtisan(@Param('id') id: string) {
    return this.usersService.approveArtisan(id);
  }

  @Patch('artisans/:id/reject')
  @Roles(Role.Admin, Role.SuperAdmin)
  rejectArtisan(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.usersService.rejectArtisan(id, body?.reason);
  }
}
