import { Controller, Get, Put, Body, UseGuards, Param } from '@nestjs/common';
import { ArtisanProfilesService } from './artisan-profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateArtisanProfileDto } from './dto/create-artisan-profile.dto';

@Controller('artisan-profiles')
export class ArtisanProfilesController {
  constructor(private readonly service: ArtisanProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Artisan)
  getMyProfile(@CurrentUser() user: any) {
    return this.service.getProfile(user.userId);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Artisan)
  updateMyProfile(@CurrentUser() user: any, @Body() dto: CreateArtisanProfileDto) {
    return this.service.upsertProfile(user.userId, dto);
  }

  @Get(':userId')
  getPublicProfile(@Param('userId') userId: string) {
    return this.service.getProfile(userId);
  }
}
