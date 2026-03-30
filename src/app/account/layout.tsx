'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { User, ShoppingBag, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { name: 'Profile', href: '/account', icon: User },
  { name: 'Orders', href: '/account/orders', icon: ShoppingBag },
  { name: 'Wishlist', href: '/wishlist', icon: Heart },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { mongoUser, loading } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !mongoUser) {
      router.push('/auth/login?redirect=/account');
    }
  }, [mongoUser, loading, router]);

  if (loading || !mongoUser) {
    return <div className="min-h-[60vh] flex justify-center items-center"><div className="animate-spin h-10 w-10 border-2 border-[#d0c5af] border-t-[#d4af37]"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 w-full flex-1">
      <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Account</p>
      <h1 className="mt-4 text-3xl font-playfair text-[#1c1c18] mb-10">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-1 border border-[#d0c5af] bg-[#ffffff] p-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    isActive 
                      ? 'text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37]' 
                      : 'text-[#4d4635] hover:bg-[#f6f3ed] hover:text-[#1c1c18]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 transition-colors text-[#8f0402] hover:bg-[#f6f3ed] w-full text-left border-t border-[#d0c5af] mt-2 pt-4"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </nav>
        </aside>
        
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
