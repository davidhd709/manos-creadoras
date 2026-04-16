import { LoginThrottleGuard } from './login-throttle.guard';
import { ExecutionContext, HttpException } from '@nestjs/common';

function createMockContext(email: string, ip = '127.0.0.1'): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ body: { email }, ip }),
    }),
  } as any;
}

describe('LoginThrottleGuard', () => {
  let guard: LoginThrottleGuard;

  beforeEach(() => {
    guard = new LoginThrottleGuard();
  });

  it('should allow request when no previous attempts', () => {
    const ctx = createMockContext('test@test.com');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow request without email in body', () => {
    const ctx = { switchToHttp: () => ({ getRequest: () => ({ body: {}, ip: '127.0.0.1' }) }) } as any;
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow up to 4 failed attempts', () => {
    const ctx = createMockContext('test@test.com');

    for (let i = 0; i < 4; i++) {
      guard.recordFailedAttempt('test@test.com', '127.0.0.1');
    }

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should block after 5 failed attempts', () => {
    const ctx = createMockContext('test@test.com');

    for (let i = 0; i < 5; i++) {
      guard.recordFailedAttempt('test@test.com', '127.0.0.1');
    }

    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });

  it('should clear attempts on successful login', () => {
    const ctx = createMockContext('test@test.com');

    for (let i = 0; i < 4; i++) {
      guard.recordFailedAttempt('test@test.com', '127.0.0.1');
    }

    guard.recordSuccessfulLogin('test@test.com', '127.0.0.1');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should track different email+ip combinations separately', () => {
    for (let i = 0; i < 5; i++) {
      guard.recordFailedAttempt('a@test.com', '127.0.0.1');
    }

    const ctxDifferentEmail = createMockContext('b@test.com');
    expect(guard.canActivate(ctxDifferentEmail)).toBe(true);

    const ctxDifferentIp = createMockContext('a@test.com', '192.168.1.1');
    expect(guard.canActivate(ctxDifferentIp)).toBe(true);
  });
});
