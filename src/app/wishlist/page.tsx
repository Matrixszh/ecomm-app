'use client';

import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ProductSummary } from '@/types';

export default function WishlistPage() {
  const { productIds } = useWishlistStore();
  const { mongoUser, loading: authLoading } = useAuthStore();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !mongoUser) {
      router.push('/auth/login?redirect=/wishlist');
    }
  }, [authLoading, mongoUser, router]);

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // We'll fetch products one by one or we could add a bulk fetch endpoint.
        // For simplicity, we'll use Promise.all with individual fetches
        const promises = productIds.map(id => fetch(`/api/products/${id}`).then(res => res.ok ? res.json() : null));
        const results = await Promise.all(promises);
        setProducts(results.filter(Boolean));
      } catch (error) {
        console.error('Failed to fetch wishlist products:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (mongoUser) {
      fetchWishlistProducts();
    }
  }, [productIds, mongoUser]);

  if (authLoading || (!mongoUser && loading)) {
    return <div className="max-w-7xl mx-auto px-4 py-12"><ProductGridSkeleton count={4} /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
      <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Saved</p>
      <h1 className="mt-4 text-3xl font-playfair text-[#1c1c18] mb-10">Wishlist</h1>

      {loading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#ffffff] border border-[#d0c5af]">
          <div className="w-20 h-20 bg-[#f6f3ed] border border-[#d0c5af] flex items-center justify-center mb-8">
            <Heart className="w-9 h-9 text-[#7f7663]" />
          </div>
          <h2 className="text-xl font-playfair text-[#1c1c18] mb-3">Your wishlist is empty</h2>
          <p className="text-sm text-[#4d4635] mb-10 text-center max-w-md">
            Save pieces you love and return anytime.
          </p>
          <Link href="/shop" className="bg-[#d4af37] text-[#1c1c18] px-10 py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="relative">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
