import { ArrowRight, CalendarDays, Clock, Images, Inbox, Mail, Users } from "lucide-react";
import Link from "next/link";
import { setAlumniStatus } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { adminListAlumni } from "@/lib/data/alumni";
import { listGallery } from "@/lib/data/content";
import { listEvents, listRegistrations } from "@/lib/data/events";
import { listContactMessages, listSubscribers } from "@/lib/data/inbox";
import { formatDate, isUpcoming } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function AdminOverview() {
  const [alumni, events, regs, gallery, subs, messages] = await Promise.all([
    adminListAlumni(),
    listEvents({ includeUnpublished: true }),
    listRegistrations(),
    listGallery({ includeUnpublished: true }),
    listSubscribers(),
    listContactMessages(),
  ]);
  const pending = alumni.filter((a) => a.status === "pending");
  const approved = alumni.filter((a) => a.status === "approved");
  const upcoming = events.filter((e) => isUpcoming(e.startsAt));
  const openMessages = messages.filter((m) => !m.handled);

  const stats = [
    { label: "Pending approvals", value: pending.length, icon: Clock, href: "/admin/alumni?status=pending", accent: pending.length > 0 },
    { label: "Approved alumni", value: approved.length, icon: Users, href: "/admin/alumni?status=approved", note: `${approved.filter((a) => a.isSample).length} sample` },
    { label: "Upcoming events", value: upcoming.length, icon: CalendarDays, href: "/admin/events", note: `${regs.length} registrations` },
    { label: "Gallery photographs", value: gallery.length, icon: Images, href: "/admin/gallery" },
    { label: "Newsletter subscribers", value: subs.length, icon: Mail, href: "/admin/subscribers" },
    { label: "Open messages", value: openMessages.length, icon: Inbox, href: "/admin/messages", accent: openMessages.length > 0 },
  ];

  return (
    <>
      <AdminHeader title="Overview" description="The state of the Newton House alumni platform at a glance." />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="group flex items-center gap-5 bg-card p-6 shadow-soft ring-1 ring-line/70 transition-shadow hover:shadow-lift">
              <span className={`inline-flex size-12 items-center justify-center rounded-full ${s.accent ? "bg-gold text-navy" : "bg-navy text-gold"}`}>
                <s.icon className="size-5" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-serif text-4xl leading-none text-navy">{s.value}</span>
                <span className="mt-1 block text-sm text-muted-strong">{s.label}</span>
                {s.note ? <span className="block text-xs text-muted">{s.note}</span> : null}
              </span>
              <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title="Awaiting approval" actions={<Link href="/admin/alumni?status=pending" className="text-xs font-semibold text-gold-deep hover:underline">View all</Link>}>
          <ul className="divide-y divide-line">
            {pending.slice(0, 6).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/alumni/${a.id}`} className="font-semibold text-ink hover:text-gold-deep">
                    {a.fullName}
                  </Link>
                  <p className="text-xs text-muted-strong">
                    {a.department} · {a.graduationYear} · registered {formatDate(a.createdAt)}
                  </p>
                </div>
                <ActionButton size="sm" variant="navy" action={setAlumniStatus.bind(null, a.id, "approved")}>
                  Approve
                </ActionButton>
                <ActionButton size="sm" variant="outline" action={setAlumniStatus.bind(null, a.id, "rejected")} confirmMessage={`Reject ${a.fullName}'s registration?`}>
                  Reject
                </ActionButton>
              </li>
            ))}
            {!pending.length ? <li className="px-6 py-10 text-center text-sm text-muted-strong">No registrations waiting. Submit one from the Join page to test the workflow.</li> : null}
          </ul>
        </Panel>

        <Panel title="Recent messages" actions={<Link href="/admin/messages" className="text-xs font-semibold text-gold-deep hover:underline">Inbox</Link>}>
          <ul className="divide-y divide-line">
            {messages.slice(0, 5).map((m) => (
              <li key={m.id} className="px-6 py-4">
                <p className="text-sm font-semibold text-ink">
                  {m.subject} <span className="font-normal text-muted-strong">— {m.name}</span>
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-strong">{m.message}</p>
              </li>
            ))}
            {!messages.length ? <li className="px-6 py-10 text-center text-sm text-muted-strong">No messages yet.</li> : null}
          </ul>
        </Panel>
      </div>
    </>
  );
}
