'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import GhostFibers from '@/components/GhostFibers';

export default function Page() {
  const { firebaseUser, mongoUser } = useAuthStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mongoUser?.role === 'vendor') {
      router.push('/vendor/dashboard');
    }
  }, [firebaseUser, mongoUser, router]);

  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    setStoreSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      const token = await auth.currentUser?.getIdToken();
      if (token) {
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Lax${secure}`;
      }

      // Sync Firebase user to MongoDB first — vendor registration depends on this
      const syncRes = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!syncRes.ok) throw new Error('Failed to sync account. Please try again.');

      // Create vendor profile
      const vendorRes = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeName, storeSlug, bio }),
      });
      if (!vendorRes.ok) {
        const data = await vendorRes.json();
        throw new Error(data.error || 'Failed to create vendor profile.');
      }

      // Refresh user auth to get updated vendor role
      const refreshRes = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!refreshRes.ok) {
        throw new Error('Failed to refresh auth. Please refresh the page.');
      }

      const updatedUserData = await refreshRes.json();
      // Update store with new vendor role
      const { setUser } = useAuthStore.getState();
      setUser(cred.user, updatedUserData.user);

      router.push('/vendor/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate h-full flex flex-col md:flex-row overflow-hidden bg-(--luxe-background)">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <GhostFibers
          lineColor="#785460"
          glowColor="#f4c6d4"
          speed={0.83}
          scale={2}
          rotation={0}
          rotationSpeed={0.25}
          layers={4}
          waveAmplitude={0.015}
          waveFrequency={3}
          waveSpeed={0.15}
          layerSpeed={0.08}
          twist={0.1}
          twistFrequency={5}
          twistSpeed={1.2}
          lineFrequency={5}
          lineSpacing={2}
          lineSharpness={16}
          glowFalloff={10}
          glowIntensity={1.6}
          brightness={2}
          blueBoost={1.25}
          vignette={0.8}
          grain={0.05}
          dpr={1}
          lightMode={false}
          fps={60}
          paused={false}
        />
      </div>
      <div className="relative z-10  md:flex md:w-2/5 flex-col justify-center items-center p-12 overflow-hidden border-r border-(--luxe-outline-light) bg-(--luxe-white)/5 backdrop-blur-sm">
        <div className="relative z-10 text-center">
          <p className="text-xs tracking-[0.28em] uppercase text-white">NM Decor</p>
          <h1 className="mt-6 text-5xl font-display font-normal text-white tracking-[0.18em] uppercase">NM decor</h1>
          <p className="mt-4 text-sm text-white max-w-sm">
            Join for early access to launches and private drops.
          </p>
        </div>
      </div>
      <div className="relative z-10 w-full md:w-3/5 flex flex-col justify-center items-center p-8 sm:p-12 bg-(--luxe-background)/55 backdrop-blur-sm">
        <div className="w-full max-w-xl">
          <p className="text-xs tracking-[0.28em] uppercase text-[var(--luxe-text-muted)]">Become a Seller</p>
          <h2 className="mt-4 text-3xl font-display font-normal text-[var(--luxe-text)] mb-2">Create a Seller Account</h2>
          <p className="text-sm text-[var(--luxe-text-muted)] mb-6">Sign up and set up your store.</p>

          <div className="mb-8 grid grid-cols-2 gap-3" aria-label="Choose account type">
            <Link
              href="/auth/register"
              className="border border-(--luxe-outline-light) bg-white px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-(--luxe-text-muted) transition-colors hover:border-(--luxe-primary) hover:text-(--luxe-primary)"
            >
              Customer
            </Link>
            <Link
              href="/vendor/register"
              aria-current="page"
              className="border border-(--luxe-outline-light) bg-(--luxe-primary-container) px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-(--luxe-primary) transition-colors"
            >
              Vendor
            </Link>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs tracking-[0.24em] uppercase text-[var(--luxe-text-muted)] mb-2">Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-transparent border-b border-[var(--luxe-outline-light)] py-3 px-1 text-sm text-[var(--luxe-text)] focus:outline-none focus:border-[var(--luxe-gold)]"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.24em] uppercase text-[var(--luxe-text-muted)] mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full bg-transparent border-b border-[var(--luxe-outline-light)] py-3 px-1 text-sm text-[var(--luxe-text)] focus:outline-none focus:border-[var(--luxe-gold)]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.24em] uppercase text-[var(--luxe-text-muted)] mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full bg-transparent border-b border-[var(--luxe-outline-light)] py-3 px-1 text-sm text-[var(--luxe-text)] focus:outline-none focus:border-[var(--luxe-gold)]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suppressHydrationWarning
              />
            </div>

            <div className="pt-4 ">
              <p className="text-xs tracking-[0.24em] uppercase text-[var(--luxe-text-muted)] mb-4">Store Details</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs tracking-[0.24em] uppercase text-[var(--luxe-text-muted)] mb-2">Store Name</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={60}
                    className="w-full bg-transparent border-b border-[var(--luxe-outline-light)] py-3 px-1 text-sm text-[var(--luxe-text)] focus:outline-none focus:border-[var(--luxe-gold)]"
                    placeholder="My Awesome Store"
                    value={storeName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.24em] uppercase text-[var(--luxe-text-muted)] mb-2">Store URL value</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={40}
                    pattern="[a-z0-9-]+"
                    className="w-full bg-transparent border-b border-[var(--luxe-outline-light)] py-3 px-1 text-sm text-[var(--luxe-text)] focus:outline-none focus:border-[var(--luxe-gold)]"
                    placeholder="my-awesome-store"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(e.target.value)}
                    suppressHydrationWarning
                  />
                  <p className="text-xs text-[var(--luxe-text-muted)] mt-1">/vendors/{storeSlug || 'your-store-name'}</p>
                </div>
                <div>
                  <label className="block text-xs tracking-[0.24em] uppercase text-[var(--luxe-text-muted)] mb-2">About Your Store</label>
                  <textarea
                    required
                    minLength={20}
                    maxLength={500}
                    rows={3}
                    className="w-full bg-transparent border-b border-[var(--luxe-outline-light)] py-3 px-1 text-sm text-[var(--luxe-text)] focus:outline-none focus:border-[var(--luxe-gold)] resize-none"
                    placeholder="Tell customers what your store is about..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-[var(--luxe-text)] text-[var(--luxe-white)] py-4 text-xs tracking-[0.24em] uppercase hover:bg-[var(--luxe-cta-hover)] disabled:opacity-60 transition-colors mt-2"
            >
              {submitting ? 'Creating...' : 'Create Seller Account'}
            </button>
            {error && <p className="text-sm text-[var(--luxe-error)]">{error}</p>}
          </form>

          <p className="mt-10 text-center text-sm text-[var(--luxe-text-muted)]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[var(--luxe-text)] underline underline-offset-8 decoration-[var(--luxe-gold)] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
