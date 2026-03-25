'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

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
    <div className="flex h-screen bg-[#fcf9f3] overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto mt-12 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
