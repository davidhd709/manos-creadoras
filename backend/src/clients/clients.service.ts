import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { OrdersRepository } from '../orders/orders.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    private readonly ordersRepository: OrdersRepository,
  ) {}

  async getProfile(userId: string) {
    const client = await this.clientsRepository.findByUserId(userId);
    if (!client) {
      return this.clientsRepository.create({ user: userId as any });
    }
    return client;
  }

  async updateProfile(userId: string, dto: UpdateClientDto) {
    return this.clientsRepository.update(userId, dto);
  }

  async getAll() {
    return this.clientsRepository.findAll();
  }

  async getClientWithHistory(userId: string) {
    const [client, orders] = await Promise.all([
      this.clientsRepository.findByUserId(userId),
      this.ordersRepository.findByBuyer(userId),
    ]);

    return {
      profile: client,
      orders,
      stats: {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, o) => sum + o.totalOrder, 0),
      },
    };
  }

  getTopClients(limit = 10) {
    return this.clientsRepository.getTopClients(limit);
  }
}
