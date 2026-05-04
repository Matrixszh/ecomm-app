import { create } from 'zustand';
import type { VendorProfileSummary } from '@/types';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface VendorState {
  vendorProfile: VendorProfileSummary | null;
  loading: boolean;
  fetchVendorProfile: (token: string) => Promise<void>;
  updateVendorProfile: (token: string, data: Partial<Pick<VendorProfileSummary, 'storeName' | 'bio' | 'socialLinks'>>) => Promise<void>;
  clearVendorProfile: () => void;
  fetchVendorEarnings: () => Promise<void>;
}

export const useVendorStore = create<VendorState>((set) => ({
  vendorProfile: null,
  loading: false,

  fetchVendorProfile: async (token) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/vendor/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch vendor profile');
      const data = await res.json();
      set({ vendorProfile: data.profile });
    } catch (error) {
      console.error(error);
      set({ vendorProfile: null });
    } finally {
      set({ loading: false });
    }
  },

  updateVendorProfile: async (token, profileData) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/vendor/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error('Failed to update vendor profile');
      const data = await res.json();
      set({ vendorProfile: data.profile });
    } catch (error) {
      console.error(error);
    } finally {
      set({ loading: false });
    }
  },

  clearVendorProfile: () => set({ vendorProfile: null }),

  fetchVendorEarnings: async () => {
    await fetchWithAuth('/api/vendor/earnings')
      .then((data) => {
        set((state) => ({
          vendorProfile: state.vendorProfile ? { ...state.vendorProfile, totalEarnings: data.earnings } : null,
        }));
      })
      .catch((err) => console.error('Failed to fetch vendor earnings:', err));
  },
}));
