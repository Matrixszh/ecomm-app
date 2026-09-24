'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import AppLoader from '@/components/AppLoader';

type VendorOrder = {
  _id: string;
  orderNumber: string;
  orderStatus: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalAmount: number;
  createdAt: string;
  items: { name: string; quantity: number; price: number; vendor?: string | null }[];
  shippingAddress: { name: string; city: string; state: string };
};

const ORDER_STATUS_STYLES: Record<VendorOrder['orderStatus'], string> = {
  placed:     'bg-[var(--luxe-primary-container)]/40 text-[var(--luxe-primary)]',
  confirmed:  'bg-green-50 text-green-700',
  processing: 'bg-[var(--luxe-gold)]/10 text-[var(--luxe-secondary)]',
  shipped:    'bg-[var(--luxe-primary-container)]/60 text-[var(--luxe-primary)]',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-[var(--luxe-error)]/5 text-[var(--luxe-error)]',
  returned:   'bg-[var(--luxe-surface)] text-[var(--luxe-text-muted)]',
};

const PAYMENT_STATUS_STYLES: Record<VendorOrder['paymentStatus'], string> = {
  pending:  'bg-[var(--luxe-gold)]/10 text-[var(--luxe-secondary)]',
  paid:     'bg-green-50 text-green-700',
  failed:   'bg-[var(--luxe-error)]/5 text-[var(--luxe-error)]',
  refunded: 'bg-[var(--luxe-surface)] text-[var(--luxe-text-muted)]',
};

export default function VendorOrdersPage() {
  const { firebaseUser } = useAuthStore();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    fetchWithAuth('/api/vendor/orders')
      .then((data) => setOrders(data.orders))
      .catch((err) => console.error('Error fetching orders:', err))
      .finally(() => setLoading(false));
  }, [firebaseUser]);


  const updateStatus = async (orderId: string, status: VendorOrder['orderStatus']) => {
    await fetchWithAuth('/api/vendor/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    });
    // Refresh orders after update
    setLoading(true);
    fetchWithAuth('/api/vendor/orders')
      .then((data) => setOrders(data.orders))
      .catch((err) => console.error('Error fetching orders:', err))
      .finally(() => setLoading(false));
  }


  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <AppLoader label="Loading orders" />
    </div>
  );

  return (
    <div className="space-y-6 bg-[var(--luxe-background)] text-[var(--luxe-text)]">
      <div>
        <p className="text-xs tracking-[0.28em] uppercase text-[var(--luxe-text-muted)]">Vendor</p>
        <h1 className="mt-1 text-2xl font-display font-normal text-[var(--luxe-primary)]">Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-[var(--luxe-outline-light)] bg-[var(--luxe-white)] p-12 text-center">
          <p className="text-sm text-[var(--luxe-text-muted)] tracking-[0.18em] uppercase">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const myItems = order.items.filter((item) => item.vendor != null);
            const myTotal = myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return (
              <div key={order._id} className="rounded-lg border border-[var(--luxe-outline-light)] bg-[var(--luxe-white)] p-6">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.24em] uppercase text-[var(--luxe-text-muted)]">Order</p>
                    <p className="mt-1 font-mono text-sm text-[var(--luxe-text)]">{order.orderNumber}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* update status */}
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order._id, e.target.value as VendorOrder['orderStatus'])}
                      className="text-xs tracking-[0.16em] uppercase px-2 py-1 rounded border border-[var(--luxe-outline)] bg-[var(--luxe-surface)] text-[var(--luxe-text)] focus:outline-[var(--luxe-primary)]"
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option>
                    </select>

                    <span className={`text-xs tracking-[0.16em] uppercase px-2 py-1 ${ORDER_STATUS_STYLES[order.orderStatus]}`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                    <span className={`text-xs tracking-[0.16em] uppercase px-2 py-1 ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 border-t border-[var(--luxe-outline-light)] pt-4 space-y-2">
                  {myItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-[var(--luxe-text-muted)]">{item.quantity} × {item.name}</span>
                      <span className="text-[var(--luxe-text)]">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 border-t border-[var(--luxe-outline-light)] pt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div className="text-[var(--luxe-text-muted)]">
                    {order.shippingAddress.name} · {order.shippingAddress.city}, {order.shippingAddress.state}
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-[var(--luxe-text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="font-semibold text-[var(--luxe-text)]">₹{myTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
