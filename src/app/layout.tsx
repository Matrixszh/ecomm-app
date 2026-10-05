import type { Metadata } from 'next';
import { Inter, Noto_Serif, Geist } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import SearchModal from '@/components/SearchModal';
import Toast from '@/components/Toast';
import SiteReveal from '@/components/SiteReveal';
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
  title: 'NM Decor',
  description: 'An e-commerce platform for all your furninshing needs.',
  openGraph: {
    title: 'NM Decor',
    description: 'An e-commerce platform for all your furninshing needs',
    images: [{ url: 'https://res.cloudinary.com/dldywjxm1/image/upload/v1790607052/gemini-svg_urt6pr_zpbpjs.jpg' }],
  },
};

function SiteFooter() {
  return (
    <footer className="mt-auto bg-[#430F1B] text-[#E8DCD7]">
      <div className="mx-auto max-w-[1250px] px-6 py-12 sm:px-8 lg:px-10 lg:py-16">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_0.7fr_1.15fr_0.9fr] md:gap-12 lg:gap-16">

          {/* Brand */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Link
              href="/"
              className="group flex flex-col items-center md:items-start"
            >
              <span className="font-display text-[13px] uppercase tracking-[0.16em] text-[#E8DCD7]">
                NM
              </span>

              <span className="mt-[-2px] font-display text-[27px] leading-none tracking-[0.08em] text-[#E8DCD7]">
                DECOR
              </span>
            </Link>

            <p className="mt-3 max-w-[210px] text-[11px] leading-[1.7] text-[#C7B4B1]">
              Defining serene design through collectible forms.
              Every detail with a story of artistry.
            </p>

            {/* Social Icons */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href="#"
                aria-label="Pinterest"
                className="text-[11px] text-[#C7B4B1] transition-colors hover:text-[#F1E7E3]"
              >
                P
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="text-[11px] text-[#C7B4B1] transition-colors hover:text-[#F1E7E3]"
              >
                F
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="text-[11px] text-[#C7B4B1] transition-colors hover:text-[#F1E7E3]"
              >
                ◎
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="text-[11px] text-[#C7B4B1] transition-colors hover:text-[#F1E7E3]"
              >
                in
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.12em] text-[#E8DCD7]">
              Pages
            </h4>

            <ul className="mt-5 space-y-3 text-[11px] text-[#C7B4B1]">
              <li>
                <Link
                  href="/shop"
                  className="transition-colors hover:text-[#F1E7E3]"
                >
                  Services
                </Link>
              </li>

              <li>
                <Link
                  href="/shop"
                  className="transition-colors hover:text-[#F1E7E3]"
                >
                  Flotte
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-[#F1E7E3]"
                >
                  Actualités
                </Link>
              </li>

              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-[#F1E7E3]"
                >
                  La Maison
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-[#F1E7E3]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.12em] text-[#E8DCD7]">
              Contact
            </h4>

            <div className="mt-5 space-y-3 text-[11px] text-[#C7B4B1]">
              <a
                href="mailto:contact@nmdecor.com"
                className="block uppercase transition-colors hover:text-[#F1E7E3]"
              >
                contact@nmdecor.com
              </a>

              <p className="uppercase">
                36 Rue de Scheffer, 75016 Paris
              </p>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex flex-col items-center md:items-start">
            <a
              href="https://wa.me/"
              className="inline-flex items-center gap-2 bg-[#62303D] px-4 py-2.5 text-[10px] uppercase tracking-[0.05em] text-[#E8DCD7] transition-colors hover:bg-[#713B49]"
            >
              <span className="text-[12px]">◉</span>
              Écrivez-nous sur WhatsApp
            </a>

            <a
              href="tel:+33123456789"
              className="mt-2 text-[11px] text-[#E8DCD7] underline underline-offset-4 transition-colors hover:text-white"
            >
              +33 6 65 79 17 73
            </a>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="mt-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#67303D]" />

          <span className="shrink-0 font-display text-[10px] uppercase tracking-[0.12em] text-[#A98E91]">
            Transport & Conciergerie
          </span>

          <div className="h-px flex-1 bg-[#67303D]" />
        </div>

        {/* Bottom Bar */}
        <div className="mt-5 flex flex-col items-center justify-between gap-4 text-[10px] text-[#A98E91] md:flex-row">

          {/* Legal */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 md:justify-start">
            <Link
              href="/legal"
              className="underline-offset-2 transition-colors hover:text-[#E8DCD7] hover:underline"
            >
              Mentions Légales
            </Link>

            <Link
              href="/privacy"
              className="underline-offset-2 transition-colors hover:text-[#E8DCD7] hover:underline"
            >
              Politique de confidentialité
            </Link>

            <Link
              href="/terms"
              className="underline-offset-2 transition-colors hover:text-[#E8DCD7] hover:underline"
            >
              CGU
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-center md:text-right">
            © 2026 NM Decor. Tous droits réservés
          </p>
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
        <SiteReveal />
      </body>
    </html>
  );
}
