'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { CategorySummary, CloudinaryImage, ProductDetail } from '@/types';

const ImageUploader = dynamic(() => import('@/components/ImageUploader'), {
  ssr: false,
  loading: () => <div className="h-32 bg-[#e5e2dc] animate-pulse flex items-center justify-center text-[#7f7663] text-xs tracking-[0.24em] uppercase">Loading uploader...</div>
});

type ProductFormProps = {
  initialData?: (ProductDetail & { category?: { _id: string } | string | null; sku?: string; isActive?: boolean; isFeatured?: boolean }) | null;
};

export default function ProductForm({ initialData = null }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [images, setImages] = useState<CloudinaryImage[]>(initialData?.images || []);
  const categoryDefaultValue =
    typeof initialData?.category === 'string' ? initialData.category : initialData?.category?._id;

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      sku: formData.get('sku'),
      category: formData.get('category'),
      images,
      isActive: formData.get('isActive') === 'on',
      isFeatured: formData.get('isFeatured') === 'on',
    };

    const url = initialData ? `/api/products/${initialData._id}` : '/api/products';
    const method = initialData ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/admin/products');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-playfair text-[#1c1c18]">
          {initialData ? 'Edit Product' : 'New Product'}
        </h1>
        <div className="flex gap-4">
          <Link href="/admin/products" className="px-5 py-3 border border-[#d0c5af] hover:bg-[#f6f3ed] flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-[#1c1c18] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-[#d4af37] text-[#1c1c18] text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 bg-[#ffffff] border border-[#d0c5af] p-6">
          <div>
            <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Name</label>
            <input name="name" defaultValue={initialData?.name} required className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]" />
          </div>
          <div>
            <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Description</label>
            <textarea name="description" defaultValue={initialData?.description} required rows={6} className="w-full bg-transparent border border-[#d0c5af] p-3 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]" />
          </div>
          <div>
            <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Images</label>
            <ImageUploader images={images} onChange={setImages} />
          </div>
        </div>

        <div className="space-y-6 bg-[#ffffff] border border-[#d0c5af] p-6 h-fit">
          <div>
            <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Price (₹)</label>
            <input type="number" name="price" defaultValue={initialData?.price} required min="0" className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]" />
          </div>
          <div>
            <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Stock</label>
            <input type="number" name="stock" defaultValue={initialData?.stock} required min="0" className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]" />
          </div>
          <div>
            <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">SKU</label>
            <input name="sku" defaultValue={initialData?.sku} required className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]" />
          </div>
          <div>
            <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Category</label>
            <select name="category" defaultValue={categoryDefaultValue ?? ''} required className="w-full bg-transparent border border-[#d0c5af] p-3 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]">
              <option value="">Select...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isActive" defaultChecked={initialData ? initialData.isActive : true} id="isActive" className="w-4 h-4 accent-[#d4af37]" />
            <label htmlFor="isActive" className="text-sm text-[#4d4635]">Active (Visible in store)</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="isFeatured" defaultChecked={initialData?.isFeatured} id="isFeatured" className="w-4 h-4 accent-[#d4af37]" />
            <label htmlFor="isFeatured" className="text-sm text-[#4d4635]">Featured</label>
          </div>
        </div>
      </div>
    </form>
  );
}
