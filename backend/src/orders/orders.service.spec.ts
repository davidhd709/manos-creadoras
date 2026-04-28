import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';
import { ProductsRepository } from '../products/products.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { ClientsRepository } from '../clients/clients.repository';
import { MailService } from '../mail/mail.service';
import { PaymentMethod } from './schemas/order.schema';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepo: Record<string, jest.Mock>;
  let productsRepo: Record<string, jest.Mock>;
  let inventoryRepo: Record<string, jest.Mock>;
  let clientsRepo: Record<string, jest.Mock>;
  let mailService: Record<string, jest.Mock>;

  const mockUser = { userId: 'user1', email: 'test@test.com', role: 'buyer' };

  beforeEach(async () => {
    ordersRepo = {
      create: jest.fn().mockImplementation((data) => ({ _id: 'order1', ...data })),
      findById: jest.fn(),
      findByBuyer: jest.fn().mockResolvedValue([]),
      findAll: jest.fn().mockResolvedValue([]),
      findByStatus: jest.fn().mockResolvedValue([]),
      findByArtisan: jest.fn().mockResolvedValue([]),
      updateStatus: jest.fn(),
      updatePaymentAndStatus: jest.fn(),
      getRecentOrders: jest.fn().mockResolvedValue([]),
    };

    productsRepo = {
      findById: jest.fn(),
      atomicDecrementStock: jest.fn(),
      updateStock: jest.fn(),
    };

    inventoryRepo = {
      create: jest.fn().mockResolvedValue({}),
    };

    clientsRepo = {
      findByUserId: jest.fn(),
      incrementPurchaseStats: jest.fn(),
    };

    mailService = {
      sendOrderCreatedBuyer: jest.fn().mockResolvedValue(undefined),
      notifyArtisansNewOrder: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersRepository, useValue: ordersRepo },
        { provide: ProductsRepository, useValue: productsRepo },
        { provide: InventoryRepository, useValue: inventoryRepo },
        { provide: ClientsRepository, useValue: clientsRepo },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('create', () => {
    const createDto: any = {
      items: [{ product: 'prod1', quantity: 2, unitPrice: 100, totalItem: 200 }],
      totalOrder: 200,
      paymentMethod: PaymentMethod.Whatsapp,
    };

    it('should throw if buyer has no shipping address', async () => {
      clientsRepo.findByUserId.mockResolvedValue(null);

      await expect(service.create(createDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw if product not found', async () => {
      clientsRepo.findByUserId.mockResolvedValue({ address: '123 St', city: 'Lima' });
      productsRepo.findById.mockResolvedValue(null);

      await expect(service.create(createDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw if stock insufficient', async () => {
      clientsRepo.findByUserId.mockResolvedValue({ address: '123 St', city: 'Lima' });
      productsRepo.findById.mockResolvedValue({ title: 'Test', stock: 1, price: 100 });

      await expect(service.create(createDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should create order with verified prices from DB', async () => {
      clientsRepo.findByUserId.mockResolvedValue({ address: '123 St', city: 'Lima' });
      productsRepo.findById.mockResolvedValue({ title: 'Test', stock: 10, price: 150 });
      productsRepo.atomicDecrementStock.mockResolvedValue({ stock: 8 });

      const result = await service.create(createDto, mockUser);

      expect(result).toBeDefined();
      expect(ordersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          buyer: 'user1',
          totalOrder: 300,
        }),
      );
    });
  });

  describe('findByIdWithAuth', () => {
    const mockOrder = {
      _id: 'order1',
      buyer: { _id: 'user1', toString: () => 'user1' },
      items: [{ product: { artisan: { _id: 'artisan1', toString: () => 'artisan1' } } }],
    };

    it('should return order for admin', async () => {
      ordersRepo.findById.mockResolvedValue(mockOrder);
      const result = await service.findByIdWithAuth('order1', { userId: 'any', role: 'admin' });
      expect(result).toBe(mockOrder);
    });

    it('should return order for the buyer who owns it', async () => {
      ordersRepo.findById.mockResolvedValue(mockOrder);
      const result = await service.findByIdWithAuth('order1', { userId: 'user1', role: 'buyer' });
      expect(result).toBe(mockOrder);
    });

    it('should throw ForbiddenException for different buyer', async () => {
      ordersRepo.findById.mockResolvedValue(mockOrder);
      await expect(
        service.findByIdWithAuth('order1', { userId: 'other-buyer', role: 'buyer' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return order for artisan who has products in it', async () => {
      ordersRepo.findById.mockResolvedValue(mockOrder);
      const result = await service.findByIdWithAuth('order1', { userId: 'artisan1', role: 'artisan' });
      expect(result).toBe(mockOrder);
    });

    it('should throw ForbiddenException for artisan without products in order', async () => {
      ordersRepo.findById.mockResolvedValue(mockOrder);
      await expect(
        service.findByIdWithAuth('order1', { userId: 'other-artisan', role: 'artisan' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      ordersRepo.findById.mockResolvedValue(null);
      await expect(
        service.findByIdWithAuth('nonexistent', { userId: 'user1', role: 'admin' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('myOrders', () => {
    it('should return orders for the buyer', async () => {
      await service.myOrders(mockUser);
      expect(ordersRepo.findByBuyer).toHaveBeenCalledWith('user1');
    });
  });
});
