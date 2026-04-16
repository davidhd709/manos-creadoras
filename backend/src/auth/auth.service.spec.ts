import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Record<string, jest.Mock>;
  let jwtService: Record<string, jest.Mock>;
  let mailService: Record<string, jest.Mock>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: '',
    role: 'buyer',
    isActive: true,
    toObject() {
      return { ...this };
    },
  };

  beforeEach(async () => {
    mockUser.password = await bcrypt.hash('Password1!', 10);

    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findByIdWithPassword: jest.fn(),
      findByResetToken: jest.fn(),
      update: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    mailService = {
      sendArtisanWelcome: jest.fn().mockResolvedValue(undefined),
      sendPasswordReset: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new buyer and return token', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1!',
        role: 'buyer' as any,
      });

      expect(result.access_token).toBe('mock-jwt-token');
      expect(usersService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({ name: 'T', email: 'test@example.com', password: 'Password1!', role: 'buyer' as any }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException if role is not buyer', async () => {
      await expect(
        service.register({ name: 'T', email: 'a@b.com', password: 'Password1!', role: 'admin' as any }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.login({ email: 'test@example.com', password: 'Password1!' });

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.mustChangePassword).toBe(false);
    });

    it('should throw UnauthorizedException for wrong email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'Password1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPass1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      usersService.findByEmail.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(
        service.login({ email: 'test@example.com', password: 'Password1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should return generic response if user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'unknown@test.com' });
      expect(result.message).toContain('Si el correo existe');
      expect(mailService.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('should generate token and send email if user exists', async () => {
      usersService.findByEmail.mockResolvedValue({ ...mockUser, isActive: true });

      const result = await service.forgotPassword({ email: 'test@example.com' });
      expect(result.message).toContain('Si el correo existe');
      expect(mailService.sendPasswordReset).toHaveBeenCalled();
      expect(usersService.update).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          passwordResetToken: expect.any(String),
          passwordResetExpires: expect.any(Date),
        }),
      );
    });

    it('should not send email for inactive users', async () => {
      usersService.findByEmail.mockResolvedValue({ ...mockUser, isActive: false });

      await service.forgotPassword({ email: 'test@example.com' });
      expect(mailService.sendPasswordReset).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should throw if token invalid', async () => {
      usersService.findByResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'invalid', newPassword: 'NewPass1!' }),
      ).rejects.toThrow('Token invalido o expirado');
    });

    it('should reset password successfully with valid token', async () => {
      usersService.findByResetToken.mockResolvedValue(mockUser);

      const result = await service.resetPassword({ token: 'validtoken', newPassword: 'NewPass1!' });
      expect(result.message).toContain('exitosamente');
      expect(usersService.update).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          passwordResetToken: undefined,
          passwordResetExpires: undefined,
        }),
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      usersService.findByIdWithPassword.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue(null);

      const result = await service.changePassword('507f1f77bcf86cd799439011', {
        currentPassword: 'Password1!',
        newPassword: 'NewPassword2@',
      });

      expect(result.message).toBe('Contrasena actualizada exitosamente');
      expect(usersService.update).toHaveBeenCalled();
    });

    it('should throw if current password is wrong', async () => {
      usersService.findByIdWithPassword.mockResolvedValue(mockUser);

      await expect(
        service.changePassword('507f1f77bcf86cd799439011', {
          currentPassword: 'WrongCurrent1!',
          newPassword: 'NewPassword2@',
        }),
      ).rejects.toThrow('La contrasena actual es incorrecta');
    });

    it('should throw if new password equals current', async () => {
      usersService.findByIdWithPassword.mockResolvedValue(mockUser);

      await expect(
        service.changePassword('507f1f77bcf86cd799439011', {
          currentPassword: 'Password1!',
          newPassword: 'Password1!',
        }),
      ).rejects.toThrow('La nueva contrasena debe ser diferente a la actual');
    });
  });
});
