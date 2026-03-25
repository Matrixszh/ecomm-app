'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import type { ProductSummary } from '@/types';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'Unknown';
  const [recommended, setRecommended] = useState<ProductSummary[]>([]);

  useEffect(() => {
    async function fetchRecommended() {
      try {
        const res = await fetch('/api/products?featured=true&limit=6');
        const data = await res.json();
        setRecommended(data.products || []);
      } catch {
        setRecommended([]);
      }
    }
    fetchRecommended();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col min-h-[60vh]">
      <div className="text-center">
        <div className="text-base font-playfair tracking-[0.28em] uppercase text-[#1c1c18]">Maison</div>

        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mt-10 inline-flex items-center justify-center w-16 h-16 border border-[#d0c5af] bg-[#ffffff]"
        >
          <Check className="w-8 h-8 text-[#d4af37]" />
        </motion.div>

        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-10 text-4xl font-playfair text-[#1c1c18]"
        >
          Your Order is Confirmed
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="mt-4 text-sm text-[#4d4635]"
        >
          Order <span className="font-medium text-[#1c1c18]">{orderId}</span>. A confirmation email has been sent.
        </motion.p>

        <div className="mt-10 border border-[#d0c5af] bg-[#f6f3ed] px-6 py-5 inline-block">
          <p className="text-xs tracking-[0.24em] uppercase text-[#4d4635]">Estimated Delivery</p>
          <p className="mt-2 text-sm text-[#1c1c18]">3–5 business days</p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account/orders"
            className="bg-[#d4af37] text-[#1c1c18] px-10 py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/shop"
            className="border border-[#d0c5af] text-[#1c1c18] px-10 py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#f6f3ed] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {recommended.length > 0 ? (
        <div className="mt-16">
          <h2 className="text-xl font-playfair text-[#1c1c18]">You May Also Like</h2>
          <div className="mt-8 flex gap-6 overflow-x-auto pb-2">
            {recommended.map((p) => (
              <div key={p._id} className="min-w-[260px] max-w-[260px]">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-[60vh]"><div className="animate-spin h-10 w-10 border-2 border-[#d0c5af] border-t-[#d4af37]"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
