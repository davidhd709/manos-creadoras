import { Controller, Get, Put, Body, UseGuards, Param, Query } from '@nestjs/common';
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

  @Get('public')
  listPublic(
    @Query('craft') craft?: string,
    @Query('region') region?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.listPublic({
      craft,
      region,
      limit: limit ? Math.min(48, Math.max(1, parseInt(limit, 10))) : undefined,
    });
  }

  @Get('featured')
  featured(@Query('limit') limit?: string) {
    return this.service.featured(limit ? Math.min(12, Math.max(1, parseInt(limit, 10))) : 3);
  }

  @Get('slug/:slug')
  getPublicBySlug(@Param('slug') slug: string) {
    return this.service.getPublicBySlug(slug);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Artisan)
  getMyProfile(@CurrentUser() user: any) {
    return this.service.getProfile(user.userId);
  }

  @Get('me/onboarding')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Artisan)
  getOnboardingStatus(@CurrentUser() user: any) {
    return this.service.getOnboardingStatus(user.userId);
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
