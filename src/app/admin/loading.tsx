export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-[#e5e2dc] animate-pulse" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#ffffff] border border-[#d0c5af] p-6 animate-pulse">
            <div className="h-4 w-24 bg-[#e5e2dc] mb-4" />
            <div className="h-8 w-16 bg-[#e5e2dc]" />
          </div>
        ))}
      </div>

      <div className="h-96 bg-[#ffffff] border border-[#d0c5af] animate-pulse" />
    </div>
  );
}
