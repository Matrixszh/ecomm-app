'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [transitionKey, setTransitionKey] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    const raf = window.requestAnimationFrame(() => {
      setTransitionKey((k) => k + 1);
      setVisible(true);
      timeoutRef.current = window.setTimeout(() => setVisible(false), 950);
    });
    return () => {
      window.cancelAnimationFrame(raf);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  return (
    <div className="relative flex-1 flex flex-col">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={transitionKey}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.05 },
            }}
            style={{ pointerEvents: 'all' }}
          >
            <div className="absolute inset-0 bg-black" />
            <div className="absolute inset-0 bg-black" />
            <motion.div
              initial={{ opacity: 0, y: 12, letterSpacing: '0.25em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.35em' }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative text-[#fcf9f3] text-4xl sm:text-[10rem] tracking-[0.35em] uppercase font-light"
            >
              NURSPURPLE
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}
