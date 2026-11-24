import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, EmptyRow, Panel, Table } from "@/components/admin/admin-ui";
import { EventForm } from "@/components/admin/event-form";
import { buttonVariants } from "@/components/ui/button";
import { getEventById, listRegistrations } from "@/lib/data/events";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await getEventById(id);
  if (!e) notFound();
  const regs = await listRegistrations(e.id);
  return (
    <>
      <AdminHeader title={e.title} description={formatDate(e.startsAt, { weekday: "long" })} actions={<Link href="/admin/events" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}><ArrowLeft aria-hidden /> All events</Link>} />
      <div className="grid gap-6 2xl:grid-cols-5">
        <Panel title="Details" className="2xl:col-span-3">
          <div className="p-6 sm:p-8">
            <EventForm event={e} />
          </div>
        </Panel>
        <Panel
          title={`Registrations (${regs.length})`}
          className="2xl:col-span-2"
          actions={
            regs.length ? (
              <a href={`/admin/events/${e.id}/export`} className="inline-flex items-center gap-1 text-xs font-semibold text-gold-deep hover:underline">
                <Download className="size-3" aria-hidden /> CSV
              </a>
            ) : null
          }
        >
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Batch</th>
                <th>Guests</th>
              </tr>
            </thead>
            <tbody>
              {regs.map((r) => (
                <tr key={r.id}>
                  <td>
                    <p className="font-semibold text-ink">{r.fullName}</p>
                    <p className="text-xs text-muted-strong">{r.email}</p>
                    {r.note ? <p className="mt-1 text-xs italic text-muted-strong">“{r.note}”</p> : null}
                  </td>
                  <td className="text-muted-strong">{r.graduationYear ?? "—"}</td>
                  <td className="text-muted-strong">{r.guests}</td>
                </tr>
              ))}
              {!regs.length ? <EmptyRow cols={3}>No registrations yet.</EmptyRow> : null}
            </tbody>
          </Table>
        </Panel>
      </div>
    </>
  );
}
