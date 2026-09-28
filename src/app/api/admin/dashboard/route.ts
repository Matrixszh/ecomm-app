import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/authMiddleware';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { User } from '@/models/User';

export const GET = requireAdmin(async () => {
  try {
    await connectDB();

    const now = new Date();
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const previousMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const chartStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12, 1));

    const monthBuckets = Array.from({ length: 13 }, (_, index) => {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 12 + index, 1));
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      return {
        key,
        name: date.toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }),
      };
    });

    const [revenueResult, totalOrders, newUsers, previousMonthUsers, lowStockProducts, monthlyRevenue, recentOrders] =
      await Promise.all([
        Order.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$totalAmount', 0] } } } },
        ]),
        Order.countDocuments({}),
        User.countDocuments({ role: 'user', createdAt: { $gte: currentMonthStart, $lt: nextMonthStart } }),
        User.countDocuments({ role: 'user', createdAt: { $gte: previousMonthStart, $lt: currentMonthStart } }),
        Product.countDocuments({ isActive: true, stock: { $gt: 0, $lte: 5 } }),
        Order.aggregate([
          {
            $match: {
              paymentStatus: 'paid',
              createdAt: { $gte: chartStart, $lt: nextMonthStart },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'UTC' },
              },
              revenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
            },
          },
        ]),
        Order.find()
          .select('orderNumber totalAmount orderStatus createdAt')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

    const monthlyRevenueByKey = new Map<string, number>(
      monthlyRevenue.map((item: { _id: string; revenue: number }) => [item._id, item.revenue])
    );

    return NextResponse.json({
      stats: {
        totalRevenue: revenueResult[0]?.total ?? 0,
        totalOrders,
        newUsers,
        previousMonthUsers,
        lowStockProducts,
      },
      revenueByMonth: monthBuckets.map(({ key, name }) => ({
        name,
        revenue: monthlyRevenueByKey.get(key) ?? 0,
      })),
      recentOrders: recentOrders.map((order) => ({
        orderNumber: order.orderNumber,
        amount: order.totalAmount ?? 0,
        status: order.orderStatus,
        createdAt: order.createdAt?.toISOString() ?? null,
      })),
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (error) {
    console.error('Admin dashboard GET error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
  }
});
