"use client";
import Image from "next/image";
import SkeletonLoader from "./SkeletonLoader";

export default function TrendingSlider({ items = [], loading }) {
  if (loading || !items.length) {
    return <SkeletonLoader type="trending" />;
  }

  return (
    <div className="flex overflow-x-auto gap-3 no-scrollbar pb-2 px-1">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => (window.location = `/product/${item.id}`)}
          className="min-w-[120px] bg-white rounded-xl p-2 shadow-md cursor-pointer text-center"
        >
          <Image
            src={item.imageUrl}
            width={120}
            height={120}
            alt={item.name}
            className="rounded-lg object-cover"
          />
          <p className="text-sm font-semibold mt-1 text-blue-600 truncate">
            {item.name}
          </p>
        </div>
      ))}
    </div>
  );
}
