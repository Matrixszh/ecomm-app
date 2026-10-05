'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User as FirebaseUser } from 'firebase/auth';
import GhostFibers from '@/components/GhostFibers';
import AppLoader from '@/components/AppLoader';
import { auth } from '@/lib/firebase';
import { getFirebaseAuthErrorMessage, getVerificationEmailError, safeInternalRedirect, sendVerificationEmail } from '@/lib/emailVerification';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import type { MongoUser } from '@/types';

const RESEND_COOLDOWN_SECONDS = 60;

function readCooldown(key: string): number {
  try {
    const storedUntil = Number(window.localStorage.getItem(key));
    return Number.isFinite(storedUntil) ? storedUntil : 0;
  } catch {
    return 0;
  }
}

function writeCooldown(key: string, availableAt: number) {
  try {
    window.localStorage.setItem(key, String(availableAt));
  } catch {
    // The in-memory cooldown still applies if browser storage is unavailable.
  }
}

function clearCooldown(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore unavailable browser storage.
  }
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { firebaseUser, loading: authLoading, setUser } = useAuthStore();
  const [emailFromUrl, setEmailFromUrl] = useState('');
  const [redirectTo, setRedirectTo] = useState('/');
  const [linkCompleted, setLinkCompleted] = useState(false);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const cooldownEndRef = useRef(0);
  const autoCheckStartedRef = useRef(false);

  const userEmail = firebaseUser?.email || emailFromUrl || auth.currentUser?.email || '';
  const resendStorageKey = firebaseUser?.uid ? `email-verification-resend:${firebaseUser.uid}` : null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmailFromUrl(params.get('email') || '');
    setRedirectTo(safeInternalRedirect(params.get('redirect')));
    setLinkCompleted(params.get('verified') === '1');
    if (params.get('emailSent') === '1') setEmailSent(true);
    if (params.get('emailSent') === '0') setEmailSent(false);
    if (params.get('error')) {
      setError('This verification link is invalid or has expired. Request a new email to continue.');
    }
  }, []);

  useEffect(() => {
    if (!resendStorageKey) {
      cooldownEndRef.current = 0;
      setCooldownSeconds(0);
      return;
    }

    cooldownEndRef.current = readCooldown(resendStorageKey);

    const updateCooldown = () => {
      const remaining = Math.max(0, Math.ceil((cooldownEndRef.current - Date.now()) / 1000));
      setCooldownSeconds(remaining);
      if (remaining === 0) clearCooldown(resendStorageKey);
    };

    updateCooldown();
    const interval = window.setInterval(updateCooldown, 1000);
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== resendStorageKey) return;
      cooldownEndRef.current = event.newValue ? Number(event.newValue) || 0 : 0;
      updateCooldown();
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [resendStorageKey]);

  const finishVerifiedLogin = useCallback(async (user: FirebaseUser) => {
    const token = await user.getIdToken(true);
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `firebaseToken=${token}; path=/; max-age=3600; SameSite=Lax${secure}`;

    let profile: MongoUser | null = useAuthStore.getState().mongoUser;
    if (!profile) {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json() as { user?: MongoUser; error?: string };
      if (!response.ok || !result.user) {
        throw new Error(result.error || 'Your email is verified, but we could not refresh your account. Please try again.');
      }
      profile = result.user;
    }

    setUser(user, profile);
    const destination = profile.role === 'vendor'
      ? '/vendor/dashboard'
      : profile.role === 'admin'
        ? '/admin'
        : redirectTo;
    router.replace(destination);
  }, [redirectTo, router, setUser]);

  const checkVerificationStatus = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('Please sign in to check your verification status.');
      return;
    }

    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      await user.reload();
      if (!user.emailVerified) {
        setMessage('Your email is not verified yet. Open the link in your inbox, then check again.');
        return;
      }
      await finishVerifiedLogin(user);
    } catch (checkError: unknown) {
      setError(getFirebaseAuthErrorMessage(checkError, 'We could not check your verification status. Please try again.'));
    } finally {
      setChecking(false);
    }
  }, [finishVerifiedLogin]);

  useEffect(() => {
    if (!linkCompleted || authLoading || !firebaseUser || autoCheckStartedRef.current) return;
    autoCheckStartedRef.current = true;
    void checkVerificationStatus();
  }, [authLoading, checkVerificationStatus, firebaseUser, linkCompleted]);

  useEffect(() => {
    if (linkCompleted && !authLoading && !firebaseUser) {
      setMessage('After verifying your email, sign in to continue.');
    }
  }, [authLoading, firebaseUser, linkCompleted]);

  const handleResend = async () => {
    const user = auth.currentUser;
    if (!user) {
      setError('Please sign in before requesting another verification email.');
      return;
    }
    cooldownEndRef.current = Math.max(cooldownEndRef.current, resendStorageKey ? readCooldown(resendStorageKey) : 0);
    if (cooldownEndRef.current > Date.now()) {
      setCooldownSeconds(Math.ceil((cooldownEndRef.current - Date.now()) / 1000));
      return;
    }

    setResending(true);
    setError(null);
    setMessage(null);
    try {
      await sendVerificationEmail(user, redirectTo);
      const availableAt = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
      cooldownEndRef.current = availableAt;
      if (resendStorageKey) writeCooldown(resendStorageKey, availableAt);
      setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      setEmailSent(true);
      setMessage(`A new verification email was sent to ${user.email || 'your email address'}.`);
    } catch (resendError: unknown) {
      setError(getVerificationEmailError(resendError));
      const code = typeof resendError === 'object' && resendError !== null && 'code' in resendError
        ? String((resendError as { code?: unknown }).code)
        : '';
      if (code === 'auth/too-many-requests') {
        const availableAt = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
        cooldownEndRef.current = availableAt;
        if (resendStorageKey) writeCooldown(resendStorageKey, availableAt);
        setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      }
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await logout();
      router.replace('/auth/login');
    } catch {
      setError('We could not sign you out. Please try again.');
    }
  };

  return (
    <div className="relative isolate min-h-screen flex flex-col md:flex-row overflow-hidden bg-(--luxe-background)">
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
      <div className="relative z-10 hidden md:flex md:w-2/5 flex-col justify-center items-center p-12 overflow-hidden border-r border-(--luxe-outline-light) bg-(--luxe-white)/5 backdrop-blur-sm">
        <div className="relative z-10 text-center">
          <p className="text-xs tracking-[0.28em] uppercase text-white">NM Decor</p>
          <h1 className="mt-6 text-5xl font-playfair text-white tracking-[0.18em] uppercase">NM Decor</h1>
          <p className="mt-4 text-sm text-white max-w-sm">A curated selection with an editorial sensibility.</p>
        </div>
      </div>
      <div className="relative z-10 w-full md:w-3/5 flex flex-col justify-center items-center p-8 sm:p-12 bg-(--luxe-background)/55 backdrop-blur-sm">
        <div className="w-full max-w-xl">
          <p className="text-xs tracking-[0.28em] uppercase text-(--luxe-text-muted)">Email verification</p>
          <h2 className="mt-4 text-3xl font-display font-normal text-(--luxe-text) mb-2">Please verify your email</h2>
          <p className="text-sm text-(--luxe-text-muted) mb-6">
            {emailSent === false
              ? 'Your account was created, but the verification email could not be sent. You can request another one below.'
              : emailSent === true
                ? <>We sent a verification link to <span className="font-medium text-(--luxe-text)">{userEmail || 'your email address'}</span>. Open it to continue.</>
                : <>Your account email <span className="font-medium text-(--luxe-text)">{userEmail || 'address'}</span> is not verified yet. Use the link in your inbox or request another one below.</>}
          </p>

          {authLoading && !firebaseUser ? (
            <div className="py-6"><AppLoader label="Checking your account" /></div>
          ) : firebaseUser || auth.currentUser ? (
            <div className="space-y-4">
              {error && <p role="alert" className="text-sm text-(--luxe-error)">{error}</p>}
              {message && <p role="status" className="text-sm text-(--luxe-text-muted)">{message}</p>}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldownSeconds > 0}
                className="w-full bg-(--luxe-cta) text-(--luxe-white) py-4 text-xs tracking-[0.24em] uppercase hover:bg-(--luxe-cta-hover) disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              >
                {resending ? 'Sending…' : cooldownSeconds > 0 ? `Resend available in ${cooldownSeconds} seconds` : 'Resend verification email'}
              </button>
              <button
                type="button"
                onClick={() => void checkVerificationStatus()}
                disabled={checking}
                className="w-full border border-(--luxe-secondary) bg-transparent py-4 text-xs tracking-[0.24em] uppercase text-(--luxe-secondary) transition-colors hover:bg-(--luxe-secondary)/5 disabled:opacity-60"
              >
                {checking ? 'Checking…' : "I've verified my email"}
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="w-full py-3 text-xs uppercase tracking-[0.2em] text-(--luxe-text-muted) underline underline-offset-4"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div>
              {error && <p role="alert" className="mb-4 text-sm text-(--luxe-error)">{error}</p>}
              {message && <p role="status" className="mb-4 text-sm text-(--luxe-text-muted)">{message}</p>}
              <p className="mb-6 text-sm text-(--luxe-text-muted)">Sign in after verifying to continue. We’ll check your email status when you log in.</p>
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(redirectTo)}`}
                className="block w-full bg-(--luxe-cta) px-6 py-4 text-center text-xs uppercase tracking-[0.24em] text-(--luxe-white) transition-colors hover:bg-(--luxe-cta-hover)"
              >
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
