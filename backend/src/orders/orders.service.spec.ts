import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from './schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderModel: any;
  let productModel: any;

  const mockProduct = {
    _id: 'prod1',
    title: 'Vasija de barro',
    stock: 10,
    price: 100,
  };

  const mockUser = { userId: 'user1', role: 'buyer' };

  beforeEach(async () => {
    productModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    orderModel = {
      create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: 'order1', ...data })),
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: getModelToken(Product.name), useValue: productModel },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('create', () => {
    const createDto = {
      items: [{ product: 'prod1', quantity: 2, unitPrice: 100, totalItem: 200 }],
      totalOrder: 200,
    };

    it('should create an order when stock is sufficient', async () => {
      productModel.findById.mockResolvedValue({ ...mockProduct, stock: 10 });
      productModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await service.create(createDto, mockUser);

      expect(result).toBeDefined();
      expect(result._id).toBe('order1');
      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith('prod1', {
        $inc: { stock: -2, soldCount: 2 },
      });
    });

    it('should throw BadRequestException when product not found', async () => {
      productModel.findById.mockResolvedValue(null);

      await expect(service.create(createDto, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when stock is insufficient', async () => {
      productModel.findById.mockResolvedValue({ ...mockProduct, stock: 1 });

      await expect(service.create(createDto, mockUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('myOrders', () => {
    it('should return orders for the buyer', async () => {
      const result = await service.myOrders(mockUser);
      expect(orderModel.find).toHaveBeenCalledWith({ buyer: 'user1' });
      expect(result).toEqual([]);
    });
  });
});
