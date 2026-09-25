'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import GhostFibers from '@/components/GhostFibers';
import AppLoader from '@/components/AppLoader';

function LoginContent() {
  const { firebaseUser, mongoUser } = useAuthStore();
  //get role
  const role = mongoUser?.role;
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = role === 'vendor'
    ? '/vendor/dashboard'
    : role === 'admin'
    ? '/admin'
    : searchParams.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (firebaseUser && mongoUser) {
      router.push(redirect);
    }
  }, [firebaseUser, mongoUser, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Lax${secure}`;
      }
      // redirect handled by useEffect once mongoUser loads with correct role
    } catch (err: unknown) {
      const firebaseCode = typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code?: unknown }).code)
        : '';
      const messages: Record<string, string> = {
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/invalid-login-credentials': 'Incorrect email or password.',
        'auth/user-not-found': 'Incorrect email or password.',
        'auth/wrong-password': 'Incorrect email or password.',
        'auth/too-many-requests': 'Too many sign-in attempts. Please try again later.',
        'auth/operation-not-allowed': 'Email/password sign-in is not enabled for this Firebase project.',
      };
      const msg = messages[firebaseCode] || (err instanceof Error ? err.message : 'Failed to sign in');
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
          <h1 className="mt-6 text-5xl font-playfair text-white tracking-[0.18em] uppercase">NM Decor</h1>
          <p className="mt-4 text-sm text-white max-w-sm">
            A curated selection with an editorial sensibility.
          </p>
        </div>
      </div>
      <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 bg-(--luxe-background)/55 backdrop-blur-sm">
        <div className="w-full max-w-md">
          <p className="text-xs tracking-[0.28em] uppercase text-(--luxe-outline)">Sign In</p>
          <h2 className="mt-4 text-3xl font-playfair text-(--luxe-text) mb-2">Welcome Back</h2>
          <p className="text-sm text-(--luxe-text-muted) mb-10">Sign in to continue.</p>

          <div className="space-y-6">
            <div className="w-full bg-(--luxe-white) border border-(--luxe-outline-light) text-(--luxe-outline) font-medium py-4 text-center text-sm">
              Google Sign-In is disabled
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-(--luxe-outline-light)"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-(--luxe-background) text-xs tracking-[0.24em] uppercase text-(--luxe-outline)">Email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs tracking-[0.24em] uppercase text-(--luxe-outline) mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm text-(--luxe-text) focus:outline-none focus:border-(--luxe-primary)"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  suppressHydrationWarning={true}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs tracking-[0.24em] uppercase text-(--luxe-outline)">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs tracking-[0.18em] uppercase text-(--luxe-text) underline underline-offset-8 decoration-(--luxe-gold)">Forgot?</Link>
                </div>
                <input
                  type="password"
                  className="w-full bg-transparent border-b border-(--luxe-outline-light) py-3 px-1 text-sm text-(--luxe-text) focus:outline-none focus:border-(--luxe-primary)"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  suppressHydrationWarning={true}
                />
              </div>
              {error && <p className="text-sm text-(--luxe-error)">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-(--luxe-cta) text-(--luxe-white) py-4 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-cta-hover) disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="mt-10 text-center text-sm text-(--luxe-text-muted)">
            Do not have an account?{' '}
            <Link href="/auth/register" className="text-(--luxe-text) underline underline-offset-8 decoration-(--luxe-gold) font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><AppLoader label="Loading sign in" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
