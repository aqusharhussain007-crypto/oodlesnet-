"use client";

import SkeletonLoader from "@/components/SkeletonLoader";

export default function CategorySkeleton() {
  return (
    <div className="products-grid">
      <SkeletonLoader type="product" />
      <SkeletonLoader type="product" />
      <SkeletonLoader type="product" />
      <SkeletonLoader type="product" />
    </div>
  );
    }
    
