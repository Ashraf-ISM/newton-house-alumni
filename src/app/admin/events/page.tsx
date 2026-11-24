import { Plus } from "lucide-react";
import Link from "next/link";
import { removeEvent } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/admin-ui";
import { SavedToast } from "@/components/admin/saved-toast";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { eventCategoryLabels } from "@/data/events";
import { listEvents, listRegistrations } from "@/lib/data/events";
import { cn, formatDate, isUpcoming } from "@/lib/utils";

export const metadata = { title: "Events" };

export default async function AdminEventsPage() {
  const [events, regs] = await Promise.all([listEvents({ includeUnpublished: true }), listRegistrations()]);
  return (
    <>
      <SavedToast message="Event saved." />
      <AdminHeader
        title="Events"
        description="Create and edit reunions, lectures and gatherings. Registrations are listed on each event."
        actions={
          <Link href="/admin/events/new" className={cn(buttonVariants({ variant: "navy" }))}>
            <Plus aria-hidden /> New event
          </Link>
        }
      />
      <Panel>
        <Table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Registrations</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...events].reverse().map((e) => {
              const count = regs.filter((r) => r.eventId === e.id).reduce((n, r) => n + 1 + r.guests, 0);
              const past = !isUpcoming(e.startsAt);
              return (
                <tr key={e.id}>
                  <td>
                    <Link href={`/admin/events/${e.id}`} className="font-semibold text-ink hover:text-gold-deep">
                      {e.title}
                    </Link>
                    <p className="text-xs text-muted-strong">{eventCategoryLabels[e.category]} · {e.city}</p>
                  </td>
                  <td className="whitespace-nowrap text-muted-strong">{formatDate(e.startsAt)}</td>
                  <td className="text-muted-strong">{count ? `${count} attendee${count === 1 ? "" : "s"}` : "—"}{e.capacity ? ` / ${e.capacity}` : ""}</td>
                  <td className="space-x-1 whitespace-nowrap">
                    <Badge variant={e.published ? "success" : "neutral"}>{e.published ? "Published" : "Draft"}</Badge>
                    {past ? <Badge variant="outline">Past</Badge> : null}
                    {e.isDemo ? <Badge variant="sample">Demo</Badge> : null}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/events/${e.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                        Edit
                      </Link>
                      <Link href={`/events/${e.slug}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                        View
                      </Link>
                      <ActionButton size="sm" variant="ghost" className="text-brick" action={removeEvent.bind(null, e.id)} confirmMessage={`Delete "${e.title}" and its registrations?`}>
                        Delete
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!events.length ? <EmptyRow cols={5}>No events yet.</EmptyRow> : null}
          </tbody>
        </Table>
      </Panel>
    </>
  );
}
