'use client';

import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';


interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: { url: string; publicId?: string }[];
    avgRating: number;
    brand?: string;
    vendor?: string | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const hasCloudinary = !!cloudName;
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const { addToast } = useUIStore();

  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0]?.url,
      vendor: product.vendor ?? undefined,
    });
    addToast('Added to cart', 'success');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product._id);
    addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info');
  };

  const primaryImage = product.images?.[0];
  const primaryImageUrl = primaryImage?.url;
  const primaryPublicId = primaryImage?.publicId;
  const normalizedImageUrl =
    primaryImageUrl && !primaryImageUrl.startsWith('http') && !primaryImageUrl.startsWith('/')
      ? `/${primaryImageUrl}`
      : primaryImageUrl;
  const canUseCldImage =
    typeof primaryPublicId === 'string' &&
    (typeof primaryImageUrl !== 'string' ||
      primaryImageUrl.length === 0 ||
      (hasCloudinary && primaryImageUrl.includes(`res.cloudinary.com/${cloudName}/`)));

  return (
    <Link href={`/shop/${product.slug}`} className="block group">
      <motion.div
        className="relative flex h-full flex-col overflow-hidden bg-transparent"
        whileHover={{ y: -3 }}
      >
        <button
          onClick={handleToggleWishlist}
          className="absolute right-3 top-3 z-10 rounded-full bg-[#fffdfb]/85 p-2 text-[#8e8179] backdrop-blur-[20px] transition-colors hover:text-[#2f2822]"
        >
          <Heart
            className={`h-[17px] w-[17px] ${wishlisted ? 'fill-[#b58d48] text-[#b58d48]' : ''}`}
            suppressHydrationWarning={true}
          />
        </button>

        <div className="relative aspect-[0.9] overflow-hidden rounded-[15px] bg-[#f1ece8]">
          {normalizedImageUrl ? (
            canUseCldImage ? (
              <CldImage
                src={primaryPublicId}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <Image
                src={normalizedImageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#7f7663] text-sm tracking-[0.18em] uppercase">
              No Image
            </div>
          )}
          
          <div className="absolute inset-x-0 bottom-0 z-10 translate-y-2 bg-gradient-to-t from-[#fffdfb] via-[#fffdfb]/80 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#211e1d] py-3 text-xs font-medium uppercase tracking-[0.2em] text-[#fffaf7] hover:bg-[#423a35]"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Bag
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-0 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8c7449]">
            {product.brand || product.vendor || 'Luxe Heritage'}
          </p>
          <h3 className="mt-2 line-clamp-2 font-display text-[22px] leading-[1.05] text-[#332a25]">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-[16px] italic text-[#998d86]">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-[#a69b94] line-through">₹{product.comparePrice.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
