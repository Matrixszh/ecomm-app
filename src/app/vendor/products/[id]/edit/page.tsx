'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import VendorProductForm from '@/components/vendor/VendorProductForm';
import type { ProductDetail } from '@/types';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { firebaseUser } = useAuthStore();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    fetchWithAuth(`/api/vendor/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [firebaseUser, id]);

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <p className="text-sm text-[#7f7663] tracking-[0.18em] uppercase">Loading...</p>
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <p className="text-sm text-red-500">Product not found.</p>
    </div>
  );

  return <VendorProductForm initialData={product} />;
}
