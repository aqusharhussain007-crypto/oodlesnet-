"use client";

import dynamic from "next/dynamic";

const AddProductView = dynamic(
  () => import("@/components/AddProductView"),
  { ssr: false }
);

export default function Page() {
  return <AddProductView />;
    }
