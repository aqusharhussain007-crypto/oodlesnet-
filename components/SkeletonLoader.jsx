"use client";

/**
 * Universal Skeleton Loader
 *
 * Backward compatible:
 * - type="trending"
 * - type="product"
 *
 * New universal usage:
 * - <SkeletonLoader height={120} />
 * - <SkeletonLoader rows={4} height={260} />
 * - <SkeletonLoader rows={5} width={120} height={150} horizontal />
 */

export default function SkeletonLoader({
  /* legacy support */
  type,

  /* universal props */
  rows = 1,
  width = "100%",
  height = 160,
  horizontal = false,
  gap = 12,
  rounded = "xl",
  className = "",
}) {
  /* -------- LEGACY TYPES (DO NOT BREAK EXISTING CODE) -------- */
  if (type === "trending") {
    return (
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-1 pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="min-w-[120px] h-[150px] bg-gray-200 shimmer rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (type === "product") {
    return (
      <div className="w-full bg-gray-200 shimmer rounded-xl h-[260px] mb-4" />
    );
  }

  /* -------- UNIVERSAL MODE -------- */
  const radius =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
      ? "rounded-lg"
      : "rounded-xl";

  return (
    <div
      className={`${
        horizontal
          ? "flex overflow-x-auto no-scrollbar"
          : "flex flex-col"
      }`}
      style={{ gap }}
      aria-hidden="true"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 shimmer ${radius} ${className}`}
          style={{
            width,
            minWidth: horizontal ? width : undefined,
            height,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
      }
                                            
