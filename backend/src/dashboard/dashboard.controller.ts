import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(Role.Admin)
  adminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('artisan')
  @Roles(Role.Artisan)
  artisanDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getArtisanDashboard(user.userId);
  }

  @Get('buyer')
  @Roles(Role.Buyer)
  buyerDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getBuyerDashboard(user.userId);
  }
}
