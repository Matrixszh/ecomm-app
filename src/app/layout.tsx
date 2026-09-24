import type { Metadata } from 'next';
import { Inter, Noto_Serif, Geist } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import Toast from '@/components/Toast';
import Link from 'next/link';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const playfair = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const dmSans = Inter({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Maison | Luxury E-Commerce',
  description: 'A luxury e-commerce experience with boutique craftsmanship.',
  openGraph: {
    title: 'Maison | Luxury E-Commerce',
    description: 'A luxury e-commerce experience with boutique craftsmanship.',
    images: [{ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' }],
  },
};

function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--luxe-border-rose)] bg-[var(--luxe-white)]">
      <div className="mx-auto max-w-full bg-[var(--luxe-white)] px-4 py-10">
        <div className="grid gap-10 border-b border-[var(--luxe-border-rose)] pb-8 text-center md:grid-cols-[1.3fr_1fr_1fr_0.8fr] md:text-left">
          <div>
            <Link href="/" className="font-display text-sm uppercase tracking-[0.14em] text-[var(--luxe-text)]">
              NM Decor
            </Link>
            <p className="mx-auto mt-4 max-w-xs text-[11px] leading-5 text-[var(--luxe-outline)] md:mx-0">
              Defining serene design through collectible forms. Every detail with a story of artistry.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] uppercase tracking-[0.18em] text-[var(--luxe-text)]">Services</h4>
            <ul className="mt-4 space-y-2 text-[11px] text-[var(--luxe-outline)]">
              <li>
                <Link href="/shop" className="transition-colors hover:text-[var(--luxe-secondary)]">
                  Bespoke Interiors
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-[#3b332d]">
                  Restoration
                </Link>
              </li>
              <li>
                <Link href="/vendor/register" className="hover:text-[#3b332d]">
                  White Glove Delivery
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] uppercase tracking-[0.18em] text-[var(--luxe-text)]">Legal</h4>
            <ul className="mt-4 space-y-2 text-[11px] text-[var(--luxe-outline)]">
              <li>
                <Link href="/account" className="transition-colors hover:text-[var(--luxe-secondary)]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#3b332d]">
                  Terms of Sale
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-[#3b332d]">
                  Delivery Standards
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] uppercase tracking-[0.18em] text-[var(--luxe-text)]">Social</h4>
            <div className="mt-4 flex justify-center gap-3 text-[var(--luxe-outline)] md:justify-start">
              <a href="#" aria-label="Pinterest" className="rounded-full border border-[#e6dbd4] px-2 py-1 text-[11px] hover:text-[#3b332d]">
                P
              </a>
              <a href="#" aria-label="Instagram" className="rounded-full border border-[#e6dbd4] px-2 py-1 text-[11px] hover:text-[#3b332d]">
                I
              </a>
              <a href="#" aria-label="Mail" className="rounded-full border border-[#e6dbd4] px-2 py-1 text-[11px] hover:text-[#3b332d]">
                @
              </a>
            </div>
          </div>
        </div>

        <div className="pt-5 text-center text-[10px] uppercase tracking-[0.18em] text-[#a3978d]">
          © 2026 NM Company. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(playfair.variable, dmSans.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased flex flex-col">
        <Suspense fallback={<div className="h-[92px] w-full bg-[#f6e7eb]" />}>
          <Navbar />
        </Suspense>
        <main className="pt-[72px] flex flex-1 flex-col">{children}</main>
        <CartDrawer />
        <SearchModal />
        <Toast />
        <SiteFooter />
      </body>
    </html>
  );
}
