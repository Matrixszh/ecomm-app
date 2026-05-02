'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { auth } from '@/lib/firebase';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import ProductCard from '@/components/vendor/ProductCard';
import type { ProductSummary } from '@/types';

export default function VendorProductsPage() {
  const { firebaseUser } = useAuthStore();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    fetchWithAuth('/api/vendor/products')
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const handleDelete = async (id: string) => {
    const token = await auth.currentUser?.getIdToken();
    await fetch(`/api/vendor/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  if (loading) return <p className="text-sm text-[#7f7663] p-8">Loading...</p>;
  if (error) return <p className="text-sm text-red-500 p-8">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#1c1c18]">Products</h1>
      {products.length === 0 ? (
        <p className="text-sm text-[#7f7663]">No products yet.</p>
      ) : (
        products.map((product) => (
          <ProductCard key={product._id} product={product} onDelete={handleDelete} />
        ))
      )}
    </div>
  );
}
