'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
import type { ProductSummary } from '@/types';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products?featured=true&limit=6');
        const data = await res.json();
        setFeaturedProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const heroImageUrl = featuredProducts?.[0]?.images?.[0]?.url;
  const normalizedHeroImageUrl =
    heroImageUrl && !heroImageUrl.startsWith('http') && !heroImageUrl.startsWith('/')
      ? `/${heroImageUrl}`
      : heroImageUrl;

  return (
    <div className="flex flex-col">
      <section className="relative w-full">
        <div className="relative h-[72vh] min-h-[560px] max-h-[820px] overflow-hidden">
          {normalizedHeroImageUrl ? (
            <Image src={normalizedHeroImageUrl} alt="Featured piece" fill className="object-cover" sizes="100vw" priority />
          ) : (
            <div className="absolute inset-0 bg-[#1c1c18]" />
          )}

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(28,28,24,0.18),rgba(28,28,24,0.82))]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c18]/50 via-transparent to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-[11px] tracking-[0.34em] uppercase text-[#fcf9f3]/70"
              >
                The Art of Creation
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08 }}
                className="mt-8 font-playfair text-[#fcf9f3] text-5xl sm:text-6xl md:text-7xl leading-[0.95]"
              >
                Timeless <span className="italic">Elegance</span>,<br />
                Defined by Hand.
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-10 py-4 bg-[#fcf9f3] text-[#1c1c18] text-[11px] tracking-[0.24em] uppercase hover:bg-[#f6f3ed] transition-colors"
                >
                  Shop Collection
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-10 py-4 border border-[#fcf9f3]/70 text-[#fcf9f3] text-[11px] tracking-[0.24em] uppercase hover:bg-[#fcf9f3]/10 transition-colors"
                >
                  Discover Craft
                </Link>
              </motion.div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#fcf9f3] to-transparent" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="flex items-end justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-playfair text-[#1c1c18]">Collections</h2>
            <p className="mt-3 text-sm text-[#4d4635]">A focused edit, designed to be worn with intention.</p>
          </div>
          <Link href="/shop" className="hidden sm:inline text-xs tracking-[0.24em] uppercase text-[#4d4635] hover:text-[#1c1c18] hover:underline underline-offset-8 decoration-[#d4af37]">
            View All
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { slug: 'fashion', label: 'Fashion' },
            { slug: 'electronics', label: 'Electronics' },
            { slug: '', label: 'All Pieces' },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.slug ? `/shop?category=${c.slug}` : '/shop'}
              className="border border-[#d0c5af] bg-[#ffffff] p-8 hover:bg-[#f6f3ed] transition-colors"
            >
              <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Explore</p>
              <div className="mt-4 flex items-center justify-between gap-6">
                <h3 className="text-xl font-playfair text-[#1c1c18]">{c.label}</h3>
                <ArrowRight className="w-5 h-5 text-[#d4af37]" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="flex items-end justify-between gap-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-playfair text-[#1c1c18]">Featured</h2>
            <p className="mt-3 text-sm text-[#4d4635]">A selection chosen for craft, silhouette, and light.</p>
          </div>
          <Link href="/shop" className="hidden sm:inline text-xs tracking-[0.24em] uppercase text-[#4d4635] hover:text-[#1c1c18] hover:underline underline-offset-8 decoration-[#d4af37]">
            Discover
          </Link>
        </div>

        <div className="mt-10">
          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[#d0c5af] bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <h2 className="text-2xl md:text-3xl font-playfair text-[#1c1c18]">Client List</h2>
              <p className="mt-4 text-sm leading-7 text-[#4d4635]">
                Receive early access to launches and boutique appointments. One email per drop.
              </p>
            </div>
            <div className="lg:col-span-7">
              <form
                className="flex flex-col sm:flex-row gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Subscribed!');
                }}
              >
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  className="flex-1 bg-transparent border-b border-[#d0c5af] py-4 px-2 text-sm focus:outline-none focus:border-[#d4af37]"
                />
                <button
                  type="submit"
                  className="bg-[#d4af37] text-[#1c1c18] px-8 py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <p className="mt-4 text-xs tracking-[0.18em] uppercase text-[#7f7663]">
                Crafted communications only.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
