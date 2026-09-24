'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'Furniture', pieces: '', href: '/shop?category=furniture', image: '/herobg.jpg' },
  { name: 'Lighting', pieces: '', href: '/shop?category=lighting', image: '/light.jpg' },
  { name: 'Dining', pieces: '', href: '/shop?category=objects', image: '/cutlery.jpg' },
  { name: 'Gifts', pieces: '', href: '/shop?category=textiles', image: '/gifts.jpg' },
];

const curatedProducts = [
  { name: 'Travertine Wave Table', subtitle: 'Sculpted center piece', href: '/shop/testing-1789224138013', image: '/wave.jpg' },
  { name: 'Aurora Glass Vessel', href: '/shop', image: '/vase.jpg' },
  { name: 'Obsidia Table Lamp', href: '/shop', image: '/lamp.jpg' },
];

export default function Home() {
  const { mongoUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (mongoUser?.role === 'vendor') {
      router.push('/vendor/dashboard');
    }
  }, [mongoUser, router]);

  if (mongoUser?.role === 'vendor') return null;

  return (
    <div className="bg-[var(--luxe-background)] pb-0">
      <div className="mx-auto w-full overflow-hidden rounded-b-[20px] bg-[var(--luxe-white)] shadow-[0_10px_30px_rgba(136,19,55,0.05)]">
        <section className=" pb-6  lg:pb-10">
          <div className="relative overflow-hidden bg-[var(--luxe-surface-high)]">

            <Image
              src="/herobg2.jpg"
              alt="Luxe Heritage living room"
              width={1600}
              height={920}
              priority
              className="h-[540px] w-full object-cover object-center sm:h-[640px] lg:h-[760px]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.6)_48%,transparent_78%)]" />
            <div className="absolute inset-0 px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
              <div className="w-full md:max-w-[360px] pt-16 sm:pt-20 lg:pt-24 text-center md:text-left">
                <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--luxe-primary)]">Est. 1924 · Heritage Home</p>
                <h1 className="mt-5 font-display text-[42px] leading-[0.98] text-[var(--luxe-text)] sm:text-[56px] lg:text-[64px]">
                  Luminous Living.
                  <br />
                  <span className="italic">Artisan Form.</span>
                </h1>
                <p className="mt-5 w-full md:max-w-[290px] text-[13px] leading-6 text-[var(--luxe-text-muted)] sm:text-sm">
                  Discover the sculptural Series — a study in proportion, hand-finished in walnut, alabaster and oak.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4 justify-center md:justify-start">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-full bg-[var(--luxe-cta)] px-6 py-3 text-[11px] font-medium text-[var(--luxe-white)] transition-colors hover:bg-[var(--luxe-cta-hover)]"
                  >
                    Shop the Collection
                  </Link>
                  <Link
                    href="/#design-philosophy"
                    className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] text-[var(--luxe-secondary)] transition-colors hover:text-[var(--luxe-primary)]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--luxe-secondary)] text-[var(--luxe-secondary)] transition-colors hover:bg-[var(--luxe-secondary)] hover:text-[var(--luxe-white)]">→</span>
                    Our Atelier
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--luxe-white)] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--luxe-primary)]">The Curation</p>
              <h2 className="mt-4 font-display text-[34px] text-[var(--luxe-text)] sm:text-[40px]">Curated Categories</h2>
            </div>
            <Link href="/shop" className="hidden text-[11px] text-[var(--luxe-text)] transition-colors hover:text-[var(--luxe-secondary)] sm:block">
              View All Collections
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.name} href={category.href} className="group block">
                <div className="relative aspect-[0.84] overflow-hidden bg-[var(--luxe-surface)]">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(94,61,73,0.14)_100%)]" />
                </div>
                <div className="pt-4 text-center">
                  <h3 className="font-display text-[22px] text-[var(--luxe-text)]">{category.name}</h3>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--luxe-outline)]">{category.pieces}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="design-philosophy" className="border-t border-[var(--luxe-outline-light)] bg-[#faeaed] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-1 lg:grid-cols-[1.45fr_0.9fr] h-[80vh] lg:h-[50vh]">
            <div className="grid gap-1 sm:grid-cols-1 pr-0 sm:pr-5 ">
              <div className="relative min-h-[260px] overflow-hidden bg-[var(--luxe-deep-burgundy)] sm:min-h-[500px]">
                <Image
                  src="/design.jpg"
                  alt="Architectural interior"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),rgba(45,19,29,0.45))]" />
              </div>

            </div>

            <div className="justify-self-center lg:justify-self-end text-center lg:text-left">
              <h2 className="font-display text-[34px] leading-none text-[var(--luxe-text)] sm:text-[40px]">
                The Design
                <br />
                <span className="italic text-[var(--luxe-dark-rose)]">Philosophy</span>
              </h2>
              <p className="mt-5 text-sm leading-6 text-[var(--luxe-text-muted)]">
                Every object at NM Decor is curated for its soul. We partner with heritage workshops across the globe to bring you pieces that balance timeless architectural principles with modern comfort.
              </p>
              <ul className="mt-6 space-y-4 text-[12px] text-[var(--luxe-text-muted)]">
                <li className="flex items-center gap-3 justify-center lg:justify-start">
                  <span className="text-[var(--luxe-primary)]">λ</span>
                  <span className="ml-1">Architectural integrity</span>
                </li>
                <li className="flex items-center gap-3 justify-center lg:justify-start">
                  <span className="text-[var(--luxe-primary)]">□</span>
                  <span className="ml-1">Ethically sourced raw materials</span>
                </li>
              </ul>
              <Link href="/shop" className="pl-8 mt-6 lg:mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[var(--luxe-primary)] transition-colors hover:text-[var(--luxe-secondary)] mx-auto lg:mx-0">
                Explore Our Atelier <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--luxe-outline-light)] bg-[var(--luxe-white)] px-4 py-[5vh] sm:px-6 lg:px-8 lg:py-16">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--luxe-primary)]">Signature Series</p>
            <h2 className="mt-4 font-display text-[34px] text-[var(--luxe-text)] sm:text-[40px]">The Curated Home</h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.45fr_0.65fr] lg:items-start">
            <Link href={curatedProducts[0].href} className="group block overflow-hidden">
              <div className="relative aspect-[1.08] overflow-hidden lg:aspect-[1.1]">
                <Image
                  src={curatedProducts[0].image}
                  alt={curatedProducts[0].name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                />
              </div>
              <div className="px-3 py-4 sm:px-5">
                <h3 className="font-display text-[26px] text-[var(--luxe-text)]">{curatedProducts[0].name}</h3>
                <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-[var(--luxe-outline)]">{curatedProducts[0].subtitle}</p>
              </div>
            </Link>

            <div className="space-y-5">
              {curatedProducts.slice(1).map((product) => (
                <Link key={product.name} href={product.href} className="group block border border-[var(--luxe-border-soft)] bg-[var(--luxe-surface)] p-4 shadow-[0_8px_24px_rgba(136,19,55,0.04)]">
                  <div className="relative aspect-[1.03] overflow-hidden bg-[var(--luxe-surface-alt)]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(max-width: 1024px) 100vw, 20vw"
                    />
                    <button
                      type="button"
                      aria-label={`Save ${product.name}`}
                      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--luxe-white)]/80 text-[var(--luxe-text)] backdrop-blur-sm transition-colors hover:text-[var(--luxe-primary)]"
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="pt-3">
                    <h3 className="font-display text-[18px] text-[var(--luxe-text)]">{product.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--luxe-border-rose)] bg-[#faeaed] py-8 lg:py-10">
          <div className="bg-[#faeaed] px-6 py-14 text-center sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--luxe-dark-rose)]">Collector&apos;s Circle</p>
            <h2 className="mx-auto mt-5 max-w-[640px] font-display text-[34px] leading-[1.08] text-[var(--luxe-text)] sm:text-[48px]">
              Receive our seasonal lookbook and early access to limited editions.
            </h2>

            <form
              className="mx-auto mt-10 flex max-w-[470px] flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                type="email"
                placeholder="Email Address"
                className="h-12 flex-1 rounded-full border border-[var(--luxe-outline-light)] bg-[var(--luxe-white)]/60 px-5 text-sm text-[var(--luxe-text)] placeholder:text-[var(--luxe-outline)] focus:outline-none focus:ring-2 focus:ring-[rgba(120,84,96,0.25)]"
              />
              <button
                type="submit"
                className="h-12 rounded-full bg-[var(--luxe-cta)] px-7 text-[11px] uppercase tracking-[0.18em] text-[var(--luxe-white)] transition-colors hover:bg-[var(--luxe-cta-hover)]"
              >
                Join the Circle
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
