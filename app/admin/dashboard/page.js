"use client";
import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("@/components/AdminDashboardView"), {
  ssr: false,
});

export default function Page() {
  return <Dashboard />;
    }
