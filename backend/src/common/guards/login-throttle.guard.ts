import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  blockedUntil: number;
}

@Injectable()
export class LoginThrottleGuard implements CanActivate {
  private attempts = new Map<string, LoginAttempt>();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 min
  private readonly blockDurationMs = 15 * 60 * 1000; // 15 min

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const email = request.body?.email?.toLowerCase();
    if (!email) return true;

    const key = `${email}:${request.ip}`;
    const now = Date.now();
    const record = this.attempts.get(key);

    if (record && record.blockedUntil > now) {
      const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      throw new HttpException(
        `Demasiados intentos de inicio de sesión. Intenta de nuevo en ${remainingSeconds} segundos.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (record && now - record.lastAttempt > this.windowMs) {
      this.attempts.delete(key);
    }

    return true;
  }

  recordFailedAttempt(email: string, ip: string): void {
    const key = `${email.toLowerCase()}:${ip}`;
    const now = Date.now();
    const record = this.attempts.get(key) || { count: 0, lastAttempt: now, blockedUntil: 0 };

    record.count++;
    record.lastAttempt = now;

    if (record.count >= this.maxAttempts) {
      record.blockedUntil = now + this.blockDurationMs;
      record.count = 0;
    }

    this.attempts.set(key, record);
  }

  recordSuccessfulLogin(email: string, ip: string): void {
    const key = `${email.toLowerCase()}:${ip}`;
    this.attempts.delete(key);
  }
}
