'use client';

import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';

export default function CartDrawer() {
  const hasCloudinary = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const { cartOpen, closeCart } = useUIStore();
  const { items, removeItem, updateQty, totalPrice } = useCartStore();

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-[#4d4635]/18 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#fcf9f3] border-l border-[#d0c5af] z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-[#d0c5af]">
              <h2 className="text-xs tracking-[0.24em] uppercase text-[#1c1c18]">Bag</h2>
              <button onClick={closeCart} className="p-2 text-[#4d4635] hover:text-[#1c1c18] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[#7f7663]">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-40" />
                  <p className="text-xs tracking-[0.24em] uppercase">Your bag is empty</p>
                  <button
                    onClick={closeCart}
                    className="mt-6 text-xs tracking-[0.24em] uppercase text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37]"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={`${item.product}-${index}`} className="flex gap-4 p-4 bg-[#ffffff] border border-[#d0c5af]">
                    <div className="w-20 h-20 relative bg-[#f6f3ed] overflow-hidden flex-shrink-0 border border-[#d0c5af]">
                      {item.image ? (
                        hasCloudinary ? (
                          <CldImage
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#7f7663]">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-[#1c1c18] line-clamp-1">{item.name}</h3>
                        {item.selectedVariants && (
                          <p className="text-xs tracking-[0.18em] uppercase text-[#7f7663] mt-2">
                            {Object.values(item.selectedVariants).join(' / ')}
                          </p>
                        )}
                        <p className="text-sm font-medium text-[#1c1c18] mt-2">₹{item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#d0c5af] bg-[#fcf9f3]">
                          <button
                            onClick={() => updateQty(item.product, Math.max(1, item.quantity - 1), item.selectedVariants)}
                            className="p-2 text-[#4d4635] hover:text-[#1c1c18]"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm text-[#1c1c18]">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.product, item.quantity + 1, item.selectedVariants)}
                            className="p-2 text-[#4d4635] hover:text-[#1c1c18]"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product, item.selectedVariants)}
                          className="p-2 text-[#7f7663] hover:text-[#8f0402] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t border-[#d0c5af] bg-[#ffffff]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs tracking-[0.24em] uppercase text-[#7f7663]">Subtotal</span>
                  <span className="text-lg font-playfair text-[#1c1c18]">₹{totalPrice().toFixed(2)}</span>
                </div>
                <p className="text-xs text-[#7f7663] mb-4">Shipping and taxes calculated at checkout.</p>
                <div className="flex flex-col gap-2">
                  <Link href="/cart" onClick={closeCart} className="w-full py-4 text-center border border-[#d0c5af] text-[#1c1c18] text-xs tracking-[0.24em] uppercase hover:bg-[#f6f3ed] transition-colors">
                    View Cart
                  </Link>
                  <Link href="/checkout" onClick={closeCart} className="w-full py-4 text-center bg-[#d4af37] text-[#1c1c18] text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors">
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
