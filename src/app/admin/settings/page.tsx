'use client';

import { useEffect, useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import AppLoader from '@/components/AppLoader';

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
        enabled ? 'bg-(--luxe-primary)' : 'bg-(--luxe-outline-light)'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-(--luxe-white) transition-transform duration-200 ${
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
        <AppLoader label="Loading settings" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs tracking-[0.28em] uppercase text-(--luxe-text-muted)">Admin</p>
        <h1 className="mt-4 text-3xl font-display text-(--luxe-text)">Platform Settings</h1>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">

        {/* Commission Rate */}
        <div className="bg-(--luxe-white) border border-(--luxe-outline-light) p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm tracking-[0.18em] uppercase text-(--luxe-text)">Vendor Commission Rate</h2>
              <p className="mt-1 text-xs text-(--luxe-text-muted)">Percentage taken from each vendor sale.</p>
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
                className="w-20 bg-transparent border-b border-(--luxe-outline-light) py-2 px-1 text-center text-sm text-(--luxe-text) focus:outline-none focus:border-(--luxe-primary)"
              />
              <span className="text-sm text-(--luxe-text-muted)">%</span>
            </div>
          </div>
        </div>

        {/* Vendor Registration */}
        <div className="bg-(--luxe-white) border border-(--luxe-outline-light) p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm tracking-[0.18em] uppercase text-(--luxe-text)">Vendor Registration</h2>
              <p className="mt-1 text-xs text-(--luxe-text-muted)">Allow new vendors to apply to the platform.</p>
            </div>
            <Toggle
              enabled={settings.vendorRegistrationOpen}
              onChange={(v) => setSettings((s) => ({ ...s, vendorRegistrationOpen: v }))}
            />
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className={`border p-6 ${settings.maintenanceMode ? 'bg-(--luxe-primary-container) border-(--luxe-secondary)' : 'bg-(--luxe-white) border-(--luxe-outline-light)'}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm tracking-[0.18em] uppercase text-(--luxe-text)">Maintenance Mode</h2>
                {settings.maintenanceMode && (
                  <AlertTriangle className="w-4 h-4 text-(--luxe-secondary)" />
                )}
              </div>
              <p className="mt-1 text-xs text-(--luxe-text-muted)">Take the storefront offline for all non-admin users.</p>
            </div>
            <Toggle
              enabled={settings.maintenanceMode}
              onChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-(--luxe-error) tracking-[0.12em]">{error}</p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-(--luxe-cta) text-(--luxe-white) px-8 py-4 text-xs tracking-[0.24em] uppercase flex items-center gap-2 hover:bg-(--luxe-cta-hover) transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <span className="text-xs tracking-[0.18em] uppercase text-(--luxe-primary)">Saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
