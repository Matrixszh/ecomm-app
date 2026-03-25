'use client';

import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import StarRating from './StarRating';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images: { url: string; publicId?: string }[];
    avgRating: number;
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
        className="bg-[#ffffff] overflow-hidden border border-[#d0c5af] transition-[transform,border-color] duration-500 h-full flex flex-col relative"
        whileHover={{ y: -3 }}
      >
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 p-2 bg-[#fcf9f3]/85 backdrop-blur-[20px] text-[#4d4635] hover:text-[#1c1c18] border border-[#d0c5af] transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${wishlisted ? 'fill-[#d4af37] text-[#d4af37]' : ''}`}
            suppressHydrationWarning={true}
          />
        </button>

        <div className="relative aspect-square overflow-hidden bg-[#f6f3ed]">
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
          
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 bg-gradient-to-t from-[#fcf9f3] via-[#fcf9f3]/80 to-transparent">
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-[#d4af37] text-[#1c1c18] text-xs tracking-[0.24em] uppercase font-medium flex items-center justify-center gap-2 hover:bg-[#c29a30] transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Bag
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-[#1c1c18] font-playfair text-lg leading-tight line-clamp-2">
            {product.name}
          </h3>
          
          <div className="mt-6 flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-[#1c1c18]">₹{product.price}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xs text-[#7f7663] line-through">₹{product.comparePrice}</span>
              )}
            </div>
            <div className="flex items-center">
              <StarRating rating={product.avgRating} size="sm" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
