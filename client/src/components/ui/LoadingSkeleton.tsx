export function TripCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="h-44 shimmer-bg rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 shimmer-bg rounded-lg" />
        <div className="h-4 w-1/2 shimmer-bg rounded-lg" />
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-16 shimmer-bg rounded-full" />
          <div className="h-6 w-16 shimmer-bg rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3 animate-pulse">
      <div className="w-10 h-10 shimmer-bg rounded-xl" />
      <div className="h-8 w-16 shimmer-bg rounded-lg" />
      <div className="h-4 w-24 shimmer-bg rounded-lg" />
    </div>
  );
}

export function ItinerarySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shimmer-bg rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-40 shimmer-bg rounded-lg" />
              <div className="h-4 w-32 shimmer-bg rounded-lg" />
            </div>
          </div>
          <div className="space-y-2 ml-13">
            <div className="h-12 shimmer-bg rounded-xl" />
            <div className="h-12 shimmer-bg rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="w-full h-[500px] shimmer-bg rounded-2xl animate-pulse" />
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-10 w-64 shimmer-bg rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TripCardSkeleton />
        <TripCardSkeleton />
        <TripCardSkeleton />
      </div>
    </div>
  );
}
