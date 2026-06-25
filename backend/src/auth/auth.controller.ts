import { Controller, Post, Body, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
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
import { Request, Response } from 'express';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = (isProd: boolean) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  path: '/auth',
});

@Controller('auth')
export class AuthController {
  private readonly isProd = process.env.NODE_ENV === 'production';

  constructor(
    private authService: AuthService,
    private loginThrottleGuard: LoginThrottleGuard,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    const { refresh_token, ...rest } = result;
    res.cookie(REFRESH_COOKIE, refresh_token, COOKIE_OPTIONS(this.isProd));
    return rest;
  }

  @Post('register-artisan')
  registerArtisan(@Body() dto: RegisterArtisanDto) {
    return this.authService.registerArtisan(dto);
  }

  @Post('login')
  @UseGuards(LoginThrottleGuard)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const result = await this.authService.login(dto);
      this.loginThrottleGuard.recordSuccessfulLogin(dto.email, req.ip);
      const { refresh_token, ...rest } = result;
      res.cookie(REFRESH_COOKIE, refresh_token, COOKIE_OPTIONS(this.isProd));
      return rest;
    } catch (error) {
      this.loginThrottleGuard.recordFailedAttempt(dto.email, req.ip);
      throw error;
    }
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw new UnauthorizedException('Sesion expirada');
    const result = await this.authService.refresh(token);
    const { refresh_token, ...rest } = result;
    res.cookie(REFRESH_COOKIE, refresh_token, COOKIE_OPTIONS(this.isProd));
    return rest;
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) await this.authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
    return { message: 'Sesion cerrada exitosamente' };
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
