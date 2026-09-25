'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import GhostFibers from '@/components/GhostFibers';

export default function Register() {
  const { firebaseUser, mongoUser } = useAuthStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseUser || mongoUser) {
      router.push('/');
    }
  }, [firebaseUser, mongoUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError('Please fill all fields.');
      return;
    }
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user && name) {
        await updateProfile(cred.user, { displayName: name });
      }
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Lax${secure}`;
      }
      router.push('/');
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
      <div className="relative z-10 hidden md:flex md:w-1/2 flex-col justify-center items-center p-12 overflow-hidden border-r border-(--luxe-outline-light) bg-(--luxe-white)/75 backdrop-blur-sm">
        <div className="relative z-10 text-center">
          <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Maison</p>
          <h1 className="mt-6 text-5xl font-playfair text-[#1c1c18] tracking-[0.18em] uppercase">Maison</h1>
          <p className="mt-4 text-sm text-[#4d4635] max-w-sm">
            Join the list for early access to launches and private drops.
          </p>
        </div>
      </div>
      <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 bg-(--luxe-background)/85 backdrop-blur-sm">
        <div className="w-full max-w-md">
          <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Create Account</p>
          <h2 className="mt-4 text-3xl font-playfair text-[#1c1c18] mb-2">Create an Account</h2>
          <p className="text-sm text-[#4d4635] mb-6">Sign up to get started.</p>

          <div className="mb-8 grid grid-cols-2 gap-3" aria-label="Choose account type">
            <Link
              href="/auth/register"
              aria-current="page"
              className="border border-[var(--luxe-outline-light)] bg-[var(--luxe-primary-container)] px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-[var(--luxe-primary)] transition-colors"
            >
              Customer
            </Link>
            <Link
              href="/vendor/register"
              className="border border-[var(--luxe-outline-light)] bg-white px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-[var(--luxe-text-muted)] transition-colors hover:border-[var(--luxe-primary)] hover:text-[var(--luxe-primary)]"
            >
              Vendor
            </Link>
          </div>

          <div className="space-y-6">
            <div className="w-full bg-[#ffffff] border border-[#d0c5af] text-[#7f7663] font-medium py-4 text-center text-sm">
              Google Sign-In is disabled
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d0c5af]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#fcf9f3] text-xs tracking-[0.24em] uppercase text-[#7f7663]">Email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  suppressHydrationWarning={true}
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning={true}
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.24em] uppercase text-[#7f7663] mb-2">Password</label>
                <input
                  type="password"
                  className="w-full bg-transparent border-b border-[#d0c5af] py-3 px-1 text-sm text-[#1c1c18] focus:outline-none focus:border-[#d4af37]"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suppressHydrationWarning={true}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#d4af37] text-[#1c1c18] py-4 text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
          </div>

          <p className="mt-10 text-center text-sm text-[#4d4635]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37] font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
