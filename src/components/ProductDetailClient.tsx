'use client';

import { useMemo, useState } from 'react';
import { CldImage } from 'next-cloudinary';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Heart, Minus, Plus, ShoppingCart, Truck, BadgeCheck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';
import ProductCard from '@/components/ProductCard';
import type { CloudinaryImage, ProductDetail, ProductSummary } from '@/types';

type Props = {
  product: ProductDetail & { stock: number; category?: { name: string; slug: string } | null; images: CloudinaryImage[] };
  relatedProducts: ProductSummary[];
};

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const hasCloudinary = !!cloudName;
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const variant of product.variants ?? []) {
      const name = variant?.name?.trim();
      if (name && variant.options?.[0]) initial[name] = variant.options[0];
    }
    return initial;
  });
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { addToast } = useUIStore();
  const images = useMemo(() => product.images || [], [product.images]);
  const wishlisted = isWishlisted(product._id);
  const active = images[activeImage];
  const activeUrl = active?.url;
  const activePublicId = active?.publicId;
  const normalizedActiveUrl = activeUrl && !activeUrl.startsWith('http') && !activeUrl.startsWith('/') ? `/${activeUrl}` : activeUrl;
  const canUseActiveCldImage = typeof activePublicId === 'string' && (typeof activeUrl !== 'string' || activeUrl.length === 0 || (hasCloudinary && activeUrl.includes(`res.cloudinary.com/${cloudName}/`)));

  const addToCart = () => {
    addItem({ product: product._id, name: product.name, price: product.price, quantity, image: images[0]?.url, selectedVariants, vendor: product.vendor ?? undefined });
    addToast('Added to cart', 'success');
  };

  const toggleProductWishlist = () => {
    toggle(product._id);
    addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info');
  };

  return (
    <div className="bg-[#fbf8f5] px-3 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1420px] bg-[#fffdfb] px-5 pb-20 pt-8 sm:px-8 lg:px-10 lg:pt-10">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.75fr] lg:gap-24">
          <section>
            <div className="relative aspect-[1.03] overflow-hidden rounded-[5px] bg-[#202629]">
              {normalizedActiveUrl ? (
                canUseActiveCldImage ? (
                  <CldImage src={activePublicId} alt={product.name} fill priority className="cursor-zoom-in object-cover" sizes="(max-width: 1024px) 100vw, 62vw" />
                ) : (
                  <Image src={normalizedActiveUrl} alt={product.name} fill priority className="cursor-zoom-in object-cover" sizes="(max-width: 1024px) 100vw, 62vw" />
                )
              ) : <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.2em] text-[#c5b8ad]">No Image</div>}
            </div>

            {images.length > 1 && (
              <div className="mt-5 grid grid-cols-2 gap-5">
                {images.map((image, index) => {
                  const imageUrl = image.url && !image.url.startsWith('http') && !image.url.startsWith('/') ? `/${image.url}` : image.url;
                  const publicId = image.publicId;
                  const useCloudinary = typeof publicId === 'string' && publicId.length > 0 && hasCloudinary && image.url.includes(`res.cloudinary.com/${cloudName}/`);
                  return (
                    <button key={publicId ?? `${image.url}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`relative aspect-[1.08] overflow-hidden rounded-[5px] bg-[#f0e5df] ${index === activeImage ? 'ring-2 ring-[#b18a4f] ring-offset-2' : ''}`}>
                      {useCloudinary && publicId ? <CldImage src={publicId} alt={`${product.name} ${index + 1}`} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 30vw" /> : <Image src={imageUrl} alt={`${product.name} ${index + 1}`} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 30vw" />}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="flex flex-col pt-8 lg:pt-12">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#9b8e85]">
              <span className="rounded-full bg-[#f3d99d] px-3 py-1 text-[9px] text-[#80642d]">Bespoke</span>
              <span>Signature Series</span>
            </div>
            <h1 className="mt-7 max-w-[360px] font-display text-[42px] leading-[0.98] text-[#29231f] sm:text-[50px]">{product.name}</h1>
            <p className="mt-5 font-display text-[21px] italic text-[#a18152]">{product.category?.name || 'Atelier Collection'}</p>
            <div className="mt-7 flex items-baseline gap-4 border-b border-[#f0e4df] pb-8">
              <span className="font-display text-[27px] text-[#302924]">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              {product.comparePrice && product.comparePrice > product.price ? <span className="text-sm text-[#a79b94] line-through">₹{product.comparePrice.toLocaleString('en-IN')}</span> : null}
            </div>

            <p className="mt-7 text-[14px] leading-6 text-[#756a64]">{product.shortDescription || product.description?.replace(/<[^>]+>/g, '').slice(0, 260) || 'A definitive statement in modern luxury, balancing sculptural form with considered comfort and exceptional materials.'}</p>
            <ul className="mt-6 space-y-4 text-[13px] text-[#6f645e]">
              <li className="flex items-center gap-3"><Check className="h-4 w-4 rounded-full border border-[#a68b55] p-[2px] text-[#8a6c34]" /> Sustainably sourced hardwood frame</li>
              <li className="flex items-center gap-3"><Check className="h-4 w-4 rounded-full border border-[#a68b55] p-[2px] text-[#8a6c34]" /> Customizable premium upholstery options</li>
            </ul>

            {(product.variants?.length ?? 0) > 0 && <div className="mt-7 space-y-5 border-t border-[#f0e4df] pt-6">{product.variants?.map((variant) => <div key={variant.name}><p className="text-[10px] uppercase tracking-[0.2em] text-[#8b7760]">{variant.name}</p><div className="mt-3 flex flex-wrap gap-3">{variant.options.map((option) => <button key={option} type="button" onClick={() => setSelectedVariants((current) => ({ ...current, [variant.name]: option }))} className={`rounded-full border px-4 py-2 text-xs ${selectedVariants[variant.name] === option ? 'border-[#ad8b54] bg-[#f5eadb] text-[#765c31]' : 'border-[#ded3cd] text-[#776c65]'}`}>{option}</button>)}</div></div>)}</div>}

            <div className="mt-8 space-y-3">
              <button type="button" onClick={addToCart} disabled={product.stock === 0} className="w-full rounded-full bg-[#efb4c9] py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#644b51] transition-colors hover:bg-[#e7a4bd] disabled:opacity-50">Inquire to Purchase</button>
              <button type="button" onClick={() => addToast('A client advisor will contact you shortly.', 'info')} className="w-full rounded-full border border-[#b59a6b] py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#876d3f] hover:bg-[#fbf4eb]">Book a Private Showing</button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-[#f0e4df] pt-6 text-center text-[12px] text-[#6c625d]">
              <div><Truck className="mx-auto mb-2 h-5 w-5 text-[#a48752]" />White Glove Delivery</div>
              <div><BadgeCheck className="mx-auto mb-2 h-5 w-5 text-[#a48752]" />Lifetime Guarantee</div>
            </div>
            <button type="button" onClick={toggleProductWishlist} aria-label="Toggle wishlist" className={`mt-5 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] ${wishlisted ? 'text-[#a18152]' : 'text-[#9b8e85]'}`}><Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} /> Save to wishlist</button>
          </section>
        </div>

        <section className="mt-20 border-t border-[#f0e4df] pt-20 lg:mt-24 lg:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div className="max-w-[470px]">
              <h2 className="font-display text-[29px] text-[#362c26] sm:text-[34px]">Mastery in Every Curve</h2>
              <p className="mt-5 text-[14px] leading-6 text-[#756a64]">Every piece in the {product.name} series is a dialogue between traditional cabinet-making and contemporary design language. Our artisans spend upwards of forty hours hand-stitching each velvet panel to ensure a seamless, architectural silhouette.</p>
              <Link href="/shop?category=furniture" className="mt-7 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#a18152]">The Art of Furniture <span>→</span></Link>
            </div>
            <div className="relative aspect-[1.55] overflow-hidden rounded-[5px] bg-[#b8864e]"><Image src="/cat3.jpeg" alt="Luxe Heritage artisan workshop" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" /></div>
          </div>
        </section>

        {relatedProducts.length > 0 && <section className="mt-20 border-t border-[#f0e4df] pt-14"><h2 className="font-display text-3xl text-[#362c26]">You May Also Like</h2><div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{relatedProducts.map((related) => <ProductCard key={related._id} product={related} />)}</div></section>}
      </div>
    </div>
  );
}
