import { Controller, Get, Put, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/roles.enum';
import { UpdateClientDto } from './dto/update-client.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('me')
  @Roles(Role.Buyer)
  myProfile(@CurrentUser() user: any) {
    return this.clientsService.getProfile(user.userId);
  }

  @Put('me')
  @Roles(Role.Buyer)
  updateMyProfile(@CurrentUser() user: any, @Body() dto: UpdateClientDto) {
    return this.clientsService.updateProfile(user.userId, dto);
  }

  @Get()
  @Roles(Role.Admin, Role.SuperAdmin)
  getAll() {
    return this.clientsService.getAll();
  }

  @Get('top')
  @Roles(Role.Admin, Role.SuperAdmin)
  topClients(@Query('limit') limit?: string) {
    return this.clientsService.getTopClients(limit ? parseInt(limit, 10) : 10);
  }

  @Get(':userId/history')
  @Roles(Role.Admin, Role.SuperAdmin)
  getClientHistory(@Param('userId') userId: string) {
    return this.clientsService.getClientWithHistory(userId);
  }
}
