import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-20 h-20 bg-[#ffffff] border border-[#d0c5af] flex items-center justify-center mb-8">
        <FileQuestion className="w-10 h-10 text-[#7f7663]" />
      </div>
      <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">404</p>
      <h2 className="mt-4 text-4xl font-playfair text-[#1c1c18] mb-4">Page Not Found</h2>
      <p className="text-sm text-[#4d4635] mb-10 max-w-md text-center">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        href="/"
        className="px-10 py-4 bg-[#d4af37] text-[#1c1c18] text-xs tracking-[0.24em] uppercase hover:bg-[#c29a30] transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
