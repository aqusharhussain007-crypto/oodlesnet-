export default function SkeletonLoader({ type }) {
  if (type === "trending") {
    return (
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-1 pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="min-w-[120px] h-[150px] bg-gray-200 shimmer rounded-xl"
          ></div>
        ))}
      </div>
    );
  }

  if (type === "product") {
    return (
      <div className="w-full bg-gray-200 shimmer rounded-xl h-[260px] mb-4"></div>
    );
  }

  return null;
}
