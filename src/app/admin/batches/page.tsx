import Link from "next/link";
import { moderateBatchContributionAction } from "@/app/actions/community";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { listBatchContributions, listBatchesWithMembers } from "@/lib/data/community";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Batch Management" };

export default async function AdminBatchesPage() {
  const [batches, contributions] = await Promise.all([
    listBatchesWithMembers({ viewerIsMember: true }),
    Promise.resolve(listBatchContributions({ includeUnapproved: true })),
  ]);

  return (
    <>
      <AdminHeader
        title="Batch Management"
        description="Manage Newton House residence cohorts and review batch memories, photographs, and milestone submissions."
      />

      <Panel title={`Batch Contributions Moderation (${contributions.length})`} className="mb-8">
        <Table>
          <thead>
            <tr>
              <th>Contribution</th>
              <th>Batch</th>
              <th>Type</th>
              <th>Audit Trail</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((c) => (
              <tr key={c.id}>
                <td className="max-w-md">
                  <p className="font-semibold text-ink">
                    {c.title}
                    {c.isSample ? <Badge variant="sample" className="ml-2">Sample</Badge> : null}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-strong">{c.content}</p>
                </td>
                <td className="whitespace-nowrap">
                  <Link href={`/alumni/batches/${c.batchSlug}`} className="font-medium text-gold-deep hover:underline">
                    Batch of {c.batchYear}
                  </Link>
                </td>
                <td className="capitalize text-muted-strong">{c.type}</td>
                <td className="text-xs text-muted-strong">
                  <div>Submitted by: {c.submittedBy}</div>
                  <div>Submitted: {formatDate(c.submittedAt)}</div>
                  {c.reviewedBy ? (
                    <div className="text-ink/80">
                      Reviewed by {c.reviewedBy} ({c.reviewedAt ? formatDate(c.reviewedAt) : "—"})
                    </div>
                  ) : null}
                </td>
                <td>
                  <Badge
                    variant={
                      c.status === "approved"
                        ? "success"
                        : c.status === "pending"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {c.status}
                  </Badge>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    {c.status !== "approved" ? (
                      <ActionButton
                        size="sm"
                        variant="navy"
                        action={moderateBatchContributionAction.bind(null, c.id, "approved")}
                      >
                        Approve
                      </ActionButton>
                    ) : null}
                    {c.status !== "rejected" ? (
                      <ActionButton
                        size="sm"
                        variant="outline"
                        action={moderateBatchContributionAction.bind(null, c.id, "rejected")}
                      >
                        Reject
                      </ActionButton>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!contributions.length ? <EmptyRow cols={6}>No batch contributions submitted yet.</EmptyRow> : null}
          </tbody>
        </Table>
      </Panel>

      <Panel title={`Newton House Cohorts (${batches.length})`}>
        <Table>
          <thead>
            <tr>
              <th>Cohort</th>
              <th>Residence Period</th>
              <th>Verified Members</th>
              <th>Departments</th>
              <th>Approved Contributions</th>
              <th className="text-right">Public Page</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td>
                  <span className="font-semibold text-ink">{b.title}</span>
                  {b.isSample ? <Badge variant="sample" className="ml-2">Sample</Badge> : null}
                </td>
                <td className="text-muted-strong">{b.residencePeriod}</td>
                <td className="font-semibold text-navy">{b.memberCount}</td>
                <td className="text-xs text-muted-strong">
                  {b.departments.map((d) => `${d.department} (${d.count})`).join(", ") || "—"}
                </td>
                <td className="text-muted-strong">{b.contributions.length}</td>
                <td className="text-right">
                  <Link href={`/alumni/batches/${b.slug}`} className="text-xs font-semibold text-gold-deep hover:underline">
                    View Batch →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </>
  );
}
