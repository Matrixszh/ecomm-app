'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { auth } from '@/lib/firebase';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import ProductCard from '@/components/vendor/ProductCard';
import type { ProductSummary } from '@/types';
import { useRouter } from 'next/navigation';
import AppLoader from '@/components/AppLoader';

export default function VendorProductsPage() {
  const { firebaseUser } = useAuthStore();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();





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


const handleProductClick = (id: string) => {
    router.push(`/vendor/products/${id}`);
  }
  

  if (loading) return <div className="min-h-[400px] flex items-center justify-center"><AppLoader label="Loading products" /></div>;
  if (error) return <p className="text-sm text-[var(--luxe-error)] p-8">{error}</p>;

  return (
    <div className="space-y-4 bg-[var(--luxe-background)] text-[var(--luxe-text)]">
      <h1 className="text-2xl font-medium text-[var(--luxe-text)] font-display">Products</h1>
      {products.length === 0 ? (
        <p className="text-sm text-[var(--luxe-text-muted)]">No products yet.</p>
      ) : (
        products.map((product) => (
          <ProductCard key={product._id} product={product} onDelete={handleDelete} onClick={() => handleProductClick(product._id)}/>
        ))
      )}
    </div>
  );
}
