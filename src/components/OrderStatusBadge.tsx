import React from 'react';

interface OrderStatusBadgeProps {
  status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
    placed: { bg: 'bg-[#fcf9f3]', text: 'text-[#4d4635]', border: 'border-[#d0c5af]', label: 'Placed' },
    confirmed: { bg: 'bg-[#fcf9f3]', text: 'text-[#1c1c18]', border: 'border-[#d4af37]', label: 'Confirmed' },
    processing: { bg: 'bg-[#fcf9f3]', text: 'text-[#735c00]', border: 'border-[#d4af37]', label: 'Processing' },
    shipped: { bg: 'bg-[#fcf9f3]', text: 'text-[#1c1c18]', border: 'border-[#d0c5af]', label: 'Shipped' },
    delivered: { bg: 'bg-[#fcf9f3]', text: 'text-[#2f6f44]', border: 'border-[#d0c5af]', label: 'Delivered' },
    cancelled: { bg: 'bg-[#fcf9f3]', text: 'text-[#8f0402]', border: 'border-[#d0c5af]', label: 'Cancelled' },
    returned: { bg: 'bg-[#fcf9f3]', text: 'text-[#4d4635]', border: 'border-[#d0c5af]', label: 'Returned' },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.placed;

  return (
    <span className={`px-3 py-1 text-[11px] tracking-[0.18em] uppercase ${config.bg} ${config.text} border ${config.border}`}>
      {config.label}
    </span>
  );
}
