import React from 'react'
import Link from 'next/link';
import type { ProductSummary } from '@/types';

interface ProductCardProps {
  product: ProductSummary;
  onDelete: (id: string) => void;
  onClick: () => void;
}

const ProductCard = ({ product, onDelete, onClick }: ProductCardProps) => {
  return (
      <div key={product._id} className="flex items-center justify-between bg-[var(--luxe-white)] border border-[var(--luxe-outline-light)] rounded-lg p-4 mb-3 hover:border-[var(--luxe-primary)] transition-colors hover:cursor-pointer"  onClick={onClick} >
              <div className="flex items-center gap-4">
                <img src={product.images[0]?.url} alt={product.images[0]?.alt || product.name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <p className="font-display font-medium text-[var(--luxe-text)]">{product.name}</p>
                  <p className="text-sm text-[var(--luxe-text-muted)]">${product.price.toFixed(2)} &middot; Stock: {product.stock}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    product.isActive ? 'bg-green-50 text-green-800' : 'bg-[var(--luxe-error)]/10 text-[var(--luxe-error)]'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
                <Link
                  href={`/vendor/products/${product._id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[var(--luxe-primary)] hover:underline underline-offset-4 text-sm rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--luxe-primary)]">
                  Edit
                </Link>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(product._id); }}
                  className="text-[var(--luxe-error)] hover:underline underline-offset-4 text-sm rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--luxe-primary)]"
                >
                  Delete
                </button>
              </div>
            </div>
  )
}

export default ProductCard