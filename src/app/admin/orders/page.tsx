'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import AppLoader from '@/components/AppLoader';

type OrderUser = { email: string; name: string };

type OrderRow = {
  _id: string;
  orderNumber: string;
  user: OrderUser;
  orderStatus: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalAmount: number;
  createdAt: string;
};

const ORDER_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'] as const;

const STATUS_STYLES: Record<string, string> = {
  placed:     'text-(--luxe-primary) border-(--luxe-primary)',
  confirmed:  'text-(--luxe-secondary) border-(--luxe-secondary)',
  processing: 'text-(--luxe-secondary) border-(--luxe-secondary)',
  shipped:    'text-(--luxe-text-muted) border-(--luxe-text-muted)',
  delivered:  'text-(--luxe-primary) border-(--luxe-primary)',
  cancelled:  'text-(--luxe-error) border-(--luxe-error)',
  returned:   'text-(--luxe-text-muted) border-(--luxe-text-muted)',
};

const PAYMENT_STYLES: Record<string, string> = {
  pending:  'text-(--luxe-secondary)',
  paid:     'text-(--luxe-primary)',
  failed:   'text-(--luxe-error)',
  refunded: 'text-(--luxe-text-muted)',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { firebaseUser } = useAuthStore();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = await firebaseUser?.getIdToken();
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, page, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchOrders, 300);
    return () => clearTimeout(t);
  }, [fetchOrders]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);


  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await fetchWithAuth(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase text-(--luxe-text-muted)">Admin</p>
          <h1 className="mt-4 text-3xl font-display text-(--luxe-text)">Orders</h1>
        </div>
      </div>

      <div className="bg-(--luxe-white) border border-(--luxe-outline-light) overflow-hidden">
        <div className="p-4 border-b border-(--luxe-outline-light) flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--luxe-text-muted)" />
            <input
              type="text"
              placeholder="Search by order number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-b border-(--luxe-outline-light) py-3 pl-10 pr-4 text-sm text-(--luxe-text) placeholder:text-(--luxe-text-muted) focus:outline-none focus:border-(--luxe-primary)"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-b border-(--luxe-outline-light) py-3 px-2 text-sm text-(--luxe-text) focus:outline-none focus:border-(--luxe-primary) capitalize"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-(--luxe-background) text-(--luxe-text-muted) text-xs tracking-[0.24em] uppercase border-b border-(--luxe-outline-light)">
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--luxe-outline-light) text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-(--luxe-text-muted)">
                    <div className="flex justify-center">
                      <AppLoader label="Loading orders" />
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-(--luxe-text-muted)">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-(--luxe-surface) transition-colors">
                    <td className="p-4 font-mono text-xs text-(--luxe-text-muted)">{order.orderNumber}</td>
                    <td className="p-4">
                      <div className="text-(--luxe-text) font-medium">{order.user?.name || '—'}</div>
                      <div className="text-(--luxe-text-muted) text-xs">{order.user?.email}</div>
                    </td>
                    <td className="p-4 text-(--luxe-text-muted) text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-(--luxe-text) font-medium">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-xs tracking-[0.18em] uppercase ${PAYMENT_STYLES[order.paymentStatus]}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className={`bg-transparent border px-2 py-1 text-[11px] tracking-[0.18em] uppercase focus:outline-none focus:border-(--luxe-primary) disabled:opacity-50 ${STATUS_STYLES[order.orderStatus]}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s} className="capitalize text-(--luxe-text)">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-(--luxe-outline-light) flex items-center justify-between text-sm text-(--luxe-text-muted)">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-(--luxe-surface) disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 hover:bg-(--luxe-surface) disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
