'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useAuthStore } from '@/store/authStore';
import type { CloudinaryImage, ProductSummary } from '@/types';
import AppLoader from '@/components/AppLoader';

type AdminProductRow = ProductSummary & {
  isActive: boolean;
  stock: number;
  images: CloudinaryImage[];
  category?: { name: string; slug: string } | null;
};

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { firebaseUser } = useAuthStore();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?search=${search}&limit=50`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase text-(--luxe-text-muted)">Admin</p>
          <h1 className="mt-4 text-3xl font-display text-(--luxe-text)">Products</h1>
        </div>
        <Link 
          href="/admin/products/new"
          className="bg-(--luxe-cta) text-(--luxe-white) px-8 py-4 text-xs tracking-[0.24em] uppercase flex items-center gap-2 hover:bg-(--luxe-cta-hover) transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-(--luxe-white) border border-(--luxe-outline-light) overflow-hidden">
        <div className="p-4 border-b border-(--luxe-outline-light) flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--luxe-text-muted)" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-b border-(--luxe-outline-light) py-3 pl-10 pr-4 text-sm text-(--luxe-text) placeholder:text-(--luxe-text-muted) focus:outline-none focus:border-(--luxe-primary)"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-(--luxe-background) text-(--luxe-text-muted) text-xs tracking-[0.24em] uppercase border-b border-(--luxe-outline-light)">
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--luxe-outline-light) text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-(--luxe-text-muted)">
                    <div className="flex justify-center">
                      <AppLoader label="Loading products" />
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-(--luxe-text-muted)">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-(--luxe-surface) transition-colors">
                    <td className="p-4">
                      <div className="w-12 h-12 relative bg-(--luxe-surface) border border-(--luxe-outline-light) overflow-hidden">
                        {product.images?.[0]?.url ? (
                          <CldImage src={product.images[0].url} alt={product.name} fill className="object-cover" sizes="48px" />
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-(--luxe-text) max-w-xs truncate">{product.name}</td>
                    <td className="p-4 text-(--luxe-text-muted) capitalize">{product.category?.name || 'N/A'}</td>
                    <td className="p-4 text-(--luxe-text)">₹{product.price}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-[11px] tracking-[0.18em] uppercase border ${
                        product.stock > 10
                          ? 'bg-(--luxe-white) border-(--luxe-outline-light) text-(--luxe-primary)'
                          : product.stock > 0
                            ? 'bg-(--luxe-white) border-(--luxe-outline-light) text-(--luxe-secondary)'
                            : 'bg-(--luxe-white) border-(--luxe-outline-light) text-(--luxe-error)'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="p-4">
                      {product.isActive ? (
                        <span className="text-(--luxe-primary) text-xs tracking-[0.18em] uppercase flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-(--luxe-primary)" /> Active
                        </span>
                      ) : (
                        <span className="text-(--luxe-text-muted) text-xs tracking-[0.18em] uppercase flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-(--luxe-text-muted)" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${product._id}/edit`} className="p-2 text-(--luxe-text-muted) hover:text-(--luxe-text) transition-colors hover:bg-(--luxe-surface)">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(product._id)} className="p-2 text-(--luxe-text-muted) hover:text-(--luxe-error) transition-colors hover:bg-(--luxe-surface)">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
