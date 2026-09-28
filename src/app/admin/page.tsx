'use client';

import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import AppLoader from '@/components/AppLoader';

const RevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center"><AppLoader label="Loading chart" /></div>
});

type DashboardData = {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    newUsers: number;
    previousMonthUsers: number;
    lowStockProducts: number;
  };
  revenueByMonth: { name: string; revenue: number }[];
  recentOrders: {
    orderNumber: string;
    amount: number;
    status: string;
    createdAt: string | null;
  }[];
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatTimeAgo = (dateString: string | null) => {
  if (!dateString) return 'Date unavailable';

  const timestamp = new Date(dateString).getTime();
  if (Number.isNaN(timestamp)) return 'Date unavailable';

  const minutesAgo = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutesAgo < 1) return 'Just now';
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  if (minutesAgo < 1_440) return `${Math.floor(minutesAgo / 60)}h ago`;
  if (minutesAgo < 43_200) return `${Math.floor(minutesAgo / 1_440)}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

const formatUserChange = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 'No new accounts this month' : 'No new accounts last month';
  const percentage = Math.round(((current - previous) / previous) * 1000) / 10;
  return `${percentage > 0 ? '+' : ''}${percentage}% from last month`;
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(typeof result.error === 'string' ? result.error : 'Unable to load dashboard data.');
        }
        if (active) setDashboard(result as DashboardData);
      } catch (err: unknown) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load dashboard data.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <p className="text-xs tracking-[0.28em] uppercase text-(--luxe-text-muted)">Admin</p>
      <h1 className="mt-4 text-3xl font-display text-(--luxe-text) mb-10">Dashboard</h1>
      {error && <p role="alert" className="mb-6 border border-(--luxe-error) bg-(--luxe-error-container) px-4 py-3 text-sm text-(--luxe-error)">{error}</p>}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-(--luxe-white) border border-(--luxe-outline-light) p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-(--luxe-text-muted) text-sm">Total Revenue</h3>
            <div className="w-10 h-10 bg-(--luxe-surface) border border-(--luxe-outline-light) flex items-center justify-center text-(--luxe-primary)">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-display text-(--luxe-text)">{loading ? 'Loading…' : dashboard ? formatCurrency(dashboard.stats.totalRevenue) : '—'}</p>
          <p className="text-sm text-(--luxe-text-muted) mt-2">Revenue from paid orders</p>
        </div>
        
        <div className="bg-(--luxe-white) border border-(--luxe-outline-light) p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-(--luxe-text-muted) text-sm">Total Orders</h3>
            <div className="w-10 h-10 bg-(--luxe-surface) border border-(--luxe-outline-light) flex items-center justify-center text-(--luxe-text)">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-display text-(--luxe-text)">{loading ? 'Loading…' : dashboard ? dashboard.stats.totalOrders.toLocaleString('en-IN') : '—'}</p>
          <p className="text-sm text-(--luxe-text-muted) mt-2">All recorded orders</p>
        </div>

        <div className="bg-(--luxe-white) border border-(--luxe-outline-light) p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-(--luxe-text-muted) text-sm">New Users</h3>
            <div className="w-10 h-10 bg-(--luxe-surface) border border-(--luxe-outline-light) flex items-center justify-center text-(--luxe-text)">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-display text-(--luxe-text)">{loading ? 'Loading…' : dashboard ? dashboard.stats.newUsers.toLocaleString('en-IN') : '—'}</p>
          <p className="text-sm text-(--luxe-text-muted) mt-2">{dashboard ? formatUserChange(dashboard.stats.newUsers, dashboard.stats.previousMonthUsers) : 'New customer accounts this month'}</p>
        </div>

        <div className="bg-(--luxe-white) border border-(--luxe-outline-light) p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-(--luxe-text-muted) text-sm">Low Stock</h3>
            <div className="w-10 h-10 bg-(--luxe-surface) border border-(--luxe-outline-light) flex items-center justify-center text-(--luxe-error)">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-display text-(--luxe-text)">{loading ? 'Loading…' : dashboard ? dashboard.stats.lowStockProducts.toLocaleString('en-IN') : '—'}</p>
          <p className="text-sm text-(--luxe-text-muted) mt-2">Active products with 1–5 units</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-(--luxe-white) border border-(--luxe-outline-light) p-6">
          <h2 className="text-xs tracking-[0.24em] uppercase text-(--luxe-text-muted) mb-6">Revenue Overview · Last 13 Months</h2>
          <div className="h-80 w-full">
            {loading ? (
              <div className="flex h-full items-center justify-center"><AppLoader label="Loading dashboard data" /></div>
            ) : dashboard ? (
              <RevenueChart data={dashboard.revenueByMonth} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-(--luxe-text-muted)">Revenue data is unavailable.</div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-(--luxe-white) border border-(--luxe-outline-light) p-6">
          <h2 className="text-xs tracking-[0.24em] uppercase text-(--luxe-text-muted) mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {dashboard?.recentOrders.map((o) => (
              <div key={o.orderNumber} className="flex items-center justify-between p-4 bg-(--luxe-background) border border-(--luxe-outline-light)">
                <div>
                  <p className="font-medium text-(--luxe-text)">{o.orderNumber}</p>
                  <p className="text-xs text-(--luxe-text-muted)">{formatTimeAgo(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-(--luxe-text)">{formatCurrency(o.amount)}</p>
                  <span className="text-[11px] tracking-[0.18em] uppercase px-3 py-1 bg-(--luxe-white) border border-(--luxe-outline-light) text-(--luxe-primary)">{o.status}</span>
                </div>
              </div>
            ))}
            {!loading && dashboard?.recentOrders.length === 0 && (
              <p className="py-6 text-center text-sm text-(--luxe-text-muted)">No orders have been placed yet.</p>
            )}
            {!loading && !dashboard && !error && (
              <p className="py-6 text-center text-sm text-(--luxe-text-muted)">Recent orders are unavailable.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
