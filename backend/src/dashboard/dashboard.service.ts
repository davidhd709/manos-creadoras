import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../orders/orders.repository';
import { ProductsRepository } from '../products/products.repository';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async getAdminDashboard() {
    const [
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      totalArtisans,
      totalBuyers,
      pendingOrders,
      recentOrders,
      topProducts,
      monthlySales,
      lowStockProducts,
      outOfStockProducts,
    ] = await Promise.all([
      this.ordersRepository.calculateTotalRevenue(),
      this.ordersRepository.count(),
      this.productsRepository.count(),
      this.usersRepository.count(),
      this.usersRepository.countByRole('artisan'),
      this.usersRepository.countByRole('buyer'),
      this.ordersRepository.countByStatus('pendiente'),
      this.ordersRepository.getRecentOrders(5),
      this.productsRepository.findTop(5),
      this.ordersRepository.getMonthlySales(),
      this.productsRepository.findLowStock(5),
      this.productsRepository.findOutOfStock(),
    ]);

    return {
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        totalArtisans,
        totalBuyers,
        pendingOrders,
      },
      recentOrders,
      topProducts,
      monthlySales,
      inventory: {
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
        alerts: lowStockProducts,
      },
    };
  }

  async getArtisanDashboard(artisanId: string) {
    const [
      products,
      totalProducts,
      artisanRevenue,
      artisanOrders,
      lowStockProducts,
      monthlySales,
      revenueByProduct,
    ] = await Promise.all([
      this.productsRepository.findByArtisan(artisanId),
      this.productsRepository.countByArtisan(artisanId),
      this.ordersRepository.calculateRevenueByArtisan(artisanId),
      this.ordersRepository.findByArtisan(artisanId),
      this.productsRepository.findLowStock(5),
      this.ordersRepository.getMonthlySalesByArtisan(artisanId),
      this.ordersRepository.getRevenueByProductForArtisan(artisanId),
    ]);

    const totalSold = products.reduce((sum, p) => sum + (p.soldCount || 0), 0);
    const myLowStock = lowStockProducts.filter(
      (p) => p.artisan?.toString() === artisanId,
    );

    // Inventario detallado por producto
    const inventorySummary = products.map((p) => ({
      _id: p._id,
      title: p.title,
      stock: p.stock,
      soldCount: p.soldCount || 0,
      price: p.price,
      isPromotion: p.isPromotion,
      promotionPrice: p.promotionPrice,
      category: p.category,
    }));

    return {
      stats: {
        totalProducts,
        totalSold,
        totalRevenue: artisanRevenue,
        lowStockAlerts: myLowStock.length,
        totalOrders: artisanOrders.length,
      },
      topProducts: products.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 5),
      recentOrders: artisanOrders.slice(0, 10),
      monthlySales,
      revenueByProduct,
      inventorySummary,
      inventory: {
        lowStock: myLowStock,
      },
    };
  }

  async getBuyerDashboard(buyerId: string) {
    const orders = await this.ordersRepository.findByBuyer(buyerId);

    const totalSpent = orders.reduce((sum, o) => sum + o.totalOrder, 0);
    const pendingOrders = orders.filter((o) => o.status === 'pendiente').length;

    return {
      stats: {
        totalOrders: orders.length,
        totalSpent,
        pendingOrders,
      },
      recentOrders: orders.slice(0, 5),
    };
  }
}
