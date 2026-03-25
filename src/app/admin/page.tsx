'use client';

import { DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';

const RevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-gray-500">Loading chart...</div>
});

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 },
];

const recentOrders = [
  { orderNumber: 'ORD-1042', amount: 3890, timeAgo: '2 hours ago', status: 'Paid' },
  { orderNumber: 'ORD-1039', amount: 1250, timeAgo: '4 hours ago', status: 'Paid' },
  { orderNumber: 'ORD-1031', amount: 4999, timeAgo: 'Yesterday', status: 'Paid' },
  { orderNumber: 'ORD-1028', amount: 2140, timeAgo: '2 days ago', status: 'Paid' },
  { orderNumber: 'ORD-1021', amount: 1650, timeAgo: '3 days ago', status: 'Paid' },
];

export default function AdminDashboard() {
  return (
    <div>
      <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Admin</p>
      <h1 className="mt-4 text-3xl font-playfair text-[#1c1c18] mb-10">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#ffffff] border border-[#d0c5af] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#4d4635] text-sm">Total Revenue</h3>
            <div className="w-10 h-10 bg-[#f6f3ed] border border-[#d0c5af] flex items-center justify-center text-[#2f6f44]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-playfair text-[#1c1c18]">₹1,24,500</p>
          <p className="text-sm text-[#2f6f44] mt-2 flex items-center gap-1">
            <span>+12.5%</span> <span className="text-[#7f7663]">from last month</span>
          </p>
        </div>
        
        <div className="bg-[#ffffff] border border-[#d0c5af] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#4d4635] text-sm">Total Orders</h3>
            <div className="w-10 h-10 bg-[#f6f3ed] border border-[#d0c5af] flex items-center justify-center text-[#1c1c18]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-playfair text-[#1c1c18]">342</p>
          <p className="text-sm text-[#2f6f44] mt-2 flex items-center gap-1">
            <span>+5.2%</span> <span className="text-[#7f7663]">from last month</span>
          </p>
        </div>

        <div className="bg-[#ffffff] border border-[#d0c5af] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#4d4635] text-sm">New Users</h3>
            <div className="w-10 h-10 bg-[#f6f3ed] border border-[#d0c5af] flex items-center justify-center text-[#1c1c18]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-playfair text-[#1c1c18]">1,204</p>
          <p className="text-sm text-[#8f0402] mt-2 flex items-center gap-1">
            <span>-2.1%</span> <span className="text-[#7f7663]">from last month</span>
          </p>
        </div>

        <div className="bg-[#ffffff] border border-[#d0c5af] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#4d4635] text-sm">Low Stock</h3>
            <div className="w-10 h-10 bg-[#f6f3ed] border border-[#d0c5af] flex items-center justify-center text-[#8f0402]">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-playfair text-[#1c1c18]">12</p>
          <p className="text-sm text-[#7f7663] mt-2 flex items-center gap-1">
            Items need restocking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-[#ffffff] border border-[#d0c5af] p-6">
          <h2 className="text-xs tracking-[0.24em] uppercase text-[#4d4635] mb-6">Revenue Overview</h2>
          <div className="h-80 w-full">
            <RevenueChart data={data} />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#ffffff] border border-[#d0c5af] p-6">
          <h2 className="text-xs tracking-[0.24em] uppercase text-[#4d4635] mb-6">Recent Orders</h2>
          <div className="space-y-4">
            {recentOrders.map((o) => (
              <div key={o.orderNumber} className="flex items-center justify-between p-4 bg-[#fcf9f3] border border-[#d0c5af]">
                <div>
                  <p className="font-medium text-[#1c1c18]">{o.orderNumber}</p>
                  <p className="text-xs text-[#7f7663]">{o.timeAgo}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#1c1c18]">₹{o.amount}</p>
                  <span className="text-[11px] tracking-[0.18em] uppercase px-3 py-1 bg-[#ffffff] border border-[#d0c5af] text-[#2f6f44]">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
