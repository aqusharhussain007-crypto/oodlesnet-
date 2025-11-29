import dynamic from "next/dynamic";

const AdminLoginView = dynamic(
  () => import("@/components/AdminLoginView"),
  { ssr: false }
);

export default function Page() {
  return <AdminLoginView />;
    }
