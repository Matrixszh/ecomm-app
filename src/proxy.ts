import type { NextRequest } from 'next/server';
import { middleware as authMiddleware } from '@/auth/middleware';

export function proxy(request: NextRequest) {
  return authMiddleware(request);
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
