'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingCart, Heart, User, Search as SearchIcon, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { useState, useRef, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import dynamic from 'next/dynamic';

function CartBadge() {
  const { itemCount } = useCartStore();
  const count = itemCount();
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-[#d4af37] text-[#1c1c18] text-[10px] font-semibold h-4 w-4 flex items-center justify-center">
      {count}
    </span>
  );
}
const CartBadgeNoSSR = dynamic(() => Promise.resolve(CartBadge), { ssr: false });

export default function Navbar() {
  const hasCloudinary = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const { logout } = useAuth();
  const { mongoUser, loading } = useAuthStore();
  const { openSearch, openCart } = useUIStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';

  const linkClass = (active: boolean) =>
    `inline-flex items-center text-[11px] tracking-[0.24em] uppercase pb-2 border-b-2 ${
      active
        ? 'text-[#d4af37] border-[#d4af37]'
        : 'text-[#4d4635] border-transparent hover:text-[#1c1c18] hover:border-[#d4af37]'
    }`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <nav className="bg-[#fcf9f3] border-b border-[#d0c5af] sticky top-0 z-50">
      <div className="py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="bg-[#1c1c18] text-[#fcf9f3] h-9 px-5 flex items-center justify-center rounded-full">
            <p className="text-[10px] tracking-[0.34em] uppercase text-center">
              Complimentary express shipping & artful gifting on all orders
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center">
          <div className="flex items-center gap-3 md:hidden">
            <button
              className="p-2 text-[#4d4635] hover:text-[#1c1c18]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-8 flex-1">
            <Link href="/shop?sort=newest" className={linkClass(pathname === '/shop' && sort === 'newest')}>
              New Arrivals
            </Link>
            <Link href="/shop" className={linkClass(pathname === '/shop' && !category && sort !== 'newest')}>
              Collections
            </Link>
            <Link href="/shop?category=jewelry" className={linkClass(pathname === '/shop' && category === 'jewelry')}>
              Jewelry
            </Link>
          </div>

          <div className="flex-1 flex justify-center">
            <Link href="/" className="text-2xl font-playfair tracking-[0.18em] uppercase text-[#1c1c18]">
              The Atelier
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 flex-1 justify-end">
            <Link href="/shop?category=gifts" className={linkClass(pathname === '/shop' && category === 'gifts')}>
              Gifts
            </Link>
            <Link href="/account" className={linkClass(pathname.startsWith('/account'))}>
              About
            </Link>
          </div>

          <div className="flex items-center gap-4 justify-end flex-1 md:flex-none md:ml-6">
            <button onClick={openSearch} className="text-[#4d4635] hover:text-[#1c1c18] transition-colors p-1" aria-label="Search">
              <SearchIcon className="w-5 h-5" />
            </button>

            <Link href="/wishlist" className="hidden sm:block text-[#4d4635] hover:text-[#1c1c18] transition-colors p-1" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </Link>

            <button onClick={openCart} className="text-[#4d4635] hover:text-[#1c1c18] transition-colors p-1 relative" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              <CartBadgeNoSSR />
            </button>

            {!loading && (
              <>
                {mongoUser ? (
                  <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center focus:outline-none" aria-label="Account menu">
                      {mongoUser.avatar ? (
                        <div className="w-8 h-8 overflow-hidden border border-[#d0c5af]">
                          {hasCloudinary ? (
                            <CldImage src={mongoUser.avatar} alt="Avatar" width={32} height={32} className="object-cover" />
                          ) : (
                            <Image src={mongoUser.avatar} alt="Avatar" width={32} height={32} className="object-cover w-full h-full" />
                          )}
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-[#f6f3ed] flex items-center justify-center border border-[#d0c5af] text-[#4d4635] hover:text-[#1c1c18]">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-[#fcf9f3] border border-[#d0c5af] shadow-[0_24px_48px_-12px_rgba(28,28,24,0.10)] py-1 z-50">
                        <div className="px-4 py-3 border-b border-[#d0c5af]">
                          <p className="text-sm font-medium text-[#1c1c18] truncate">{mongoUser.name}</p>
                          <p className="text-xs text-[#7f7663] truncate">{mongoUser.email}</p>
                        </div>

                        {mongoUser.role === 'admin' && (
                          <Link href="/admin" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-[#4d4635] hover:bg-[#f6f3ed] hover:text-[#1c1c18]">
                            Admin Dashboard
                          </Link>
                        )}

                        <Link href="/account" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-[#4d4635] hover:bg-[#f6f3ed] hover:text-[#1c1c18]">
                          My Profile
                        </Link>
                        <Link href="/account/orders" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-[#4d4635] hover:bg-[#f6f3ed] hover:text-[#1c1c18]">
                          My Orders
                        </Link>
                        <Link href="/wishlist" onClick={() => setDropdownOpen(false)} className="block sm:hidden px-4 py-2 text-sm text-[#4d4635] hover:bg-[#f6f3ed] hover:text-[#1c1c18]">
                          Wishlist
                        </Link>

                        <button onClick={() => { logout(); setDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-[#8f0402] hover:bg-[#f6f3ed] border-t border-[#d0c5af]">
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/auth/login" className="hidden sm:block text-[#4d4635] hover:text-[#1c1c18] transition-colors p-1" aria-label="Sign in">
                    <User className="w-5 h-5" />
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
          {mobileMenuOpen && (
        <div className="md:hidden bg-[#fcf9f3] border-b border-[#d0c5af] px-4 pt-2 pb-6 space-y-1">
          <Link href="/shop?sort=newest" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#4d4635] hover:text-[#1c1c18]">New Arrivals</Link>
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#4d4635] hover:text-[#1c1c18]">Collections</Link>
          <Link href="/shop?category=jewelry" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#4d4635] hover:text-[#1c1c18]">Jewelry</Link>
          <Link href="/shop?category=gifts" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#4d4635] hover:text-[#1c1c18]">Gifts</Link>
          <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#4d4635] hover:text-[#1c1c18]">About</Link>
          
          {!mongoUser && !loading && (
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-left px-3 py-3 text-sm tracking-[0.16em] uppercase text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37] mt-4"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
