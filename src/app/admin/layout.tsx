'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SidebarDemo from '@/components/sidebar-demo';
import AppLoader from '@/components/AppLoader';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import './admin-theme.css';

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
      <div className="admin-portal min-h-screen flex justify-center items-center bg-[var(--luxe-background)]">
        <AppLoader label="Loading admin" />
      </div>
    );
  }

  return (
    <div className="admin-portal flex h-full min-w-0 flex-col overflow-hidden bg-[var(--luxe-background)] md:flex-row">
      <SidebarDemo />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-8">
        <div className="mx-auto mt-6 w-full max-w-7xl md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
