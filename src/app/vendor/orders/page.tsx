'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

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
  placed:     'bg-blue-50 text-blue-700',
  confirmed:  'bg-green-50 text-green-700',
  processing: 'bg-yellow-50 text-yellow-700',
  shipped:    'bg-purple-50 text-purple-700',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-50 text-red-600',
  returned:   'bg-gray-100 text-gray-600',
};

const PAYMENT_STATUS_STYLES: Record<VendorOrder['paymentStatus'], string> = {
  pending:  'bg-yellow-50 text-yellow-700',
  paid:     'bg-green-50 text-green-700',
  failed:   'bg-red-50 text-red-600',
  refunded: 'bg-gray-100 text-gray-600',
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

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <p className="text-sm text-[#7f7663] tracking-[0.18em] uppercase">Loading...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Vendor</p>
        <h1 className="mt-1 text-2xl font-playfair text-[#1c1c18]">Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="border border-[#d0c5af] bg-white p-12 text-center">
          <p className="text-sm text-[#7f7663] tracking-[0.18em] uppercase">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const myItems = order.items.filter((item) => item.vendor != null);
            const myTotal = myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return (
              <div key={order._id} className="border border-[#d0c5af] bg-white p-6">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.24em] uppercase text-[#7f7663]">Order</p>
                    <p className="mt-1 font-mono text-sm text-[#1c1c18]">{order.orderNumber}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs tracking-[0.16em] uppercase px-2 py-1 ${ORDER_STATUS_STYLES[order.orderStatus]}`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                    <span className={`text-xs tracking-[0.16em] uppercase px-2 py-1 ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 border-t border-[#d0c5af] pt-4 space-y-2">
                  {myItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-[#4d4635]">{item.quantity} × {item.name}</span>
                      <span className="text-[#1c1c18]">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 border-t border-[#d0c5af] pt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div className="text-[#7f7663]">
                    {order.shippingAddress.name} · {order.shippingAddress.city}, {order.shippingAddress.state}
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs text-[#7f7663]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="font-semibold text-[#1c1c18]">₹{myTotal.toFixed(2)}</span>
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
