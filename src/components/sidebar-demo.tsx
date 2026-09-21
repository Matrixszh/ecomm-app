'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import {
  IconCategory,
  IconDashboard,
  IconPackage,
  IconSettings,
  IconShoppingBag,
} from '@tabler/icons-react';

const adminLinks = [
  { label: 'Dashboard', href: '/admin', icon: IconDashboard },
  { label: 'Products', href: '/admin/products', icon: IconPackage },
  { label: 'Orders', href: '/admin/orders', icon: IconShoppingBag },
  { label: 'Categories', href: '/admin/categories', icon: IconCategory },
  { label: 'Settings', href: '/admin/settings', icon: IconSettings },
];

export default function SidebarDemo() {
  const pathname = usePathname();
  // Start closed so the mobile drawer does not cover the admin content on first render.
  const [open, setOpen] = useState(false);

  return (
    <Sidebar open={open} setOpen={setOpen} animate>
      <SidebarBody className="h-full justify-between gap-8 border-r border-[#d0c5af] bg-[#fffdf9] px-4 py-5">
        <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <AdminLogo /> : <AdminLogoIcon />}
          <nav className="mt-10 flex flex-col gap-2" aria-label="Admin navigation">
            {adminLinks.map(({ label, href, icon: Icon }) => {
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
              label: 'Luxe Administration',
              href: '/admin',
              icon: <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ead9bf] font-display text-xs text-[#715b36]">L</span>,
            }}
            className="rounded-lg px-3 py-2 hover:bg-[#f6eee7]"
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}

function AdminLogo() {
  return (
    <a href="/admin" className="relative z-20 flex items-center gap-3 py-1 text-[#2d251f]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ead9bf] font-display text-sm text-[#715b36]">L</span>
      <span className="whitespace-pre font-display text-lg tracking-[0.12em]">LUXE</span>
    </a>
  );
}

function AdminLogoIcon() {
  return (
    <a href="/admin" className="relative z-20 flex items-center py-1 text-[#2d251f]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ead9bf] font-display text-sm text-[#715b36]">L</span>
    </a>
  );
}
