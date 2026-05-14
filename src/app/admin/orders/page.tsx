'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

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
  placed:     'text-[#1a4a8a] border-[#1a4a8a]',
  confirmed:  'text-[#735c00] border-[#735c00]',
  processing: 'text-[#735c00] border-[#735c00]',
  shipped:    'text-[#4d4635] border-[#4d4635]',
  delivered:  'text-[#2f6f44] border-[#2f6f44]',
  cancelled:  'text-[#8f0402] border-[#8f0402]',
  returned:   'text-[#7f7663] border-[#7f7663]',
};

const PAYMENT_STYLES: Record<string, string> = {
  pending:  'text-[#735c00]',
  paid:     'text-[#2f6f44]',
  failed:   'text-[#8f0402]',
  refunded: 'text-[#7f7663]',
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
          <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Admin</p>
          <h1 className="mt-4 text-3xl font-playfair text-[#1c1c18]">Orders</h1>
        </div>
      </div>

      <div className="bg-[#ffffff] border border-[#d0c5af] overflow-hidden">
        <div className="p-4 border-b border-[#d0c5af] flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7f7663]" />
            <input
              type="text"
              placeholder="Search by order number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-b border-[#d0c5af] py-3 pl-10 pr-4 text-sm text-[#1c1c18] placeholder:text-[#7f7663] focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-b border-[#d0c5af] py-3 px-2 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37] capitalize"
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
              <tr className="bg-[#fcf9f3] text-[#7f7663] text-xs tracking-[0.24em] uppercase border-b border-[#d0c5af]">
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0c5af] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#7f7663]">
                    <div className="flex justify-center">
                      <div className="animate-spin h-8 w-8 border-2 border-[#d0c5af] border-t-[#d4af37]" />
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#7f7663]">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#f6f3ed] transition-colors">
                    <td className="p-4 font-mono text-xs text-[#4d4635]">{order.orderNumber}</td>
                    <td className="p-4">
                      <div className="text-[#1c1c18] font-medium">{order.user?.name || '—'}</div>
                      <div className="text-[#7f7663] text-xs">{order.user?.email}</div>
                    </td>
                    <td className="p-4 text-[#7f7663] text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-[#1c1c18] font-medium">₹{order.totalAmount.toLocaleString()}</td>
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
                        className={`bg-transparent border px-2 py-1 text-[11px] tracking-[0.18em] uppercase focus:outline-none focus:border-[#d4af37] disabled:opacity-50 ${STATUS_STYLES[order.orderStatus]}`}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s} className="capitalize text-[#1c1c18]">{s}</option>
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
          <div className="p-4 border-t border-[#d0c5af] flex items-center justify-between text-sm text-[#7f7663]">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 hover:bg-[#f6f3ed] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 hover:bg-[#f6f3ed] disabled:opacity-30 transition-colors"
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
