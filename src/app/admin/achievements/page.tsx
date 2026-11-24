import { Plus } from "lucide-react";
import Link from "next/link";
import { approveAchievement, removeAchievement } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/admin-ui";
import { SavedToast } from "@/components/admin/saved-toast";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { categoryName } from "@/data/achievements";
import { listAchievements } from "@/lib/data/content";
import { cn } from "@/lib/utils";

export const metadata = { title: "Achievements" };

export default async function AdminAchievementsPage() {
  const list = await listAchievements({ includeUnpublished: true });
  return (
    <>
      <SavedToast message="Profile saved." />
      <AdminHeader
        title="Achievements"
        description="Publish verified achievements only. Mark details as verified once confirmed with the member."
        actions={
          <Link href="/admin/achievements/new" className={cn(buttonVariants({ variant: "navy" }))}>
            <Plus aria-hidden /> New profile
          </Link>
        }
      />
      <Panel>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/admin/achievements/${a.id}`} className="font-semibold text-ink hover:text-gold-deep">
                    {a.name}
                  </Link>
                  <p className="text-xs text-muted-strong">{a.designation} · {a.organisation}</p>
                </td>
                <td className="text-muted-strong">{categoryName(a.category)}</td>
                <td className="space-x-1 whitespace-nowrap">
                  <Badge variant={a.published ? "success" : "warning"}>{a.published ? "Published" : "Pending review"}</Badge>
                  {a.verified ? <Badge variant="gold">Verified</Badge> : null}
                  {a.isSample ? <Badge variant="sample">Sample</Badge> : null}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    {!a.published ? (
                      <ActionButton size="sm" variant="navy" action={approveAchievement.bind(null, a.id)}>
                        Approve &amp; Publish
                      </ActionButton>
                    ) : null}
                    <Link href={`/admin/achievements/${a.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                      Edit
                    </Link>
                    <ActionButton size="sm" variant="ghost" className="text-brick" action={removeAchievement.bind(null, a.id)} confirmMessage={`Delete "${a.name}"?`}>
                      Delete
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {!list.length ? <EmptyRow cols={4}>No achievement profiles yet.</EmptyRow> : null}
          </tbody>
        </Table>
      </Panel>
    </>
  );
}
