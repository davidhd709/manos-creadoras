import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterArtisanDto } from './dto/register-artisan.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LoginThrottleGuard } from '../common/guards/login-throttle.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private loginThrottleGuard: LoginThrottleGuard,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register-artisan')
  registerArtisan(@Body() dto: RegisterArtisanDto) {
    return this.authService.registerArtisan(dto);
  }

  @Post('login')
  @UseGuards(LoginThrottleGuard)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    try {
      const result = await this.authService.login(dto);
      this.loginThrottleGuard.recordSuccessfulLogin(dto.email, req.ip);
      return result;
    } catch (error) {
      this.loginThrottleGuard.recordFailedAttempt(dto.email, req.ip);
      throw error;
    }
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.userId, dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
