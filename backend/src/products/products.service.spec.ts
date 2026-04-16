import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { OrdersRepository } from '../orders/orders.repository';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepo: Record<string, jest.Mock>;
  let ordersRepo: Record<string, jest.Mock>;

  const mockProduct = {
    _id: 'prod1',
    title: 'Vasija artesanal',
    price: 150,
    stock: 5,
    category: 'ceramica',
    artisan: { _id: 'artisan1', toString: () => 'artisan1' },
  };

  beforeEach(async () => {
    productsRepo = {
      findPaginated: jest.fn().mockResolvedValue({ data: [mockProduct], total: 1 }),
      findTop: jest.fn().mockResolvedValue([mockProduct]),
      findById: jest.fn(),
      create: jest.fn().mockImplementation((data) => ({ _id: 'new1', ...data })),
      update: jest.fn().mockResolvedValue(mockProduct),
      delete: jest.fn(),
      findByArtisan: jest.fn().mockResolvedValue([mockProduct]),
      findLowStock: jest.fn().mockResolvedValue([]),
      findOutOfStock: jest.fn().mockResolvedValue([]),
      createReview: jest.fn().mockResolvedValue({ _id: 'rev1', rating: 5 }),
      calculateAverageRating: jest.fn().mockResolvedValue(4.5),
      updateRating: jest.fn(),
      hasUserReviewed: jest.fn().mockResolvedValue(false),
      findReviewsByProduct: jest.fn().mockResolvedValue([]),
    };

    ordersRepo = {
      findActiveByProduct: jest.fn().mockResolvedValue([]),
      hasBuyerPurchasedProduct: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: productsRepo },
        { provide: OrdersRepository, useValue: ordersRepo },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('list', () => {
    it('should return paginated products', async () => {
      const result = await service.list({ page: '1', limit: '12' });
      expect(result.data).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should escape regex special characters in search', async () => {
      await service.list({ search: 'test.*+?' });
      expect(productsRepo.findPaginated).toHaveBeenCalledWith(
        expect.objectContaining({ title: { $regex: 'test\\.\\*\\+\\?', $options: 'i' } }),
        1, 12,
      );
    });
  });

  describe('findOne', () => {
    it('should return product if found', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct);
      const result = await service.findOne('prod1');
      expect(result).toBe(mockProduct);
    });

    it('should throw NotFoundException if not found', async () => {
      productsRepo.findById.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a product with artisan id', async () => {
      const result = await service.create(
        { title: 'Nueva', description: 'Desc', price: 100, stock: 10, category: 'madera' } as any,
        { userId: 'artisan1' },
      );
      expect(result.artisan).toBe('artisan1');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if product does not exist', async () => {
      productsRepo.findById.mockResolvedValue(null);
      await expect(
        service.update('x', { title: 'Updated' } as any, { userId: 'artisan1', role: 'artisan' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if artisan is not the owner', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct);
      await expect(
        service.update('prod1', { title: 'Updated' } as any, { userId: 'other', role: 'artisan' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to update any product', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct);
      await service.update('prod1', { title: 'Updated' } as any, { userId: 'admin1', role: 'admin' });
      expect(productsRepo.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should throw BadRequestException if product has active orders', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct);
      ordersRepo.findActiveByProduct.mockResolvedValue([{ _id: 'o1' }]);

      await expect(
        service.remove('prod1', { userId: 'artisan1', role: 'artisan' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should delete product if no active orders', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct);
      ordersRepo.findActiveByProduct.mockResolvedValue([]);

      const result = await service.remove('prod1', { userId: 'artisan1', role: 'artisan' });
      expect(result.message).toBe('Producto eliminado correctamente');
      expect(productsRepo.delete).toHaveBeenCalledWith('prod1');
    });
  });

  describe('addReview', () => {
    it('should throw if buyer has not purchased the product', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct);
      ordersRepo.hasBuyerPurchasedProduct.mockResolvedValue(false);

      await expect(
        service.addReview('prod1', { userId: 'buyer1' }, 5, 'Great'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if already reviewed', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct);
      ordersRepo.hasBuyerPurchasedProduct.mockResolvedValue(true);
      productsRepo.hasUserReviewed.mockResolvedValue(true);

      await expect(
        service.addReview('prod1', { userId: 'buyer1' }, 5, 'Great'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create review and update rating', async () => {
      productsRepo.findById.mockResolvedValue(mockProduct);
      const result = await service.addReview('prod1', { userId: 'buyer1' }, 5, 'Great');
      expect(result.rating).toBe(5);
      expect(productsRepo.updateRating).toHaveBeenCalledWith('prod1', 4.5);
    });
  });
});
