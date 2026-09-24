'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  IconCategory,
  IconDashboard,
  IconPackage,
  IconSettings,
  IconShoppingBag,
  IconUser,
} from '@tabler/icons-react';

type SidebarVariant = 'admin' | 'vendor';

type SidebarDemoProps = {
  variant?: SidebarVariant;
};

const adminLinks = [
  { label: 'Dashboard', href: '/admin', icon: IconDashboard },
  { label: 'Products', href: '/admin/products', icon: IconPackage },
  { label: 'Orders', href: '/admin/orders', icon: IconShoppingBag },
  { label: 'Categories', href: '/admin/categories', icon: IconCategory },
  { label: 'Settings', href: '/admin/settings', icon: IconSettings },
];

const vendorLinks = [
  { label: 'Dashboard', href: '/vendor/dashboard', icon: IconDashboard },
  { label: 'Products', href: '/vendor/products', icon: IconPackage },
  { label: 'Orders', href: '/vendor/orders', icon: IconShoppingBag },
  { label: 'Profile', href: '/vendor/profile', icon: IconUser },
];

export default function SidebarDemo({ variant = 'admin' }: SidebarDemoProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = variant === 'vendor' ? vendorLinks : adminLinks;
  const basePath = variant === 'vendor' ? '/vendor' : '/admin';

  return (
    <Sidebar open={open} setOpen={setOpen} animate>
      <SidebarBody className="h-full justify-between gap-8 border-r border-[#d0c5af] bg-[#fffdf9] px-4 py-5">
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <LuxeLogo label={variant === 'vendor' ? 'Vendor Portal' : 'Administration'} /> : <LuxeLogoIcon />}
          <nav className="mt-10 flex flex-col gap-2" aria-label={`${variant} navigation`}>
            {links.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <SidebarLink
                  key={href}
                  link={{
                    label,
                    href,
                    icon: (
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isActive ? 'text-[#876c32]' : 'text-[#776b62]'
                        )}
                      />
                    ),
                  }}
                  className={cn(
                    'rounded-lg px-3 py-3 transition-colors hover:bg-[#f6eee7]',
                    isActive && 'bg-[#f5eadc]'
                  )}
                />
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#ece3dc] pt-4">
          <SidebarLink
            link={{
              label: variant === 'vendor' ? 'Seller Workspace' : 'Luxe Administration',
              href: basePath,
              icon: <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ead9bf] font-display text-xs text-[#715b36]">L</span>,
            }}
            className="rounded-lg px-3 py-2 hover:bg-[#f6eee7]"
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

function LuxeLogo({ label }: { label: string }) {
  return (
    <Link href="/" className="relative z-20 flex items-center gap-3 py-1 text-[#2d251f]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ead9bf] font-display text-sm text-[#715b36]">L</span>
      <span className="flex flex-col whitespace-pre">
        <span className="font-display text-lg tracking-[0.12em]">LUXE</span>
        <span className="text-[9px] uppercase tracking-[0.16em] text-[#958675]">{label}</span>
      </span>
    </Link>
  );
}

function LuxeLogoIcon() {
  return (
    <Link href="/" className="relative z-20 flex items-center py-1 text-[#2d251f]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ead9bf] font-display text-sm text-[#715b36]">L</span>
    </Link>
  );
}
