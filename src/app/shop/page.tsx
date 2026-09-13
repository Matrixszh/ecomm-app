'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { CategorySummary, ProductSummary } from '@/types';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [material, setMaterial] = useState('smoked-oak');

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page') || '1');
  const totalPages = Math.max(1, Math.ceil(total / 6));

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        params.set('limit', '6');
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
    setShowFilters(false);
  };

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete('page');
    else params.set('page', String(page));
    router.push(`/shop?${params.toString()}`);
  };

  const categoryName = currentCategory
    ? categories.find((category) => category.slug === currentCategory)?.name || currentCategory
    : 'Heritage Home Collections';

  return (
    <div className="bg-[#fbf8f5] px-3 pb-0 sm:px-5 lg:px-6">
      <div className="mx-auto min-h-[calc(100vh-100px)] max-w-[1420px] bg-[#fffdfb] px-6 pb-24 pt-10 sm:px-10 lg:px-14 lg:pt-12">
        <header className="max-w-[760px]">
          <h1 className="font-display text-[43px] leading-[1.02] text-[#29231f] sm:text-[50px] lg:text-[56px]">
            {categoryName}
          </h1>
          <p className="mt-4 max-w-[650px] text-[15px] leading-6 text-[#948985] sm:text-base">
            Curating a sanctuary of architectural silhouettes and artisanal textures for the contemporary dwelling.
          </p>
        </header>

        <div className="mt-12 flex items-center justify-between border-b border-[#eee7e2] pb-4 md:hidden">
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="text-[11px] uppercase tracking-[0.22em] text-[#806d52]"
          >
            Filters
          </button>
          <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#806d52]">
            Sort by
            <select
              value={currentSort}
              onChange={(event) => updateFilter('sort', event.target.value)}
              className="bg-transparent text-[11px] uppercase tracking-[0.12em] text-[#7d6c55] focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price (Low)</option>
              <option value="price_desc">Price (High)</option>
              <option value="rating">Top Rated</option>
            </select>
          </label>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[210px_minmax(0,1fr)] lg:gap-32">
          <aside
            className={`${
              showFilters ? 'fixed inset-0 z-[60] translate-x-0 bg-[#fffdfb] p-8' : 'hidden'
            } left-0 top-0 md:static md:block md:bg-transparent md:p-0`}
          >
            <div className="mb-8 flex items-center justify-between md:hidden">
              <span className="text-[11px] uppercase tracking-[0.24em] text-[#806d52]">Filters</span>
              <button type="button" onClick={() => setShowFilters(false)} aria-label="Close filters">
                <X className="h-5 w-5 text-[#6c5e55]" />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c7449]">Material</h2>
                <div className="mt-5 space-y-4">
                  {['raw-marble', 'smoked-oak', 'hand-thrown-ceramic', 'brushed-brass'].map((value) => {
                    const label = value
                      .split('-')
                      .map((part) => part[0].toUpperCase() + part.slice(1))
                      .join(' ');
                    return (
                      <label key={value} className="flex cursor-pointer items-center gap-3 text-[14px] text-[#6d625d]">
                        <input
                          type="checkbox"
                          checked={material === value}
                          onChange={() => setMaterial(material === value ? '' : value)}
                          className="peer sr-only"
                        />
                        <span className="flex h-[14px] w-[14px] items-center justify-center rounded-[2px] border border-[#d9d0cb] text-[10px] text-white peer-checked:border-[#80662e] peer-checked:bg-[#80662e]">
                          {material === value ? '✓' : ''}
                        </span>
                        <span className={material === value ? 'font-medium text-[#876c32]' : ''}>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c7449]">Category</h2>
                <div className="mt-5 space-y-4">
                  <button
                    type="button"
                    onClick={() => updateFilter('category', '')}
                    className={`block text-left text-[14px] ${!currentCategory ? 'font-medium text-[#876c32]' : 'text-[#6d625d]'}`}
                  >
                    All Collections
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => updateFilter('category', category.slug)}
                      className={`block text-left text-[14px] ${currentCategory === category.slug ? 'font-medium text-[#876c32]' : 'text-[#6d625d]'}`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8c7449]">Price Range</h2>
                <div className="mt-5 px-1">
                  <div className="h-[3px] rounded-full bg-[#e5dfdc]" />
                  <div className="mt-3 flex justify-between text-[13px] text-[#6d625d]">
                    <span>$200</span>
                    <span>$15,000+</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMaterial('');
                  router.push('/shop');
                  setShowFilters(false);
                }}
                className="w-full bg-[#211e1d] py-3 text-[11px] uppercase tracking-[0.2em] text-[#fffaf7] transition-colors hover:bg-[#423a35]"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-8 hidden items-center justify-between border-b border-[#eee7e2] pb-4 md:flex">
              <p className="text-[14px] text-[#948985]">Showing {products.length ? (currentPage - 1) * 6 + 1 : 0}–{Math.min(currentPage * 6, total)} of {total || 0} products</p>
              <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#806d52]">
                Sort by:
                <select
                  value={currentSort}
                  onChange={(event) => updateFilter('sort', event.target.value)}
                  className="appearance-none bg-transparent pr-5 text-[11px] uppercase tracking-[0.18em] text-[#806d52] focus:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price (Low)</option>
                  <option value="price_desc">Price (High)</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="-ml-5 h-3 w-3" />
              </label>
            </div>

            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <h3 className="font-display text-2xl text-[#2f2822]">No results</h3>
                <p className="mt-3 text-sm text-[#81756e]">Adjust filters to refine your selection.</p>
                <button type="button" onClick={() => router.push('/shop')} className="mt-7 text-[11px] uppercase tracking-[0.2em] text-[#876c32] underline underline-offset-8">
                  Clear all filters
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-20 flex items-center justify-center gap-6 text-[11px] uppercase tracking-[0.18em] text-[#978b84]" aria-label="Pagination">
                <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="disabled:opacity-30" aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 3) }, (_, index) => index + 1).map((page) => (
                  <button key={page} type="button" onClick={() => setPage(page)} className={page === currentPage ? 'border-b-2 border-[#a0803e] pb-2 font-semibold text-[#876c32]' : ''}>
                    {String(page).padStart(2, '0')}
                  </button>
                ))}
                <button type="button" onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="disabled:opacity-30" aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div className="bg-[#fbf8f5] px-6 py-12"><ProductGridSkeleton count={6} /></div>}>
      <ShopContent />
    </Suspense>
  );
}
