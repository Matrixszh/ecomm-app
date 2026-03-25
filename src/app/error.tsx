'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-20 h-20 bg-[#ffffff] border border-[#d0c5af] flex items-center justify-center mb-8">
        <AlertCircle className="w-10 h-10 text-[#7f7663]" />
      </div>
      <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Error</p>
      <h2 className="mt-4 text-2xl font-playfair text-[#1c1c18] mb-4">Something went wrong</h2>
      <p className="text-sm text-[#4d4635] mb-10 max-w-md text-center">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <button
        onClick={() => reset()}
        className="px-10 py-4 bg-[#d4af37] text-[#1c1c18] text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
