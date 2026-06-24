import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [UsersService, UsersRepository],
  controllers: [UsersController],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
