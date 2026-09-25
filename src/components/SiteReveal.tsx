'use client';

import { useEffect, useRef, useState } from 'react';

export default function SiteReveal() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const fadeTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    fadeTimerRef.current = window.setTimeout(() => {
      setIsLeaving(true);
      hideTimerRef.current = window.setTimeout(() => setIsVisible(false), 1000);
    }, 1000);

    return () => {
      if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current);
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden={isLeaving}
      className={`fixed inset-0 z-[100] flex min-h-dvh items-center justify-center overflow-hidden bg-(--luxe-background) px-5 py-8 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
        isLeaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-[#d3c3c6]/70 sm:inset-6" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-(--luxe-primary-container)" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <p className="text-[10px] uppercase tracking-[0.34em] text-(--luxe-primary) sm:text-xs">
          A considered collection for the home
        </p>
        <h1 className="mt-6 font-display text-[clamp(3rem,12vw,7rem)] font-normal leading-none tracking-[0.12em] text-(--luxe-text) sm:tracking-[0.2em]">
          NM Decor
        </h1>
        <div aria-hidden="true" className="mt-7 h-px w-16 bg-(--luxe-gold)" />
        <p className="mt-6 max-w-sm text-sm leading-6 text-(--luxe-text-muted)">
          Discover pieces shaped by craft, character, and a love of enduring design.
        </p>

      </div>
    </div>
  );
}
