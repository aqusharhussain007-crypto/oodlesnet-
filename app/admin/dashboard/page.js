"use client";

import dynamic from "next/dynamic";

const AdminDashboardView = dynamic(
  () => import("@/components/AdminDashboardView"),
  { ssr: false }
);

export default function Page() {
  return <AdminDashboardView />;
    }
