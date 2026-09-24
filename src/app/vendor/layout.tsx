'use client';
import React, { useEffect } from 'react';
import SidebarDemo from '@/components/sidebar-demo';
import { useVendorStore } from '@/store/vendorStore';
import { useAuthStore } from '@/store/authStore';
import AppLoader from '@/components/AppLoader';

const VendorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { vendorProfile, loading, fetchVendorProfile } = useVendorStore();
  const firebaseUser = useAuthStore((state) => state.firebaseUser);

  useEffect(() => {
    if (!firebaseUser) return;
    firebaseUser.getIdToken().then((token) => fetchVendorProfile(token));
  }, [firebaseUser, fetchVendorProfile]);

  if (loading && !vendorProfile) {
    return <div className="min-h-screen flex items-center justify-center"><AppLoader label="Loading vendor portal" /></div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-104px)] min-w-0 flex-1 flex-col overflow-hidden bg-[#fcf9f3] md:flex-row">
      <SidebarDemo variant="vendor" />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-8">{children}</main>
    </div>
  );
};

export default VendorLayout;
