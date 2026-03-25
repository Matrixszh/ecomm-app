'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: { name: string; revenue: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d0c5af" />
        <XAxis dataKey="name" stroke="#7f7663" />
        <YAxis stroke="#7f7663" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d0c5af', color: '#1c1c18' }}
          itemStyle={{ color: '#1c1c18' }}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#d4af37" 
          strokeWidth={2}
          dot={{ fill: '#ffffff', stroke: '#d4af37', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#d4af37' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
