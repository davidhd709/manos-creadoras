import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  create(data: Partial<User>) {
    return this.usersRepository.create(data);
  }

  findAll() {
    return this.usersRepository.findAll();
  }

  findByRole(role: string) {
    return this.usersRepository.findByRole(role);
  }

  update(id: string, data: Partial<User>) {
    return this.usersRepository.update(id, data);
  }

  count() {
    return this.usersRepository.count();
  }

  countByRole(role: string) {
    return this.usersRepository.countByRole(role);
  }
}
