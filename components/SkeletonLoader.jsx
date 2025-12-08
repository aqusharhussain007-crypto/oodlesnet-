export default function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">

      {/* Search Bar Skeleton */}
      <div className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00c3ff33] to-[#00ff9933] shimmer" />

      {/* Trending Skeleton */}
      <div className="mt-4 h-6 w-40 rounded-md bg-gradient-to-r from-[#00c3ff33] to-[#00ff9933] shimmer" />
      <div className="flex gap-4 mt-2 overflow-hidden">
        {[1,2,3].map(i => (
          <div key={i} className="w-28 h-20 rounded-xl bg-gradient-to-r from-[#00c3ff33] to-[#00ff9933] shimmer" />
        ))}
      </div>

      {/* Category Skeleton */}
      <div className="mt-4 h-6 w-36 rounded-md bg-gradient-to-r from-[#00c3ff33] to-[#00ff9933] shimmer" />
      <div className="flex gap-4 mt-2 overflow-x-auto pb-2">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className="w-20 h-20 rounded-2xl bg-gradient-to-r from-[#00c3ff33] to-[#00ff9933] shimmer"
          />
        ))}
      </div>

      {/* Banner Skeleton */}
      <div className="w-full h-32 rounded-xl bg-gradient-to-r from-[#00c3ff33] to-[#00ff9933] shimmer" />

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className="h-48 rounded-xl bg-gradient-to-r from-[#00c3ff33] to-[#00ff9933] shimmer"
          />
        ))}
      </div>

    </div>
  );
      }
