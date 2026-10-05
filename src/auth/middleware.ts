import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Keep vendor onboarding public while protecting the vendor workspace.
  const isVendorRegistration = pathname === '/vendor/register';
  const isProtected = pathname.startsWith('/account') ||
                      pathname.startsWith('/admin') ||
                      (pathname.startsWith('/vendor') && !isVendorRegistration) ||
                      pathname.startsWith('/checkout') ||
                      pathname.startsWith('/wishlist');


  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get('firebaseToken')?.value;

  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('Firebase Project ID is not set');
    }

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    if (payload.email_verified !== true) {
      const url = new URL('/auth/verify-email', request.url);
      url.searchParams.set('redirect', `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware token verification failed:', error);
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    // Clear invalid token
    const response = NextResponse.redirect(url);
    response.cookies.delete('firebaseToken');
    return response;
  }
}

export const config = {
  matcher: [
    '/account/:path*',
    '/admin/:path*',
    '/vendor/:path*',
    '/checkout/:path*',
    '/wishlist',
  ],
};
