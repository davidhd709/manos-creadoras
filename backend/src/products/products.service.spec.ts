import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Review } from './schemas/review.schema';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: any;
  let reviewModel: any;

  const mockProduct = {
    _id: 'prod1',
    title: 'Vasija artesanal',
    description: 'Pieza unica',
    price: 150,
    stock: 5,
    category: 'ceramica',
    artisan: 'artisan1',
    save: jest.fn(),
    deleteOne: jest.fn(),
    toString: () => 'artisan1',
  };

  beforeEach(async () => {
    productModel = {
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockProduct]),
            }),
          }),
        }),
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockProduct]),
          }),
        }),
      }),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: 'new1', ...data })),
    };

    reviewModel = {
      create: jest.fn().mockResolvedValue({ _id: 'rev1', rating: 5, comment: 'Excelente' }),
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
      aggregate: jest.fn().mockResolvedValue([{ _id: 'prod1', avg: 4.5 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: productModel },
        { provide: getModelToken(Review.name), useValue: reviewModel },
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

    it('should filter by category', async () => {
      await service.list({ category: 'ceramica' });
      expect(productModel.find).toHaveBeenCalledWith({ category: 'ceramica' });
    });
  });

  describe('top', () => {
    it('should return top 10 products sorted by soldCount', async () => {
      const result = await service.top();
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create a product with artisan id', async () => {
      const result = await service.create(
        { title: 'Nueva pieza', description: 'Desc', price: 100, stock: 10, category: 'madera' },
        { userId: 'artisan1' },
      );
      expect(result.artisan).toBe('artisan1');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if product does not exist', async () => {
      productModel.findById.mockResolvedValue(null);
      await expect(
        service.update('nonexistent', { title: 'Updated' }, { userId: 'artisan1', role: 'artisan' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      productModel.findById.mockResolvedValue({
        ...mockProduct,
        artisan: { toString: () => 'artisan1' },
      });
      await expect(
        service.update('prod1', { title: 'Updated' }, { userId: 'other_user', role: 'artisan' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('addReview', () => {
    it('should create a review and update rating average', async () => {
      const result = await service.addReview('507f1f77bcf86cd799439011', { userId: 'buyer1' }, 5, 'Excelente');
      expect(result.rating).toBe(5);
      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { ratingAverage: 4.5 });
    });
  });
});
