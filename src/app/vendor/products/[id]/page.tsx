'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { auth } from '@/lib/firebase';
import AppLoader from '@/components/AppLoader';

interface ProductDetail {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  images: { url: string; alt?: string }[];
  category?: { name: string; slug: string };
  tags: string[];
  variants: { name: string; options: string[] }[];
  stock: number;
  sku: string;
  brand?: string;
  availabilityStatus: 'in_stock' | 'out_of_stock' | 'preorder';
  isActive: boolean;
  isFeatured: boolean;
}

export default function VendorProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { firebaseUser } = useAuthStore();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!firebaseUser) return;
    fetchWithAuth(`/api/vendor/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [firebaseUser, id]);

  const handleDelete = async () => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    const token = await auth.currentUser?.getIdToken();
    await fetch(`/api/vendor/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    router.push('/vendor/products');
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <AppLoader label="Loading product" />
    </div>
  );

  if (!product) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <p className="text-sm text-[var(--luxe-error)]">Product not found.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 bg-[var(--luxe-background)] text-[var(--luxe-text)]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/vendor/products" className="flex items-center gap-2 text-sm text-[var(--luxe-text-muted)] hover:text-[var(--luxe-text)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/vendor/products/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--luxe-outline-light)] bg-[var(--luxe-white)] text-[var(--luxe-text)] text-xs tracking-[0.18em] uppercase hover:bg-[var(--luxe-surface)] transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--luxe-error)]/20 text-[var(--luxe-error)] text-xs tracking-[0.18em] uppercase hover:bg-[var(--luxe-error)]/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-lg bg-[var(--luxe-surface)] border border-[var(--luxe-outline-light)] overflow-hidden">
            {product.images.length > 0 ? (
              <img
                src={product.images[activeImage]?.url}
                alt={product.images[activeImage]?.alt || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--luxe-text-muted)] text-xs tracking-[0.18em] uppercase">
                No Image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded border overflow-hidden flex-shrink-0 ${
                    activeImage === i ? 'border-[var(--luxe-gold)]' : 'border-[var(--luxe-outline-light)]'
                  }`}
                >
                  <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">

          {/* Status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs tracking-[0.18em] uppercase px-2 py-1 ${
              product.isActive ? 'bg-green-50 text-green-700' : 'bg-[var(--luxe-surface)] text-[var(--luxe-text-muted)]'
            }`}>
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className={`text-xs tracking-[0.18em] uppercase px-2 py-1 ${
              product.availabilityStatus === 'in_stock' ? 'bg-[var(--luxe-primary-container)]/40 text-[var(--luxe-primary)]' :
              product.availabilityStatus === 'preorder' ? 'bg-[var(--luxe-gold)]/10 text-[var(--luxe-secondary)]' :
              'bg-[var(--luxe-error)]/5 text-[var(--luxe-error)]'
            }`}>
              {product.availabilityStatus.replace('_', ' ')}
            </span>
            {product.isFeatured && (
              <span className="text-xs tracking-[0.18em] uppercase px-2 py-1 bg-[var(--luxe-gold)]/10 text-[var(--luxe-text)]">
                Featured
              </span>
            )}
          </div>

          {/* Name + category */}
          <div>
            <p className="text-xs tracking-[0.24em] uppercase text-[var(--luxe-text-muted)] mb-1">
              {product.category?.name || 'Uncategorized'}
            </p>
            <h1 className="text-2xl font-display font-normal text-[var(--luxe-text)]">{product.name}</h1>
            {product.brand && <p className="text-sm text-[var(--luxe-text-muted)] mt-1">{product.brand}</p>}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-[var(--luxe-text)]">₹{product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-sm text-[var(--luxe-text-muted)] line-through">₹{product.comparePrice.toFixed(2)}</span>
            )}
          </div>

          {/* Meta */}
          <div className="border-t border-[var(--luxe-outline-light)] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--luxe-text-muted)]">SKU</span>
              <span className="text-[var(--luxe-text)] font-mono">{product.sku}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--luxe-text-muted)]">Stock</span>
              <span className={`font-medium ${product.stock < 10 ? 'text-[var(--luxe-error)]' : 'text-[var(--luxe-text)]'}`}>
                {product.stock} units
              </span>
            </div>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="space-y-3">
              {product.variants.map((v) => (
                <div key={v.name}>
                  <p className="text-xs tracking-[0.18em] uppercase text-[var(--luxe-text-muted)] mb-2">{v.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <span key={opt} className="px-3 py-1 rounded border border-[var(--luxe-outline-light)] bg-[var(--luxe-white)] text-xs text-[var(--luxe-text)]">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="text-xs text-[var(--luxe-text-muted)] bg-[var(--luxe-surface)] px-2 py-1">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="border-t border-[var(--luxe-outline-light)] pt-8">
          <p className="text-xs tracking-[0.24em] uppercase text-[var(--luxe-text-muted)] mb-3">Description</p>
          <p className="text-sm text-[var(--luxe-text-muted)] leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}
    </div>
  );
}
