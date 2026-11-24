import { removeAnnouncement, toggleAnnouncement } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { Badge } from "@/components/ui/badge";
import { listAnnouncements } from "@/lib/data/content";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Announcements" };

export default async function AdminAnnouncementsPage() {
  const list = await listAnnouncements({ includeUnpublished: true });
  return (
    <>
      <AdminHeader title="Announcements" description="Short notices shown on the Events page. The most recent published announcement is featured." />
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="New announcement">
          <div className="p-6">
            <AnnouncementForm />
          </div>
        </Panel>
        <Panel title="All announcements" className="xl:col-span-2">
          <ul className="divide-y divide-line">
            {list.map((a) => (
              <li key={a.id} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">
                    {a.title} <Badge variant={a.published ? "success" : "neutral"} className="ml-1 align-middle">{a.published ? "Published" : "Draft"}</Badge>
                  </p>
                  <p className="mt-1 text-sm text-muted-strong">{a.body}</p>
                  <p className="mt-1 text-xs text-muted">Created {formatDate(a.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <ActionButton size="sm" variant="outline" action={toggleAnnouncement.bind(null, a.id, !a.published)}>
                    {a.published ? "Unpublish" : "Publish"}
                  </ActionButton>
                  <ActionButton size="sm" variant="ghost" className="text-brick" action={removeAnnouncement.bind(null, a.id)} confirmMessage="Delete this announcement?">
                    Delete
                  </ActionButton>
                </div>
              </li>
            ))}
            {!list.length ? <li className="px-6 py-12 text-center text-sm text-muted-strong">No announcements yet.</li> : null}
          </ul>
        </Panel>
      </div>
    </>
  );
}
