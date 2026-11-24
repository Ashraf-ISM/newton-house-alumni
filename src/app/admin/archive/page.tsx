import Link from "next/link";
import {
  moderateArchiveItemAction,
  removeArchiveItemAction,
} from "@/app/actions/community";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { archiveCategories, listArchiveItems } from "@/lib/data/community";
import { cn, formatDate, paramValue } from "@/lib/utils";
import type { ModerationStatus } from "@/types";

export const metadata = { title: "Archive Management" };

const tabs: { key: ModerationStatus | "all"; label: string }[] = [
  { key: "all", label: "All Items" },
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default async function AdminArchivePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const status = (paramValue(sp.status) ?? "all") as ModerationStatus | "all";
  const all = listArchiveItems({ includeUnapproved: true });
  const list = all.filter((i) => status === "all" || i.status === status);
  const count = (k: ModerationStatus | "all") =>
    k === "all" ? all.length : all.filter((i) => i.status === k).length;

  return (
    <>
      <AdminHeader
        title="Archive Management"
        description="Curate and moderate photographs and PDF historical documents submitted to the Newton House Digital Heritage Archive."
      />

      <nav aria-label="Filter archive items by status" className="mb-5 flex flex-wrap gap-1">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/archive?status=${t.key}`}
            aria-current={status === t.key ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              status === t.key ? "bg-navy text-ivory" : "text-muted-strong hover:bg-ink/5",
            )}
          >
            {t.label} <span className="opacity-60">{count(t.key)}</span>
          </Link>
        ))}
      </nav>

      <Panel>
        <Table>
          <thead>
            <tr>
              <th>Archival Item</th>
              <th>Category & Era</th>
              <th>Format</th>
              <th>Contributor & Audit</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => {
              const cat = archiveCategories.find((c) => c.slug === item.categorySlug);
              return (
                <tr key={item.id}>
                  <td className="max-w-md">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{item.title}</span>
                      {item.isSample ? <Badge variant="sample">Sample</Badge> : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-strong">{item.description}</p>
                  </td>
                  <td className="whitespace-nowrap text-xs text-muted-strong">
                    <div className="font-medium text-ink">{cat?.name ?? item.categorySlug}</div>
                    <div>
                      {item.approximateYear}{" "}
                      <span className="opacity-75">
                        ({item.yearVerified ? "Verified year" : "Approximate era"})
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-xs uppercase text-muted-strong">
                    {item.mediaType} · {item.fileFormat}
                  </td>
                  <td className="text-xs text-muted-strong">
                    <div>
                      Contributor:{" "}
                      <span className="font-medium text-ink">
                        {item.contributorName} ({item.showContributor ? "public credit" : "anonymous public"})
                      </span>
                    </div>
                    <div>Submitted by: {item.submittedBy}</div>
                    <div>Submitted: {formatDate(item.submittedAt)}</div>
                    {item.reviewedBy ? (
                      <div className="text-ink/80">
                        Reviewed by {item.reviewedBy} ({item.reviewedAt ? formatDate(item.reviewedAt) : "—"})
                      </div>
                    ) : null}
                  </td>
                  <td>
                    <Badge
                      variant={
                        item.status === "approved"
                          ? "success"
                          : item.status === "pending"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex flex-wrap justify-end gap-2">
                      {item.status !== "approved" ? (
                        <ActionButton
                          size="sm"
                          variant="navy"
                          action={moderateArchiveItemAction.bind(null, item.id, "approved")}
                        >
                          Approve
                        </ActionButton>
                      ) : null}
                      {item.status !== "rejected" ? (
                        <ActionButton
                          size="sm"
                          variant="outline"
                          action={moderateArchiveItemAction.bind(null, item.id, "rejected")}
                        >
                          Reject
                        </ActionButton>
                      ) : null}
                      <ActionButton
                        size="sm"
                        variant="ghost"
                        className="text-brick"
                        action={removeArchiveItemAction.bind(null, item.id)}
                        confirmMessage={`Delete "${item.title}" from the archive?`}
                      >
                        Delete
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!list.length ? <EmptyRow cols={6}>No archive items in this filter.</EmptyRow> : null}
          </tbody>
        </Table>
      </Panel>
    </>
  );
}
