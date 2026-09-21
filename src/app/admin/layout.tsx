'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SidebarDemo from '@/components/sidebar-demo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { mongoUser, isAdmin, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!mongoUser) {
        router.push('/auth/login?redirect=/admin');
      } else if (!isAdmin) {
        router.push('/');
      }
    }
  }, [mongoUser, isAdmin, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#fcf9f3]">
        <div className="animate-spin h-10 w-10 border-2 border-[#d0c5af] border-t-[#d4af37]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen min-w-0 flex-col overflow-hidden bg-[#fcf9f3] md:flex-row">
      <SidebarDemo />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-8">
        <div className="mx-auto mt-6 w-full max-w-7xl md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
