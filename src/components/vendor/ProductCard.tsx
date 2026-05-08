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
      <div key={product._id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:bg-gray-100 hover:cursor-pointer"  onClick={onClick} >
              <div className="flex items-center gap-4">
                <img src={product.images[0]?.url} alt={product.images[0]?.alt || product.name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">${product.price.toFixed(2)} &middot; Stock: {product.stock}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
                <Link
                  href={`/vendor/products/${product._id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:underline text-sm">
                  Edit
                </Link>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(product._id); }}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
  )
}

export default ProductCard