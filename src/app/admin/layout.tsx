import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { adminListAlumni } from "@/lib/data/alumni";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Newton House" },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireAdmin();
  const pending = (await adminListAlumni()).filter((a) => a.status === "pending").length;
  return (
    <AdminShell email={viewer.email} demo={viewer.demo} pendingCount={pending}>
      {children}
    </AdminShell>
  );
}
