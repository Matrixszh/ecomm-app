'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/Skeleton';
import { Search as SearchIcon } from 'lucide-react';
import type { ProductSummary } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 w-full flex-1">
      <div className="mb-10">
        <p className="text-xs tracking-[0.28em] uppercase text-[#7f7663]">Search</p>
        <h1 className="mt-4 text-3xl font-playfair text-[#1c1c18]">Results</h1>
        {query && (
          <p className="mt-3 text-sm text-[#4d4635]">
            Showing results for <span className="text-[#1c1c18] underline underline-offset-8 decoration-[#d4af37]">{`"${query}"`}</span>
          </p>
        )}
      </div>

      {!query ? (
        <div className="py-20 text-center border border-[#d0c5af] bg-[#ffffff]">
          <SearchIcon className="w-14 h-14 text-[#7f7663] mx-auto mb-6" />
          <p className="text-sm text-[#4d4635]">Enter a search term to find products.</p>
        </div>
      ) : loading ? (
        <ProductGridSkeleton count={8} />
      ) : results.length === 0 ? (
        <div className="py-20 text-center bg-[#ffffff] border border-[#d0c5af]">
          <SearchIcon className="w-14 h-14 text-[#7f7663] mx-auto mb-6" />
          <h2 className="text-xl font-playfair text-[#1c1c18] mb-3">No results</h2>
          <p className="text-sm text-[#4d4635] max-w-md mx-auto">
            We could not find any products matching {`"${query}"`}. Try checking your spelling or using different keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12"><ProductGridSkeleton count={8} /></div>}>
      <SearchContent />
    </Suspense>
  );
}
