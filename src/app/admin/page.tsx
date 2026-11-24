import {
  Archive,
  ArrowRight,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  Clock,
  Handshake,
  ShieldAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { setAlumniStatus } from "@/app/actions/admin";
import {
  moderateAlumniStoryAction,
  moderateArchiveItemAction,
} from "@/app/actions/community";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Panel } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { adminListAlumni } from "@/lib/data/alumni";
import {
  listArchiveItems,
  listAuditLogs,
  listMentorshipRequests,
  listStories,
} from "@/lib/data/community";
import { listEvents, listRegistrations } from "@/lib/data/events";
import { formatDate, isUpcoming } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function AdminOverview() {
  const [alumni, events, regs] = await Promise.all([
    adminListAlumni(),
    listEvents({ includeUnpublished: true }),
    listRegistrations(),
  ]);

  const stories = listStories({ includeUnpublished: true });
  const archiveItems = listArchiveItems({ includeUnapproved: true });
  const mentorshipRequests = listMentorshipRequests({ includeAllForAdmin: true });
  const auditLogs = listAuditLogs();

  const pending = alumni.filter((a) => a.status === "pending" || a.status === "info_required");
  const approved = alumni.filter((a) => a.status === "approved");
  const pendingStories = stories.filter(
    (s) => s.status === "submitted" || s.status === "under_review" || s.status === "draft",
  );
  const pendingArchive = archiveItems.filter((i) => i.status === "pending");
  const upcoming = events.filter((e) => isUpcoming(e.startsAt));

  const stats = [
    {
      label: "Total registrations",
      value: alumni.length,
      icon: Users,
      href: "/admin/alumni?status=all",
      note: `${approved.filter((a) => a.isSample).length} sample records`,
    },
    {
      label: "Pending registrations",
      value: pending.length,
      icon: Clock,
      href: "/admin/alumni?status=pending",
      accent: pending.length > 0,
      note: "Awaiting verification",
    },
    {
      label: "Verified alumni",
      value: approved.length,
      icon: CheckCircle2,
      href: "/admin/alumni?status=approved",
      note: "Active directory members",
    },
    {
      label: "Total stories",
      value: stories.length,
      icon: BookOpenText,
      href: "/admin/stories",
      note: `${stories.filter((s) => s.status === "published").length} published`,
    },
    {
      label: "Pending stories",
      value: pendingStories.length,
      icon: ShieldAlert,
      href: "/admin/stories?status=submitted",
      accent: pendingStories.length > 0,
      note: "Editorial review queue",
    },
    {
      label: "Archive submissions",
      value: archiveItems.length,
      icon: Archive,
      href: "/admin/archive",
      accent: pendingArchive.length > 0,
      note: `${pendingArchive.length} pending review`,
    },
    {
      label: "Upcoming events",
      value: upcoming.length,
      icon: CalendarDays,
      href: "/admin/events",
      note: `${regs.length} total RSVPs`,
    },
    {
      label: "Mentorship requests",
      value: mentorshipRequests.length,
      icon: Handshake,
      href: "/admin/mentorship",
      note: `${mentorshipRequests.filter((r) => r.status === "pending").length} open requests`,
    },
  ];

  return (
    <>
      <AdminHeader
        title="Platform Overview"
        description="Moderation queues, community metrics, and audit logs for the Newton House Alumni Association."
      />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="group flex items-center gap-4 bg-card p-5 shadow-soft ring-1 ring-line/70 transition-shadow hover:shadow-lift"
            >
              <span
                className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full ${
                  s.accent ? "bg-gold text-navy" : "bg-navy text-gold"
                }`}
              >
                <s.icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-3xl leading-none text-navy">{s.value}</span>
                <span className="mt-1 block truncate text-sm font-medium text-ink">{s.label}</span>
                {s.note ? <span className="block truncate text-xs text-muted-strong">{s.note}</span> : null}
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel
          title="Alumni awaiting verification"
          actions={
            <Link href="/admin/alumni?status=pending" className="text-xs font-semibold text-gold-deep hover:underline">
              View all
            </Link>
          }
        >
          <ul className="divide-y divide-line">
            {pending.slice(0, 5).map((a) => (
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
                <ActionButton
                  size="sm"
                  variant="outline"
                  action={setAlumniStatus.bind(null, a.id, "info_required")}
                >
                  Request Info
                </ActionButton>
                <ActionButton
                  size="sm"
                  variant="outline"
                  action={setAlumniStatus.bind(null, a.id, "rejected")}
                  confirmMessage={`Reject ${a.fullName}'s registration?`}
                >
                  Reject
                </ActionButton>
              </li>
            ))}
            {!pending.length ? (
              <li className="px-6 py-10 text-center text-sm text-muted-strong">
                No alumni registrations waiting for approval.
              </li>
            ) : null}
          </ul>
        </Panel>

        <Panel
          title="Stories & archive moderation queue"
          actions={
            <div className="flex gap-3 text-xs font-semibold">
              <Link href="/admin/stories" className="text-gold-deep hover:underline">
                Stories
              </Link>
              <Link href="/admin/archive" className="text-gold-deep hover:underline">
                Archive
              </Link>
            </div>
          }
        >
          <ul className="divide-y divide-line">
            {pendingStories.slice(0, 3).map((st) => (
              <li key={st.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Story · {st.status}</Badge>
                    <span className="truncate font-semibold text-ink">{st.title}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-strong">
                    By {st.authorName} ({st.authorDepartment}, {st.authorGraduationYear})
                  </p>
                </div>
                <ActionButton
                  size="sm"
                  variant="navy"
                  action={moderateAlumniStoryAction.bind(null, st.id, "published")}
                >
                  Publish
                </ActionButton>
              </li>
            ))}
            {pendingArchive.slice(0, 3).map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Archive · {item.mediaType}</Badge>
                    <span className="truncate font-semibold text-ink">{item.title}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-strong">
                    Contributed by {item.contributorName} · {item.approximateYear}
                  </p>
                </div>
                <ActionButton
                  size="sm"
                  variant="navy"
                  action={moderateArchiveItemAction.bind(null, item.id, "approved")}
                >
                  Approve
                </ActionButton>
              </li>
            ))}
            {!pendingStories.length && !pendingArchive.length ? (
              <li className="px-6 py-10 text-center text-sm text-muted-strong">
                No stories or archive contributions awaiting moderation.
              </li>
            ) : null}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Recent Moderation & Audit Trail"
        className="mt-6"
        actions={
          <Link href="/admin/roles" className="text-xs font-semibold text-gold-deep hover:underline">
            Full audit log
          </Link>
        }
      >
        <ul className="divide-y divide-line">
          {auditLogs.slice(0, 6).map((log) => (
            <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-3.5 text-sm">
              <div>
                <span className="font-semibold text-ink">{log.action}</span>{" "}
                <span className="text-muted-strong">— {log.entityTitle}</span>
              </div>
              <div className="text-xs text-muted-strong">
                Reviewed by <span className="font-medium text-ink">{log.actorEmail}</span> · {formatDate(log.createdAt)}
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
