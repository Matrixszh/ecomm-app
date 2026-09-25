'use client';
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SidebarDemo from '@/components/sidebar-demo';
import { useVendorStore } from '@/store/vendorStore';
import { useAuthStore } from '@/store/authStore';
import AppLoader from '@/components/AppLoader';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import './vendor-theme.css';

const VendorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isVendorRegistration = pathname === '/vendor/register';
  const { vendorProfile, loading, fetchVendorProfile } = useVendorStore();
  const firebaseUser = useAuthStore((state) => state.firebaseUser);

  useEffect(() => {
    if (!firebaseUser) return;
    firebaseUser.getIdToken().then((token) => fetchVendorProfile(token));
  }, [firebaseUser, fetchVendorProfile]);

  if (loading && !vendorProfile) {
    return <div className="vendor-portal min-h-screen flex items-center justify-center"><AppLoader label="Loading vendor portal" /></div>;
  }

  return (
    <div className="vendor-portal flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--luxe-background)] md:flex-row">
      {!isVendorRegistration && <SidebarDemo variant="vendor" />}
      <main className="h-full min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

export default VendorLayout;
