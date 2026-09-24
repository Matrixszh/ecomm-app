'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { auth } from '@/lib/firebase';
import { useVendorStore } from '@/store/vendorStore';
import ProductCard from '@/components/vendor/ProductCard';
import AppLoader from '@/components/AppLoader';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  images: { url: string; alt?: string }[];
}

async function fetchWithAuth(url: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

export default function VendorDashboard() {
  const { mongoUser, firebaseUser } = useAuthStore();
  const router = useRouter();
  const { vendorProfile,fetchVendorEarnings } = useVendorStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser && !mongoUser) return;
    if (mongoUser && mongoUser.role !== 'vendor') {
      router.push('/');
      return;
    }
  }, [firebaseUser, mongoUser, router]);

  useEffect(() => {
    if (!firebaseUser) return;
    fetchWithAuth('/api/vendor/products')
      .then((data) => setProducts(data.products))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  }, [firebaseUser]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
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

  useEffect(() => {
    if (!firebaseUser) return;
    fetchVendorEarnings().catch((err) =>
      console.error('Failed to fetch earnings:', err)
    );
  }, [firebaseUser, fetchVendorEarnings]);


  if (loading) return <div className="min-h-screen flex items-center justify-center"><AppLoader label="Loading dashboard" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-[var(--luxe-error)]">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 bg-[var(--luxe-background)] text-[var(--luxe-text)]">
      {/* Store header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[var(--luxe-text)] font-display">{vendorProfile?.storeName}</h1>
          <p className="text-sm text-[var(--luxe-text-muted)]">/{vendorProfile?.storeSlug}</p>
        </div>
        <Link
          href="/vendor/products/new"
          className="inline-block rounded-md bg-[var(--luxe-text)] text-[var(--luxe-white)] py-3 px-6 text-xs tracking-[0.24em] uppercase hover:bg-[var(--luxe-cta-hover)] transition-colors"
        >
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Products', value: products.length },
          { label: 'Total Earnings', value: `$${(vendorProfile?.totalEarnings ?? 0).toFixed(2)}` },
          { label: 'Pending Payout', value: `$${(vendorProfile?.pendingPayout ?? 0).toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[var(--luxe-white)] border border-[var(--luxe-outline-light)] rounded-lg p-5">
            <p className="text-sm text-[var(--luxe-text-muted)]">{label}</p>
            <p className="text-2xl font-semibold text-[var(--luxe-text)] mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Products list */}
      <div>
        <h2 className="text-lg font-medium text-[var(--luxe-text)] mb-4 font-display">Your Products</h2>
        {products.length === 0 ? (
          <p className="text-[var(--luxe-text-muted)] text-sm">No products yet. Add your first one.</p>
        ) : (

          products.map((product) => (
        
          
            <ProductCard key={product._id} product={{...product, slug: product.name.toLowerCase().replace(/\s+/g, '-'), avgRating: 0} as any} onDelete={handleDelete}  onClick={()=>{
              handleProductClick(product._id);
            }}/>
          ))

       
        )}
      </div>
    </div>
  );
}
