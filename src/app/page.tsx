'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'Furniture', pieces: '56 Pieces', href: '/shop?category=furniture', image: '/category.jpeg' },
  { name: 'Lighting', pieces: '34 Pieces', href: '/shop?category=lighting', image: '/cat2.jpeg' },
  { name: 'Objects', pieces: '82 Pieces', href: '/shop?category=objects', image: '/herojewel.jpeg' },
  { name: 'Textiles', pieces: '48 Pieces', href: '/shop?category=textiles', image: '/cat3.jpeg' },
];

const curatedProducts = [
  { name: 'Travertine Wave Table', subtitle: 'Sculpted center piece', href: '/shop', image: '/category.jpeg' },
  { name: 'Aurora Glass Vessel', href: '/shop', image: '/herojewel.jpeg' },
  { name: 'Obsidia Table Lamp', href: '/shop', image: '/cat2.jpeg' },
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
    <div className="bg-[#fbf7f2]  pb-0  ">
      <div className="mx-auto w-full overflow-hidden rounded-b-[20px] bg-[#fffdfa] shadow-[0_10px_30px_rgba(104,84,72,0.04)]">
        <section className=" pb-6 pt-1 lg:pb-10">
          <div className="relative overflow-hidden  bg-[#d8cab7]">
           
            <Image
              src="/category.jpeg"
              alt="Luxe Heritage living room"
              width={1600}
              height={920}
              priority
              className="h-[540px] w-full object-cover object-center sm:h-[640px] lg:h-[760px]"
            />
            <div className="absolute inset-0 px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
              <div className="max-w-[360px] pt-16 sm:pt-20 lg:pt-24">
                <p className="text-[10px] uppercase tracking-[0.34em] text-[#533a53]">Est. 1924 · Heritage Home</p>
                <h1 className="mt-5 font-display text-[42px] leading-[0.98] text-[#ffffff] sm:text-[56px] lg:text-[64px]">
                  Luminous Living.
                  <br />
                  <span className="italic">Artisan Form.</span>
                </h1>
                <p className="mt-5 max-w-[290px] text-[13px] leading-6 text-[#533a53] sm:text-sm">
                  Discover the sculptural Series — a study in proportion, hand-finished in walnut, alabaster and oak.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-full bg-[#ffffff] px-6 py-3 text-[11px] font-medium text-[#000000]"
                  >
                    Shop the Collection
                  </Link>
                  <Link
                    href="/#design-philosophy"
                    className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] text-[#ffffff]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ffffff] text-[#ffffff]">→</span>
                    Our Atelier
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#a6978a]">The Curation</p>
              <h2 className="mt-4 font-display text-[34px] text-[#2f2822] sm:text-[40px]">Curated Categories</h2>
            </div>
            <Link href="/shop" className="hidden text-[11px] text-[#6d6259] sm:block">
              View All Collections
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link key={category.name} href={category.href} className="group block">
                <div className="relative aspect-[0.84] overflow-hidden bg-[#efe5d9]">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,245,0.04)_0%,rgba(92,70,51,0.14)_100%)]" />
                </div>
                <div className="pt-4 text-center">
                  <h3 className="font-display text-[22px] text-[#39312a]">{category.name}</h3>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[#aa9e93]">{category.pieces}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="design-philosophy" className="border-t border-[#f0e7df] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.45fr_0.9fr]">
            <div className="grid gap-4 sm:grid-cols-[1.3fr_0.55fr]">
              <div className="relative min-h-[260px] overflow-hidden bg-[#2f241d] sm:min-h-[320px]">
                <Image
                  src="/cat3.jpeg"
                  alt="Architectural interior"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,246,236,0.18),rgba(22,14,10,0.45))]" />
              </div>
              <div className="relative flex min-h-[220px] items-end justify-center bg-[#f6eedf] p-5 sm:min-h-[320px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle,#f7efd9_1px,transparent_1px)] [background-size:7px_7px] opacity-45" />
                <div className="relative h-[155px] w-[120px] border-[10px] border-[#fffdf9] bg-[#f0e2c7] shadow-[0_10px_25px_rgba(91,68,42,0.12)] sm:h-[210px] sm:w-[150px]" />
              </div>
            </div>

            <div className="max-w-[360px] justify-self-end">
              <h2 className="font-display text-[34px] leading-none text-[#39312a] sm:text-[40px]">
                The Design
                <br />
                <span className="italic text-[#55463d]">Philosophy</span>
              </h2>
              <p className="mt-5 text-sm leading-6 text-[#7a6f66]">
                Every object at LUXE is curated for its soul. We partner with heritage workshops across the globe to bring you pieces that balance timeless architectural principles with modern comfort.
              </p>
              <ul className="mt-6 space-y-4 text-[12px] text-[#74695f]">
                <li className="flex items-center gap-3">
                  <span className="text-[#b19067]">λ</span>
                  Architectural integrity
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#b19067]">□</span>
                  Ethically sourced raw materials
                </li>
              </ul>
              <Link href="/shop" className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#7f6d61]">
                Explore Our Atelier <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-[#f0e7df] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#a6978a]">Signature Series</p>
            <h2 className="mt-4 font-display text-[34px] text-[#2f2822] sm:text-[40px]">The Curated Home</h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.45fr_0.65fr] lg:items-start">
            <Link href={curatedProducts[0].href} className="group block overflow-hidden bg-[#f0e7dc]">
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
                <h3 className="font-display text-[26px] text-[#312922]">{curatedProducts[0].name}</h3>
                <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-[#998d82]">{curatedProducts[0].subtitle}</p>
              </div>
            </Link>

            <div className="space-y-5">
              {curatedProducts.slice(1).map((product) => (
                <Link key={product.name} href={product.href} className="group block bg-[#fcf9f5] p-4">
                  <div className="relative aspect-[1.18] overflow-hidden bg-[#f1e7dc]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(max-width: 1024px) 100vw, 30vw"
                    />
                    <button
                      type="button"
                      aria-label={`Save ${product.name}`}
                      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#fffdf9]/90 text-[#9f9183]"
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="pt-3">
                    <h3 className="font-display text-[18px] text-[#3b332d]">{product.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="bg-[#f8e7eb] px-6 py-14 text-center sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#b59ea3]">Collector&apos;s Circle</p>
            <h2 className="mx-auto mt-5 max-w-[640px] font-display text-[34px] leading-[1.08] text-[#47393a] sm:text-[48px]">
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
                className="h-12 flex-1 rounded-full border border-[#f1dadd] bg-[#fffdfb] px-5 text-sm text-[#5d4d4f] placeholder:text-[#b9a7aa] focus:outline-none"
              />
              <button
                type="submit"
                className="h-12 rounded-full bg-[#1f1b19] px-7 text-[11px] uppercase tracking-[0.18em] text-[#fff9f4]"
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
