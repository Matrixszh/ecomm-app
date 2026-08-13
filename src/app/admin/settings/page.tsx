'use client';

import { useEffect, useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

type Settings = {
  commissionRate: number;
  vendorRegistrationOpen: boolean;
  maintenanceMode: boolean;
};

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 transition-colors duration-200 focus:outline-none ${
        enabled ? 'bg-[#d4af37]' : 'bg-[#d0c5af]'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white transition-transform duration-200 ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    commissionRate: 10,
    vendorRegistrationOpen: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWithAuth('/api/admin/settings');
        setSettings({
          commissionRate: Math.round((data.commissionRate ?? 0.1) * 100),
          vendorRegistrationOpen: data.vendorRegistrationOpen ?? true,
          maintenanceMode: data.maintenanceMode ?? false,
        });
      } catch (err) {
        console.error('Failed to load settings', err);
        setError('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
    await fetchWithAuth('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commissionRate: settings.commissionRate / 100,
        vendorRegistrationOpen: settings.vendorRegistrationOpen,
        maintenanceMode: settings.maintenanceMode,
      }),
    });
    } catch (err) {
      console.error('Failed to save settings', err);
      setError('Failed to save settings.');
      return;
    } finally {
      setSaving(false);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);  
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin h-8 w-8 border-2 border-[#d0c5af] border-t-[#d4af37]" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Admin</p>
        <h1 className="mt-4 text-3xl font-playfair text-[#1c1c18]">Platform Settings</h1>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">

        {/* Commission Rate */}
        <div className="bg-[#ffffff] border border-[#d0c5af] p-6">
          <div className="flex items-start justify-between gap-8">
            <div>
              <h2 className="text-sm tracking-[0.18em] uppercase text-[#1c1c18]">Vendor Commission Rate</h2>
              <p className="mt-1 text-xs text-[#7f7663]">Percentage taken from each vendor sale.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={settings.commissionRate}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, commissionRate: Number(e.target.value) }))
                }
                className="w-20 bg-transparent border-b border-[#d0c5af] py-2 px-1 text-center text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
              />
              <span className="text-sm text-[#7f7663]">%</span>
            </div>
          </div>
        </div>

        {/* Vendor Registration */}
        <div className="bg-[#ffffff] border border-[#d0c5af] p-6">
          <div className="flex items-start justify-between gap-8">
            <div>
              <h2 className="text-sm tracking-[0.18em] uppercase text-[#1c1c18]">Vendor Registration</h2>
              <p className="mt-1 text-xs text-[#7f7663]">Allow new vendors to apply to the platform.</p>
            </div>
            <Toggle
              enabled={settings.vendorRegistrationOpen}
              onChange={(v) => setSettings((s) => ({ ...s, vendorRegistrationOpen: v }))}
            />
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className={`border p-6 ${settings.maintenanceMode ? 'bg-[#fff8f0] border-[#c07a00]' : 'bg-[#ffffff] border-[#d0c5af]'}`}>
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm tracking-[0.18em] uppercase text-[#1c1c18]">Maintenance Mode</h2>
                {settings.maintenanceMode && (
                  <AlertTriangle className="w-4 h-4 text-[#c07a00]" />
                )}
              </div>
              <p className="mt-1 text-xs text-[#7f7663]">Take the storefront offline for all non-admin users.</p>
            </div>
            <Toggle
              enabled={settings.maintenanceMode}
              onChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-[#8f0402] tracking-[0.12em]">{error}</p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#d4af37] text-[#1c1c18] px-8 py-4 text-xs tracking-[0.24em] uppercase flex items-center gap-2 hover:bg-[#c29a30] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <span className="text-xs tracking-[0.18em] uppercase text-[#2f6f44]">Saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
