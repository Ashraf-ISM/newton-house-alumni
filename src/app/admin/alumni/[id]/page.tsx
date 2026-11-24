import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setAlumniStatus } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { ProfileForm } from "@/components/forms/profile-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { adminGetAlumni } from "@/lib/data/alumni";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Edit alumnus" };

export default async function AdminAlumniEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await adminGetAlumni(id);
  if (!a) notFound();
  return (
    <>
      <AdminHeader
        title={a.fullName}
        description={`${a.department} · Class of ${a.graduationYear} · registered ${formatDate(a.createdAt)}`}
        actions={
          <Link href="/admin/alumni" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            <ArrowLeft aria-hidden /> All alumni
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Profile" className="xl:col-span-2">
          <div className="p-6 sm:p-8">
            <ProfileForm alum={a} mode="admin" />
          </div>
        </Panel>
        <div className="space-y-6">
          <Panel title="Moderation">
            <div className="space-y-4 p-6">
              <p className="text-sm">
                Status:{" "}
                <Badge
                  variant={
                    a.status === "approved"
                      ? "success"
                      : a.status === "pending" || a.status === "info_required"
                        ? "warning"
                        : "danger"
                  }
                >
                  {a.status === "info_required" ? "Additional Info Required" : a.status}
                </Badge>
              </p>
              {a.reviewedBy ? (
                <p className="text-xs text-muted-strong">
                  Reviewed by <span className="font-medium text-ink">{a.reviewedBy}</span>
                  {a.reviewedAt ? ` on ${formatDate(a.reviewedAt)}` : ""}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <ActionButton size="sm" variant="navy" disabled={a.status === "approved"} action={setAlumniStatus.bind(null, a.id, "approved")}>
                  Approve
                </ActionButton>
                <ActionButton size="sm" variant="outline" disabled={a.status === "info_required"} action={setAlumniStatus.bind(null, a.id, "info_required")}>
                  Request additional info
                </ActionButton>
                <ActionButton size="sm" variant="outline" disabled={a.status === "rejected"} action={setAlumniStatus.bind(null, a.id, "rejected")}>
                  Reject
                </ActionButton>
                <ActionButton size="sm" variant="ghost" disabled={a.status === "pending"} action={setAlumniStatus.bind(null, a.id, "pending")}>
                  Return to pending
                </ActionButton>
              </div>
            </div>
          </Panel>
          <Panel title="Private details">
            <dl className="space-y-3 p-6 text-sm">
              <div>
                <dt className="text-xs text-muted-strong">Email</dt>
                <dd className="break-all text-ink">{a.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-strong">Phone</dt>
                <dd className="text-ink">{a.phone ?? "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-strong">Linked account</dt>
                <dd className="text-ink">{a.userId ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-strong">Public URL</dt>
                <dd>
                  <Link href={`/alumni/${a.slug}`} className="text-gold-deep hover:underline">
                    /alumni/{a.slug}
                  </Link>
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
