'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

function CartBadge() {
  const { itemCount } = useCartStore();
  const count = itemCount();

  if (count <= 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#58004d] text-[10px] font-semibold text-[#ffffff]">
      {count}
    </span>
  );
}

const CartBadgeNoSSR = dynamic(() => Promise.resolve(CartBadge), {
  ssr: false,
});

export default function Navbar() {
  const { logout } = useAuth();
  const { mongoUser, loading } = useAuthStore();
  const { openCart, openSearch } = useUIStore();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';

  const isHome = pathname === '/';

  const desktopNavItems = isHome
    ? [
        {
          href: '/shop',
          label: 'Collections',
          active: false,
        },
        {
          href: '/shop?category=accessories',
          label: 'Atelier',
          active: false,
        },
        {
          href: '/#design-philosophy',
          label: 'Heritage',
          active: false,
        },
        {
          href: '/shop?category=gifts',
          label: 'Designers',
          active: false,
        },
      ]
    : [
        {
          href: '/shop?sort=newest',
          label: 'New Arrivals',
          active: pathname === '/shop' && sort === 'newest',
        },
        {
          href: '/shop',
          label: 'Collections',
          active:
            pathname === '/shop' &&
            !category &&
            sort !== 'newest',
        },
        {
          href: '/shop?category=jewelry',
          label: 'Jewelry',
          active:
            pathname === '/shop' &&
            category === 'jewelry',
        },
        {
          href: '/shop?category=gifts',
          label: 'Gifts',
          active:
            pathname === '/shop' &&
            category === 'gifts',
        },
        {
          href: '/#about',
          label: 'About',
          active: false,
        },
      ];

  const mobileNavItems = isHome
    ? [
        {
          href: '/shop',
          label: 'Collections',
        },
        {
          href: '/shop?category=accessories',
          label: 'Atelier',
        },
        {
          href: '/#design-philosophy',
          label: 'Heritage',
        },
        {
          href: '/shop?category=gifts',
          label: 'Designers',
        },
      ]
    : [
        {
          href: '/shop?sort=newest',
          label: 'New Arrivals',
        },
        {
          href: '/shop',
          label: 'Collections',
        },
        {
          href: '/shop?category=jewelry',
          label: 'Jewelry',
        },
        {
          href: '/shop?category=gifts',
          label: 'Gifts',
        },
        {
          href: '/#about',
          label: 'About',
        },
      ];

  const linkClass = (active: boolean) =>
    `inline-flex items-center text-[11px] tracking-[0.22em] uppercase pb-2 border-b ${
      active
        ? 'text-[var(--luxe-secondary)] border-[var(--luxe-secondary)]'
        : 'text-[var(--luxe-text-muted)] border-transparent hover:text-[var(--luxe-secondary)] hover:border-[var(--luxe-outline-light)]'
    }`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--luxe-border-rose)]/50 bg-[var(--luxe-white)]/70 shadow-[0_4px_18px_rgba(136,19,55,0.04)] backdrop-blur-md">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[72px] items-center">
          <div className="flex w-full items-center gap-4">
            {/* Desktop Navigation */}
            <div className="hidden min-w-0 flex-1 items-center gap-7 md:flex">
              <Link
                href="/"
                className={`shrink-0 text-[var(--luxe-text)] ${
                  isHome
                    ? 'font-display text-base tracking-[0.14em]'
                    : 'font-playfair text-2xl tracking-[0.05em]'
                }`}
              >
                {isHome ? 'NMDecor' : 'NMDecor'}
              </Link>

              <div className="flex min-w-0 items-center gap-6">
                {desktopNavItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={linkClass(item.active)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex min-w-0 flex-1 items-center gap-3 md:hidden">
              <button
                className="p-2 text-[var(--luxe-text)] transition-colors hover:text-[var(--luxe-secondary)]"
                onClick={() => {
                  const nextOpen = !mobileMenuOpen;

                  setMobileMenuOpen(nextOpen);

                  if (!nextOpen) {
                    setMobileAccountOpen(false);
                  }
                }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              <Link
                href="/"
                className={`font-display text-lg ${
                  isHome
                    ? 'tracking-[0.12em]'
                    : 'tracking-[0.08em]'
                }`}
              >
                {isHome ? 'NMDecor' : 'NMDecor'}
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
              {/* Search */}
              <button
                type="button"
                onClick={openSearch}
                className="hidden h-9 min-w-[250px] items-center gap-2 rounded-full border border-[var(--luxe-outline-light)] bg-[var(--luxe-surface)] px-4 text-left text-[11px] tracking-[0.04em] text-[var(--luxe-text)] transition-colors hover:border-[var(--luxe-primary)] md:flex"
                aria-label="Search heritage pieces"
              >
                <Search
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.7}
                />

                <span>
                  {isHome
                    ? 'Search heritage pieces...'
                    : 'Search the collection...'}
                </span>
              </button>

              {/* Mobile Search */}
              {isHome ? (
                <button
                  type="button"
                  onClick={openSearch}
                  className="p-2 text-[var(--luxe-text)] transition-colors hover:text-[var(--luxe-secondary)] md:hidden"
                  aria-label="Search"
                >
                  <Search
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.7}
                  />
                </button>
              ) : null}

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 text-[var(--luxe-text)] transition-colors hover:text-[var(--luxe-secondary)]"
                aria-label="Wishlist"
              >
                <Heart
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.6}
                />
              </Link>

              {/* Account */}
              {!loading && (
                <>
                  {mongoUser ? (
                    <div
                      className="relative"
                      ref={dropdownRef}
                    >
                      <button
                        onClick={() =>
                          setDropdownOpen(!dropdownOpen)
                        }
                        className="flex items-center p-2 focus:outline-none"
                        aria-label="Account menu"
                      >
                        <User
                          className="h-[18px] w-[18px] text-[var(--luxe-text)]"
                          strokeWidth={1.6}
                        />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute right-0 z-50 mt-2 w-52 border border-[var(--luxe-outline-light)] bg-[var(--luxe-white)] py-1 shadow-lg">
                          <div className="border-b border-[var(--luxe-border-rose)] px-4 py-3">
                            <p className="truncate text-sm font-medium text-[#1c1c18]">
                              {mongoUser.name}
                            </p>

                            <p className="truncate text-xs text-[var(--luxe-outline)]">
                              {mongoUser.email}
                            </p>
                          </div>

                          {mongoUser.role === 'admin' && (
                            <Link
                              href="/admin"
                              onClick={() =>
                                setDropdownOpen(false)
                              }
                              className="block px-4 py-2 text-sm text-[#4d4635] hover:bg-[#fcf9f3] hover:text-[#1c1c18]"
                            >
                              Admin Dashboard
                            </Link>
                          )}

                          <Link
                            href="/account"
                            onClick={() =>
                              setDropdownOpen(false)
                            }
                            className="block px-4 py-2 text-sm text-[#4d4635] hover:bg-[#fcf9f3] hover:text-[#1c1c18]"
                          >
                            My Profile
                          </Link>

                          <Link
                            href="/account/orders"
                            onClick={() =>
                              setDropdownOpen(false)
                            }
                            className="block px-4 py-2 text-sm text-[#4d4635] hover:bg-[#fcf9f3] hover:text-[#1c1c18]"
                          >
                            My Orders
                          </Link>

                          <button
                            onClick={() => {
                              logout();
                              setDropdownOpen(false);
                            }}
                            className="block w-full border-t border-[#ece2d9] px-4 py-2 text-left text-sm text-[#8f0402] hover:bg-[#fcf9f3]"
                          >
                            Sign out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="p-2 text-[#4f443b] transition-colors hover:text-[#1c1612]"
                      aria-label="Sign in"
                    >
                      <User
                        className="h-[18px] w-[18px]"
                        strokeWidth={1.6}
                      />
                    </Link>
                  )}
                </>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-[#4f443b] transition-colors hover:text-[#1c1612]"
                aria-label="Cart"
              >
                <ShoppingBag
                  className="h-[18px] w-[18px]"
                  strokeWidth={1.6}
                />

                <CartBadgeNoSSR />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-[#eee7e1] bg-white px-4 pt-2 pb-6 md:hidden">
            <div className="space-y-1">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-3 text-sm uppercase tracking-[0.16em] text-[#4d4635] hover:text-[#1c1c18]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {!loading && (
              <>
                {mongoUser ? (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileAccountOpen((v) => !v)
                      }
                      className="flex w-full items-center justify-between px-3 py-3 text-sm uppercase tracking-[0.16em] text-[#1c1c18] hover:text-[#1c1c18]"
                      aria-expanded={mobileAccountOpen}
                    >
                      Profile

                      <span className="text-xs text-[#7f7663]">
                        {mobileAccountOpen ? '—' : '+'}
                      </span>
                    </button>

                    {mobileAccountOpen && (
                      <div className="px-3 pb-2">
                        {mongoUser.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileAccountOpen(false);
                            }}
                            className="block px-3 py-2 text-sm text-[#4d4635] hover:text-[#1c1c18]"
                          >
                            Admin Dashboard
                          </Link>
                        )}

                        <Link
                          href="/account"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileAccountOpen(false);
                          }}
                          className="block px-3 py-2 text-sm text-[#4d4635] hover:text-[#1c1c18]"
                        >
                          My Profile
                        </Link>

                        <Link
                          href="/account/orders"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileAccountOpen(false);
                          }}
                          className="block px-3 py-2 text-sm text-[#4d4635] hover:text-[#1c1c18]"
                        >
                          My Orders
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                            setMobileAccountOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-left text-sm text-[#8f0402] hover:text-[#8f0402]"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-4 block w-full px-3 py-3 text-left text-sm uppercase tracking-[0.16em] text-[#1c1c18] underline decoration-[#d4af37] underline-offset-8"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
