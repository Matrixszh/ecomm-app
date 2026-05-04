'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { auth } from '@/lib/firebase';

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
      <p className="text-sm text-[#7f7663] tracking-[0.18em] uppercase">Loading...</p>
    </div>
  );

  if (!product) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <p className="text-sm text-red-500">Product not found.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/vendor/products" className="flex items-center gap-2 text-sm text-[#7f7663] hover:text-[#1c1c18] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/vendor/products/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 border border-[#d0c5af] text-[#1c1c18] text-xs tracking-[0.18em] uppercase hover:bg-[#f6f3ed] transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-xs tracking-[0.18em] uppercase hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-[#f6f3ed] border border-[#d0c5af] overflow-hidden">
            {product.images.length > 0 ? (
              <img
                src={product.images[activeImage]?.url}
                alt={product.images[activeImage]?.alt || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#7f7663] text-xs tracking-[0.18em] uppercase">
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
                  className={`w-16 h-16 border overflow-hidden flex-shrink-0 ${
                    activeImage === i ? 'border-[#d4af37]' : 'border-[#d0c5af]'
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
              product.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className={`text-xs tracking-[0.18em] uppercase px-2 py-1 ${
              product.availabilityStatus === 'in_stock' ? 'bg-blue-50 text-blue-700' :
              product.availabilityStatus === 'preorder' ? 'bg-yellow-50 text-yellow-700' :
              'bg-red-50 text-red-700'
            }`}>
              {product.availabilityStatus.replace('_', ' ')}
            </span>
            {product.isFeatured && (
              <span className="text-xs tracking-[0.18em] uppercase px-2 py-1 bg-[#d4af37]/10 text-[#1c1c18]">
                Featured
              </span>
            )}
          </div>

          {/* Name + category */}
          <div>
            <p className="text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-1">
              {product.category?.name || 'Uncategorized'}
            </p>
            <h1 className="text-2xl font-playfair text-[#1c1c18]">{product.name}</h1>
            {product.brand && <p className="text-sm text-[#4d4635] mt-1">{product.brand}</p>}
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-[#1c1c18]">₹{product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-sm text-[#7f7663] line-through">₹{product.comparePrice.toFixed(2)}</span>
            )}
          </div>

          {/* Meta */}
          <div className="border-t border-[#d0c5af] pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#7f7663]">SKU</span>
              <span className="text-[#1c1c18] font-mono">{product.sku}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#7f7663]">Stock</span>
              <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-[#1c1c18]'}`}>
                {product.stock} units
              </span>
            </div>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="space-y-3">
              {product.variants.map((v) => (
                <div key={v.name}>
                  <p className="text-xs tracking-[0.18em] uppercase text-[#7f7663] mb-2">{v.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => (
                      <span key={opt} className="px-3 py-1 border border-[#d0c5af] text-xs text-[#1c1c18]">
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
                <span key={tag} className="text-xs text-[#7f7663] bg-[#f6f3ed] px-2 py-1">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="border-t border-[#d0c5af] pt-8">
          <p className="text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-3">Description</p>
          <p className="text-sm text-[#4d4635] leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}
    </div>
  );
}
