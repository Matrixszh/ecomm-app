import { sendEmailVerification, type User } from 'firebase/auth';

export function safeInternalRedirect(path: string | null | undefined): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return '/';
  }
  return path;
}

export async function sendVerificationEmail(user: User, redirectTo: string) {
  const continueUrl = new URL('/auth/verify-email', window.location.origin);
  continueUrl.searchParams.set('redirect', safeInternalRedirect(redirectTo));
  continueUrl.searchParams.set('verified', '1');
  if (user.email) continueUrl.searchParams.set('email', user.email);

  await sendEmailVerification(user, { url: continueUrl.toString() });
}

export function getFirebaseAuthErrorMessage(error: unknown, fallback = 'We could not complete your request. Please try again.'): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists. Sign in or reset your password.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Choose a stronger password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/invalid-login-credentials': 'Incorrect email or password.',
    'auth/user-not-found': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Please wait and try again later.',
    'auth/network-request-failed': 'A network error occurred. Check your connection and try again.',
    'auth/user-disabled': 'This account is disabled. Please contact support.',
    'auth/user-token-expired': 'Your session has expired. Sign in again to continue.',
    'auth/invalid-user-token': 'Your session is no longer valid. Sign in again to continue.',
    'auth/operation-not-allowed': 'Email and password sign-in is not enabled for this project.',
    'auth/invalid-action-code': 'This verification link is invalid or has expired. Request a new one.',
    'auth/expired-action-code': 'This verification link is invalid or has expired. Request a new one.',
  };

  if (code) return messages[code] || fallback;
  return error instanceof Error ? error.message : fallback;
}

export function getVerificationEmailError(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : '';

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait before requesting another verification email.';
  }
  if (code === 'auth/network-request-failed') {
    return 'A network error prevented the email from being sent. Check your connection and try again.';
  }
  if (code === 'auth/invalid-action-code' || code === 'auth/expired-action-code') {
    return 'This verification link is invalid or has expired. Request a new email to continue.';
  }
  return 'We could not send the verification email. Please try again.';
}
