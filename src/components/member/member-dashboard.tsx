"use client";

import {
  AlertCircle,
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Globe2,
  GraduationCap,
  Handshake,
  ImagePlus,
  Images,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/actions/auth";
import {
  deleteAlumniConnection,
  markAllMemberNotificationsRead,
  markNotificationAsRead,
  requestAlumniConnection,
  respondToConnection,
  respondToMentorshipRequestAction,
  updateAdvancedMemberProfile,
} from "@/app/actions/community";
import { submitAchievementNomination } from "@/app/actions/public";
import { ActionButton } from "@/components/admin/action-button";
import { UpdatePasswordForm } from "@/components/forms/auth-forms";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormStatus } from "@/components/ui/form-status";
import { SubmitButton } from "@/components/ui/submit-button";
import { achievementCategories, categoryName } from "@/data/achievements";
import { departments, professions } from "@/data/alumni";
import { useFormAction } from "@/hooks/use-form-action";
import type { EnrichedConnection } from "@/lib/data/community";
import { cn, formatDate } from "@/lib/utils";
import type {
  Achievement,
  AlumniProfile,
  AlumniRecord,
  AlumniStatus,
  AlumniStory,
  ArchiveItem,
  MemberNotification,
  MentorshipRequest,
  NHEvent,
} from "@/types";

export type DashboardTab =
  | "overview"
  | "profile"
  | "batch"
  | "connections"
  | "memories"
  | "achievements"
  | "events"
  | "mentorship"
  | "notifications"
  | "privacy"
  | "account";

const navItems: { id: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: UserCheck },
  { id: "batch", label: "My Batch", icon: GraduationCap },
  { id: "connections", label: "Alumni Connections", icon: Users },
  { id: "memories", label: "My Memories", icon: Images },
  { id: "achievements", label: "My Achievements", icon: Award },
  { id: "events", label: "Events & Reunions", icon: CalendarDays },
  { id: "mentorship", label: "Mentorship", icon: Handshake },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy Settings", icon: Lock },
  { id: "account", label: "Account Settings", icon: KeyRound },
];

const verificationStates: Record<
  AlumniStatus,
  { label: string; badge: "warning" | "success" | "danger"; icon: typeof Clock; description: string }
> = {
  pending: {
    label: "Pending Verification",
    badge: "warning",
    icon: Clock,
    description:
      "The Association is reviewing your alumni registration. Once approved, your profile appears in the verified directory.",
  },
  approved: {
    label: "Verified Alumnus",
    badge: "success",
    icon: BadgeCheck,
    description:
      "Your Newton House membership is verified and active. Your profile visibility is governed by your privacy settings.",
  },
  rejected: {
    label: "Rejected",
    badge: "danger",
    icon: XCircle,
    description:
      "We could not verify your registration against Newton House records. Contact the Association if you need assistance.",
  },
  info_required: {
    label: "Additional Information Required",
    badge: "warning",
    icon: AlertCircle,
    description:
      "The verification committee requested additional profile details. Please update your profile below.",
  },
};

export interface MemberDashboardProps {
  initialTab?: DashboardTab;
  viewerEmail: string;
  viewerRole: "admin" | "editor" | null;
  demo: boolean;
  alumni: AlumniRecord;
  completion: { percentage: number; missing: string[] };
  connections: {
    accepted: EnrichedConnection[];
    incoming: EnrichedConnection[];
    outgoing: EnrichedConnection[];
    suggested: AlumniProfile[];
  };
  batchPeers: AlumniProfile[];
  notifications: MemberNotification[];
  upcomingEvents: NHEvent[];
  myAchievements: Achievement[];
  myStories: AlumniStory[];
  myArchiveItems: ArchiveItem[];
  mentorshipRequests: MentorshipRequest[];
}

export function MemberDashboard({
  initialTab = "overview",
  viewerEmail,
  viewerRole,
  demo,
  alumni,
  completion,
  connections,
  batchPeers,
  notifications,
  upcomingEvents,
  myAchievements,
  myStories,
  myArchiveItems,
  mentorshipRequests,
}: MemberDashboardProps) {
  const [tab, setTab] = useState<DashboardTab>(initialTab);
  const [collapsed, setCollapsed] = useState(false);

  const firstName = alumni.fullName.replace(/^(dr|mr|ms|mrs|prof)\.?\s+/i, "").split(" ")[0] || "Alumnus";
  const verification = verificationStates[alumni.status] ?? verificationStates.pending;
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const pendingConnCount = connections.incoming.length;

  return (
    <div className="paper min-h-screen bg-ivory pt-24 pb-20">
      {/* Top Hero Banner */}
      <section className="relative overflow-hidden border-b border-gold/15 bg-navy py-10 text-ivory sm:py-12">
        <div aria-hidden className="absolute inset-0 navy-grain" />
        <div className="container-nh relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="eyebrow text-gold">Newton House Member Portal</p>
              <Badge variant={verification.badge}>
                <verification.icon className="size-3" aria-hidden />
                {verification.label}
              </Badge>
              {demo ? <Badge variant="sample-dark">Demo Store</Badge> : null}
            </div>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-ivory sm:text-5xl">
              Welcome back, <span className="italic text-gold">{firstName}!</span>
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-ivory/75 sm:text-base">
              Your Newton House journey continues. Reconnect, share memories and stay connected with your community.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {viewerRole ? (
              <Link href="/admin" className={cn(buttonVariants({ variant: "gold", size: "sm" }))}>
                <ShieldCheck aria-hidden /> Admin Dashboard
              </Link>
            ) : null}
            <Link
              href={`/alumni/batches/batch-${alumni.graduationYear}`}
              className={cn(buttonVariants({ variant: "outline-light", size: "sm" }))}
            >
              <GraduationCap aria-hidden /> Class of {alumni.graduationYear}
            </Link>
            <form action={signOut}>
              <Button type="submit" variant="ghost-light" size="sm">
                <LogOut aria-hidden /> Sign out
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout with Collapsible Sidebar */}
      <div className="container-nh mt-8 grid gap-8 lg:grid-cols-12">
        {/* Mobile Horizontal Tab Scroller */}
        <div className="no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto border-b border-line bg-card px-5 py-2.5 lg:hidden">
          {navItems.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
                  active ? "bg-navy text-gold" : "text-muted-strong hover:bg-ivory",
                )}
              >
                <item.icon className="size-3.5" aria-hidden />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Desktop Collapsible Sidebar */}
        <aside
          aria-label="Member dashboard navigation"
          className={cn(
            "hidden self-start bg-navy text-ivory shadow-lift transition-all duration-300 lg:block",
            collapsed ? "lg:col-span-1" : "lg:col-span-3",
          )}
        >
          <div className="flex items-center justify-between border-b border-gold/15 px-4 py-4">
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate font-serif text-lg text-ivory">{alumni.fullName}</p>
                <p className="truncate font-label text-[0.625rem] uppercase tracking-[0.16em] text-gold">
                  {alumni.department} · {alumni.graduationYear}
                </p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="ml-auto inline-flex size-8 items-center justify-center rounded-md text-ivory/70 transition-colors hover:bg-white/10 hover:text-gold"
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>

          <nav className="p-2">
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const active = tab === item.id;
                const badgeCount =
                  item.id === "notifications"
                    ? unreadNotifs
                    : item.id === "connections"
                      ? pendingConnCount
                      : 0;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[0.8125rem] font-medium transition-colors",
                        active
                          ? "bg-gold text-navy font-semibold"
                          : "text-ivory/75 hover:bg-white/[0.06] hover:text-ivory",
                        collapsed && "justify-center px-2",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      {!collapsed && badgeCount > 0 ? (
                        <span
                          className={cn(
                            "ml-auto rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold tabular-nums",
                            active ? "bg-navy text-gold" : "bg-gold text-navy",
                          )}
                        >
                          {badgeCount}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {!collapsed ? (
            <div className="border-t border-gold/15 p-4">
              <div className="flex items-center justify-between text-xs text-ivory/75">
                <span>Profile completion</span>
                <span className="font-semibold text-gold tabular-nums">{completion.percentage}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gold transition-all duration-500"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
            </div>
          ) : null}
        </aside>

        {/* Main Content Panel */}
        <div className={cn("min-w-0", collapsed ? "lg:col-span-11" : "lg:col-span-9")}>
          <AnimatePresence mode="wait">
            <m.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              {tab === "overview" && (
                <OverviewTab
                  alumni={alumni}
                  verification={verification}
                  completion={completion}
                  connections={connections}
                  notifications={notifications}
                  upcomingEvents={upcomingEvents}
                  onNavigate={setTab}
                />
              )}
              {tab === "profile" && <ProfileTab alumni={alumni} completion={completion} />}
              {tab === "batch" && <BatchTab alumni={alumni} peers={batchPeers} />}
              {tab === "connections" && <ConnectionsTab connections={connections} />}
              {tab === "memories" && (
                <MemoriesTab stories={myStories} archiveItems={myArchiveItems} />
              )}
              {tab === "achievements" && <AchievementsTab alumni={alumni} achievements={myAchievements} />}
              {tab === "events" && <EventsTab events={upcomingEvents} />}
              {tab === "mentorship" && <MentorshipTab requests={mentorshipRequests} />}
              {tab === "notifications" && <NotificationsTab notifications={notifications} />}
              {tab === "privacy" && <PrivacyTab alumni={alumni} />}
              {tab === "account" && (
                <AccountTab viewerEmail={viewerEmail} alumni={alumni} verification={verification} />
              )}
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   TAB 1: OVERVIEW
   ================================================================== */
function OverviewTab({
  alumni,
  verification,
  completion,
  connections,
  notifications,
  upcomingEvents,
  onNavigate,
}: {
  alumni: AlumniRecord;
  verification: (typeof verificationStates)[AlumniStatus];
  completion: { percentage: number; missing: string[] };
  connections: MemberDashboardProps["connections"];
  notifications: MemberNotification[];
  upcomingEvents: NHEvent[];
  onNavigate: (t: DashboardTab) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Top KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-card p-5 shadow-soft ring-1 ring-line/80">
          <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong">
            Verification Status
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={verification.badge}>
              <verification.icon className="size-3" aria-hidden />
              {verification.label}
            </Badge>
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-muted-strong">{verification.description}</p>
        </div>

        <div className="bg-card p-5 shadow-soft ring-1 ring-line/80">
          <div className="flex items-center justify-between">
            <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong">
              Profile Completion
            </p>
            <span className="font-serif text-2xl font-semibold text-navy tabular-nums">
              {completion.percentage}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-ivory-2">
            <div className="h-full bg-gold-dark" style={{ width: `${completion.percentage}%` }} />
          </div>
          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-deep hover:underline"
          >
            {completion.missing.length ? `Add ${completion.missing[0]}` : "Edit profile"}
            <ArrowRight className="size-3" aria-hidden />
          </button>
        </div>

        <div className="bg-card p-5 shadow-soft ring-1 ring-line/80">
          <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong">
            Alumni Connections
          </p>
          <p className="mt-2 font-serif text-3xl text-navy tabular-nums">{connections.accepted.length}</p>
          <button
            type="button"
            onClick={() => onNavigate("connections")}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-deep hover:underline"
          >
            {connections.incoming.length
              ? `${connections.incoming.length} pending request(s)`
              : "Discover fellow alumni"}
            <ArrowRight className="size-3" aria-hidden />
          </button>
        </div>

        <div className="bg-card p-5 shadow-soft ring-1 ring-line/80">
          <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-muted-strong">
            Upcoming Events
          </p>
          <p className="mt-2 font-serif text-3xl text-navy tabular-nums">{upcomingEvents.length}</p>
          <button
            type="button"
            onClick={() => onNavigate("events")}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-deep hover:underline"
          >
            View calendar &amp; reunions <ArrowRight className="size-3" aria-hidden />
          </button>
        </div>
      </div>

      {/* Middle Row: Notifications & Upcoming Events */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h2 className="font-serif text-2xl text-navy">Recent Notifications</h2>
            <button
              type="button"
              onClick={() => onNavigate("notifications")}
              className="text-xs font-semibold text-gold-deep hover:underline"
            >
              View all ({notifications.length})
            </button>
          </div>
          <ul className="divide-y divide-line">
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    {!n.read ? <span className="size-2 rounded-full bg-gold-dark" aria-label="Unread" /> : null}
                    <p className="text-sm font-semibold text-ink">{n.title}</p>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-strong">{n.body}</p>
                  <p className="mt-1 text-[0.7rem] text-muted">{formatDate(n.createdAt)}</p>
                </div>
                <Link href={n.href} className="shrink-0 text-xs font-semibold text-gold-deep hover:underline">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h2 className="font-serif text-2xl text-navy">Upcoming Gatherings</h2>
            <Link href="/events" className="text-xs font-semibold text-gold-deep hover:underline">
              All events
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {upcomingEvents.slice(0, 3).map((e) => (
              <li key={e.id} className="py-4">
                <p className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                  {formatDate(e.startsAt)} · {e.city}
                </p>
                <Link
                  href={`/events/${e.slug}`}
                  className="mt-1 block font-serif text-xl text-navy hover:text-gold-deep"
                >
                  {e.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-xs text-muted-strong">{e.summary}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Alumni Connections */}
      <div className="bg-card p-6 shadow-soft ring-1 ring-line/80">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="font-serif text-2xl text-navy">Suggested Alumni Connections</h2>
            <p className="text-xs text-muted-strong">
              Fellow Newton House residents from {alumni.department}, Class of {alumni.graduationYear} and allied
              cohorts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("connections")}
            className="text-xs font-semibold text-gold-deep hover:underline"
          >
            Manage all connections →
          </button>
        </div>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {connections.suggested.slice(0, 3).map((peer) => (
            <li key={peer.id} className="flex flex-col justify-between border border-line/80 bg-ivory/50 p-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/alumni/${peer.slug}`}
                    className="font-serif text-xl text-navy hover:text-gold-deep"
                  >
                    {peer.fullName}
                  </Link>
                  {peer.isSample ? <Badge variant="sample">Sample</Badge> : null}
                </div>
                <p className="mt-1 font-label text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                  {peer.department} · Class of {peer.graduationYear}
                </p>
                {peer.designation || peer.organisation ? (
                  <p className="mt-2 text-xs text-ink/85">
                    {[peer.designation, peer.organisation].filter(Boolean).join(", ")}
                  </p>
                ) : null}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3">
                <span className="text-xs text-muted-strong">{peer.city ?? "India"}</span>
                <ActionButton
                  size="sm"
                  variant="navy"
                  action={requestAlumniConnection.bind(
                    null,
                    peer.id,
                    `Hello ${peer.fullName.split(" ")[0]}, let us connect on the Newton House network!`,
                  )}
                >
                  <UserPlus className="size-3.5" aria-hidden /> Connect
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ==================================================================
   TAB 2: MY PROFILE
   ================================================================== */
function ProfileTab({
  alumni,
  completion,
}: {
  alumni: AlumniRecord;
  completion: { percentage: number; missing: string[] };
}) {
  const [state, onSubmit, pending] = useFormAction(updateAdvancedMemberProfile);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const [preview, setPreview] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const currentPhoto = removed ? null : (preview ?? alumni.photoUrl);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  return (
    <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 sm:p-8">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-3xl text-navy">My Profile</h2>
          <p className="mt-1 text-sm text-muted-strong">
            Keep your academic and professional details current for fellow Newton House alumni.
          </p>
        </div>
        <div className="min-w-48 rounded-md bg-ivory p-3 ring-1 ring-line">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-navy">Profile Completion</span>
            <span className="font-bold text-gold-deep tabular-nums">{completion.percentage}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ivory-2">
            <div className="h-full bg-gold-dark" style={{ width: `${completion.percentage}%` }} />
          </div>
          {completion.missing.length > 0 ? (
            <p className="mt-1.5 text-[0.7rem] text-muted-strong">
              Suggested next: <strong>{completion.missing.slice(0, 2).join(", ")}</strong>
            </p>
          ) : null}
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
        {removed ? <input type="hidden" name="removePhoto" value="on" /> : null}
        <input type="hidden" name="visibility" value={alumni.visibility} />
        {alumni.showEmail ? <input type="hidden" name="showEmail" value="on" /> : null}
        {alumni.showLocation !== false ? <input type="hidden" name="showLocation" value="on" /> : null}
        {alumni.showProfessional !== false ? <input type="hidden" name="showProfessional" value="on" /> : null}

        {/* Photograph Upload */}
        <div className="flex flex-wrap items-center gap-5 rounded-md border border-line bg-ivory/60 p-4">
          <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy text-gold ring-2 ring-gold/40">
            {currentPhoto ? (
              <Image
                src={currentPhoto}
                alt="Your profile photograph"
                fill
                className="object-cover"
                unoptimized={currentPhoto.startsWith("data:") || currentPhoto.startsWith("blob:")}
              />
            ) : (
              <ImagePlus className="size-6" aria-hidden />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">Profile Photograph</p>
            <p className="text-xs text-muted-strong">
              JPEG, PNG, WebP or AVIF up to 3 MB. EXIF GPS data is removed automatically.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <input
                ref={fileRef}
                id="photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setRemoved(false);
                  setPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                {currentPhoto ? "Change photograph" : "Upload photograph"}
              </Button>
              {currentPhoto ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (fileRef.current) fileRef.current.value = "";
                    setPreview(null);
                    setRemoved(true);
                  }}
                >
                  <X aria-hidden /> Remove
                </Button>
              ) : null}
            </div>
            {fe?.photo ? <p className="mt-1 text-xs font-medium text-brick">{fe.photo[0]}</p> : null}
          </div>
        </div>

        {/* Academic & Residence Identity */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="p-name" label="Full name" required error={fe?.fullName} className="sm:col-span-2">
            {(a) => <Input {...a} name="fullName" defaultValue={alumni.fullName} />}
          </Field>
          <Field id="p-dept" label="Department" required error={fe?.department}>
            {(a) => (
              <Select {...a} name="department" defaultValue={alumni.department}>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id="p-grad" label="Graduation year" required error={fe?.graduationYear}>
            {(a) => (
              <Input
                {...a}
                name="graduationYear"
                inputMode="numeric"
                maxLength={4}
                defaultValue={alumni.graduationYear}
              />
            )}
          </Field>
          <Field id="p-res" label="Residence start year" error={fe?.residenceStartYear}>
            {(a) => (
              <Input
                {...a}
                name="residenceStartYear"
                inputMode="numeric"
                maxLength={4}
                defaultValue={alumni.residenceStartYear ?? alumni.graduationYear - 3}
              />
            )}
          </Field>
          <Field id="p-prof" label="Professional field" error={fe?.profession}>
            {(a) => (
              <Select {...a} name="profession" defaultValue={alumni.profession ?? ""}>
                <option value="">Select field</option>
                {professions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id="p-desig" label="Current designation" error={fe?.designation}>
            {(a) => <Input {...a} name="designation" defaultValue={alumni.designation ?? ""} />}
          </Field>
          <Field id="p-org" label="Organisation / Institution" error={fe?.organisation}>
            {(a) => <Input {...a} name="organisation" defaultValue={alumni.organisation ?? ""} />}
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field id="p-city" label="Current city" error={fe?.city}>
            {(a) => <Input {...a} name="city" defaultValue={alumni.city ?? ""} />}
          </Field>
          <Field id="p-country" label="Country" error={fe?.country}>
            {(a) => <Input {...a} name="country" defaultValue={alumni.country ?? "India"} />}
          </Field>
          <Field id="p-linkedin" label="LinkedIn URL" error={fe?.linkedinUrl}>
            {(a) => (
              <Input
                {...a}
                name="linkedinUrl"
                type="url"
                defaultValue={alumni.linkedinUrl ?? ""}
                placeholder="https://www.linkedin.com/in/your-name"
              />
            )}
          </Field>
        </div>

        <Field id="p-bio" label="Personal introduction" error={fe?.bio}>
          {(a) => (
            <Textarea
              {...a}
              name="bio"
              rows={4}
              maxLength={600}
              defaultValue={alumni.bio ?? ""}
              placeholder="Your years at Newton House, current work and interests…"
            />
          )}
        </Field>

        <FormStatus state={state} />
        <SubmitButton pending={pending} variant="navy" size="lg" pendingLabel="Saving changes…">
          Save Profile Changes
        </SubmitButton>
      </form>
    </div>
  );
}

/* ==================================================================
   TAB 3: MY BATCH
   ================================================================== */
function BatchTab({ alumni, peers }: { alumni: AlumniRecord; peers: AlumniProfile[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="eyebrow text-gold-deep">Newton House Cohort</p>
            <h2 className="mt-2 font-serif text-3xl text-navy">
              Class of {alumni.graduationYear} ({alumni.residenceStartYear ?? alumni.graduationYear - 3} –{" "}
              {alumni.graduationYear})
            </h2>
            <p className="mt-1 text-sm text-muted-strong">
              {peers.length} verified member(s) registered in your graduation cohort.
            </p>
          </div>
          <Link
            href={`/alumni/batches/batch-${alumni.graduationYear}`}
            className={cn(buttonVariants({ variant: "navy", size: "md" }))}
          >
            Open Full Batch Page <ArrowRight aria-hidden />
          </Link>
        </div>

        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {peers.map((p) => (
            <li key={p.id} className="flex flex-col justify-between border border-line bg-ivory/50 p-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif text-xl text-navy">{p.fullName}</h3>
                  {p.isSample ? <Badge variant="sample">Sample</Badge> : null}
                </div>
                <p className="mt-1 font-label text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                  {p.department} · {p.graduationYear}
                </p>
                {p.designation || p.organisation ? (
                  <p className="mt-2 text-xs text-ink/85">
                    {[p.designation, p.organisation].filter(Boolean).join(", ")}
                  </p>
                ) : null}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3 text-xs">
                <span className="text-muted-strong">{p.city ?? "India"}</span>
                <Link href={`/alumni/${p.slug}`} className="font-semibold text-gold-deep hover:underline">
                  View Profile →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ==================================================================
   TAB 4: ALUMNI CONNECTIONS
   ================================================================== */
function ConnectionsTab({ connections }: { connections: MemberDashboardProps["connections"] }) {
  return (
    <div className="space-y-8">
      {/* Incoming Connection Requests */}
      {connections.incoming.length > 0 ? (
        <div className="bg-card p-6 shadow-soft ring-1 ring-gold/50">
          <h2 className="font-serif text-2xl text-navy">
            Incoming Connection Requests ({connections.incoming.length})
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {connections.incoming.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div>
                  <Link href={`/alumni/${c.peer.slug}`} className="font-serif text-xl text-navy hover:text-gold-deep">
                    {c.peer.fullName}
                  </Link>
                  <p className="text-xs text-muted-strong">
                    {c.peer.department} · Class of {c.peer.graduationYear} ·{" "}
                    {[c.peer.designation, c.peer.organisation].filter(Boolean).join(", ")}
                  </p>
                  {c.note ? <p className="mt-1 text-xs italic text-ink/80">“{c.note}”</p> : null}
                </div>
                <div className="flex gap-2">
                  <ActionButton
                    size="sm"
                    variant="navy"
                    action={respondToConnection.bind(null, c.id, "accepted")}
                  >
                    <Check className="size-3.5" aria-hidden /> Accept
                  </ActionButton>
                  <ActionButton
                    size="sm"
                    variant="outline"
                    action={respondToConnection.bind(null, c.id, "rejected")}
                  >
                    Decline
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Accepted Connections */}
      <div className="bg-card p-6 shadow-soft ring-1 ring-line/80">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h2 className="font-serif text-2xl text-navy">
            My Newton House Connections ({connections.accepted.length})
          </h2>
          <Link href="/alumni" className="text-xs font-semibold text-gold-deep hover:underline">
            Browse full directory →
          </Link>
        </div>

        {connections.accepted.length > 0 ? (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {connections.accepted.map((c) => (
              <li key={c.id} className="flex flex-col justify-between border border-line bg-ivory/40 p-5">
                <div>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/alumni/${c.peer.slug}`}
                      className="font-serif text-xl text-navy hover:text-gold-deep"
                    >
                      {c.peer.fullName}
                    </Link>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  <p className="mt-1 font-label text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                    {c.peer.department} · Class of {c.peer.graduationYear}
                  </p>
                  <p className="mt-2 text-xs text-muted-strong">
                    {[c.peer.designation, c.peer.organisation, c.peer.city].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3">
                  <Link href={`/alumni/${c.peer.slug}`} className="text-xs font-semibold text-gold-deep hover:underline">
                    View Profile
                  </Link>
                  <ActionButton
                    size="sm"
                    variant="ghost"
                    className="text-brick"
                    action={deleteAlumniConnection.bind(null, c.id)}
                    confirmMessage={`Remove connection with ${c.peer.fullName}?`}
                  >
                    Remove
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-muted-strong">
            You have no accepted connections yet. Send a request to fellow alumni below.
          </p>
        )}
      </div>

      {/* Discover & Connect */}
      <div className="bg-card p-6 shadow-soft ring-1 ring-line/80">
        <h2 className="font-serif text-2xl text-navy">Discover Fellow Alumni</h2>
        <p className="mt-1 text-xs text-muted-strong">
          Send a connection request to build your verified Newton House network.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {connections.suggested.map((peer) => (
            <li key={peer.id} className="flex flex-col justify-between border border-line p-4">
              <div>
                <Link href={`/alumni/${peer.slug}`} className="font-serif text-lg text-navy hover:text-gold-deep">
                  {peer.fullName}
                </Link>
                <p className="text-xs text-gold-deep">
                  {peer.department} · {peer.graduationYear}
                </p>
                <p className="mt-1 text-xs text-muted-strong">
                  {[peer.designation, peer.organisation].filter(Boolean).join(", ")}
                </p>
              </div>
              <div className="mt-4 pt-2">
                <ActionButton
                  size="sm"
                  variant="outline"
                  className="w-full"
                  action={requestAlumniConnection.bind(null, peer.id, "Connecting via Newton House Member Portal")}
                >
                  <UserPlus className="size-3.5" aria-hidden /> Send Request
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ==================================================================
   TAB 5: MY MEMORIES (STORIES & ARCHIVE CONTRIBUTIONS)
   ================================================================== */
function MemoriesTab({ stories, archiveItems }: { stories: AlumniStory[]; archiveItems: ArchiveItem[] }) {
  return (
    <div className="space-y-8">
      <div className="bg-card p-6 shadow-soft ring-1 ring-line/80">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="font-serif text-2xl text-navy">My Alumni Stories ({stories.length})</h2>
            <p className="text-xs text-muted-strong">
              Long-form stories and personal recollections submitted to Voices of Newton House.
            </p>
          </div>
          <Link href="/alumni/stories#submit-story" className={cn(buttonVariants({ variant: "navy", size: "sm" }))}>
            <BookOpen aria-hidden /> Write a Story
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {stories.map((st) => (
            <li key={st.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <Link
                  href={`/alumni/stories/${st.slug}`}
                  className="font-serif text-xl text-navy hover:text-gold-deep"
                >
                  {st.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted-strong">{st.summary}</p>
              </div>
              <Badge variant={st.status === "published" ? "success" : "warning"}>{st.status}</Badge>
            </li>
          ))}
          {!stories.length ? (
            <li className="py-8 text-center text-sm text-muted-strong">
              You have not submitted any stories yet. Share your Newton House journey on the Alumni Stories page.
            </li>
          ) : null}
        </ul>
      </div>

      <div className="bg-card p-6 shadow-soft ring-1 ring-line/80">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="font-serif text-2xl text-navy">My Heritage Archive Contributions ({archiveItems.length})</h2>
            <p className="text-xs text-muted-strong">
              Historical photographs and documents submitted to the Digital Heritage Archive.
            </p>
          </div>
          <Link href="/archive#contribute-archive" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            <Images aria-hidden /> Contribute to Archive
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {archiveItems.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="text-xs text-muted-strong">
                  {item.approximateYear} · {item.mediaType}
                </p>
              </div>
              <Badge variant={item.status === "approved" ? "success" : "warning"}>{item.status}</Badge>
            </li>
          ))}
          {!archiveItems.length ? (
            <li className="py-8 text-center text-sm text-muted-strong">
              No archival uploads yet. Contribute historical photographs or documents on the Digital Heritage Archive
              page.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

/* ==================================================================
   TAB 6: MY ACHIEVEMENTS
   ================================================================== */
function AchievementsTab({ alumni, achievements }: { alumni: AlumniRecord; achievements: Achievement[] }) {
  const [state, onSubmit, pending] = useFormAction(submitAchievementNomination);
  return (
    <div className="space-y-8">
      <div className="bg-card p-6 shadow-soft ring-1 ring-line/80">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="font-serif text-2xl text-navy">My Achievements</h2>
            <p className="text-xs text-muted-strong">
              Professional milestones and honours submitted to the Distinguished Alumni roll.
            </p>
          </div>
          <Link href="/achievements" className="text-xs font-semibold text-gold-deep hover:underline">
            View Distinguished Alumni Directory →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line">
          {achievements.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-serif text-xl text-navy">{a.name}</p>
                <p className="text-xs text-muted-strong">
                  {categoryName(a.category)} · {a.designation} · {a.organisation}
                </p>
                <p className="mt-1 text-xs text-ink/85">{a.summary}</p>
              </div>
              <Badge variant={a.published ? "success" : "warning"}>
                {a.published ? "Verified & Published" : "Pending Verification"}
              </Badge>
            </li>
          ))}
          {!achievements.length ? (
            <li className="py-6 text-center text-sm text-muted-strong">
              No achievement submissions linked to your profile yet. Submit one below.
            </li>
          ) : null}
        </ul>
      </div>

      <div className="bg-card p-6 shadow-soft ring-1 ring-line/80">
        <h3 className="font-serif text-2xl text-navy">Submit a New Achievement</h3>
        <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
          <input type="hidden" name="name" value={alumni.fullName} />
          <input type="hidden" name="submitterEmail" value={alumni.email} />
          <input type="hidden" name="graduationYear" value={alumni.graduationYear} />
          <input type="hidden" name="department" value={alumni.department} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="ma-cat" label="Category" required>
              {(a) => (
                <Select {...a} name="category" defaultValue="science-technology">
                  {achievementCategories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field id="ma-des" label="Designation" required>
              {(a) => <Input {...a} name="designation" defaultValue={alumni.designation ?? ""} />}
            </Field>
            <Field id="ma-org" label="Organisation" required>
              {(a) => <Input {...a} name="organisation" defaultValue={alumni.organisation ?? ""} />}
            </Field>
          </div>
          <Field id="ma-sum" label="Achievement citation" required>
            {(a) => <Textarea {...a} name="summary" rows={2} className="min-h-20" />}
          </Field>
          <Checkbox
            id="ma-consent"
            name="consent"
            defaultChecked
            label="I confirm this achievement is accurate and may be verified by the Association."
          />
          <FormStatus state={state} />
          <SubmitButton pending={pending} variant="navy">
            Submit Achievement for Verification
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

/* ==================================================================
   TAB 7: EVENTS & REUNIONS
   ================================================================== */
function EventsTab({ events }: { events: NHEvent[] }) {
  return (
    <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="font-serif text-3xl text-navy">Events &amp; Reunions</h2>
          <p className="text-sm text-muted-strong">
            Upcoming alumni meets, guest lectures and house gatherings.
          </p>
        </div>
        <Link href="/events" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Full Calendar
        </Link>
      </div>

      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {events.map((e) => (
          <li key={e.id} className="flex flex-col justify-between border border-line bg-ivory/40 p-5">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-label text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
                  {formatDate(e.startsAt)}
                </span>
                {e.isDemo ? <Badge variant="sample">Demonstration</Badge> : null}
              </div>
              <h3 className="mt-2 font-serif text-2xl text-navy">{e.title}</h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-strong">
                <MapPin className="size-3.5 text-gold-dark" aria-hidden /> {e.venue}, {e.city}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-strong">{e.summary}</p>
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-line/70 pt-4">
              <Link href={`/events/${e.slug}`} className={cn(buttonVariants({ variant: "navy", size: "sm" }))}>
                {e.registrationOpen ? "Register / Details" : "View Details"}
              </Link>
              <a
                href={`/events/${e.slug}/calendar`}
                className="text-xs font-semibold text-gold-deep hover:underline"
              >
                Download .ics
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ==================================================================
   TAB 8: MENTORSHIP
   ================================================================== */
function MentorshipTab({ requests }: { requests: MentorshipRequest[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div>
            <h2 className="font-serif text-3xl text-navy">Mentorship Network</h2>
            <p className="mt-1 text-sm text-muted-strong">
              Track your mentorship requests or volunteer as a mentor for students and fellow alumni.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/mentorship" className={cn(buttonVariants({ variant: "navy", size: "sm" }))}>
              <Compass aria-hidden /> Find a Mentor
            </Link>
            <Link href="/mentorship#become-mentor" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Become a Mentor
            </Link>
          </div>
        </div>

        <h3 className="mt-6 font-label text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-strong">
          My Mentorship Requests &amp; Sessions ({requests.length})
        </h3>
        <ul className="mt-4 divide-y divide-line">
          {requests.map((r) => (
            <li key={r.id} className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-serif text-2xl text-navy">{r.title}</p>
                <Badge
                  variant={
                    r.status === "accepted"
                      ? "success"
                      : r.status === "declined"
                        ? "danger"
                        : "warning"
                  }
                >
                  {r.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-gold-deep">
                Mentor: <strong>{r.mentorName}</strong> · Mentee: <strong>{r.menteeName}</strong> ({r.menteeBatch}) ·{" "}
                {r.preferredCommunication}
              </p>
              <p className="mt-2 text-sm text-ink/90">{r.question}</p>
              {r.mentorResponseNote ? (
                <p className="mt-2 rounded bg-ivory p-3 text-xs italic text-navy">
                  Mentor note: “{r.mentorResponseNote}”
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <ActionButton
                  size="sm"
                  variant="navy"
                  action={respondToMentorshipRequestAction.bind(
                    null,
                    r.id,
                    "accepted",
                    "Accepted via Member Dashboard.",
                  )}
                >
                  Accept
                </ActionButton>
                <ActionButton
                  size="sm"
                  variant="outline"
                  action={respondToMentorshipRequestAction.bind(
                    null,
                    r.id,
                    "info_requested",
                    "Please share additional background on your goals.",
                  )}
                >
                  Request More Info
                </ActionButton>
                <ActionButton
                  size="sm"
                  variant="ghost"
                  className="text-brick"
                  action={respondToMentorshipRequestAction.bind(null, r.id, "declined", null)}
                >
                  Decline
                </ActionButton>
              </div>
            </li>
          ))}
          {!requests.length ? (
            <li className="py-8 text-center text-sm text-muted-strong">
              No mentorship requests yet. Visit the Mentorship Network to connect with a mentor.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

/* ==================================================================
   TAB 9: NOTIFICATIONS
   ================================================================== */
function NotificationsTab({ notifications }: { notifications: MemberNotification[] }) {
  return (
    <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="font-serif text-3xl text-navy">Notifications</h2>
          <p className="text-sm text-muted-strong">
            Updates on your verification status, connections, events, stories and association announcements.
          </p>
        </div>
        <ActionButton size="sm" variant="outline" action={markAllMemberNotificationsRead}>
          Mark all as read
        </ActionButton>
      </div>

      <ul className="mt-4 divide-y divide-line">
        {notifications.map((n) => (
          <li key={n.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                {!n.read ? <span className="size-2 rounded-full bg-gold-dark" /> : null}
                <p className="font-semibold text-ink">{n.title}</p>
                <span className="text-xs text-muted">· {formatDate(n.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-strong">{n.body}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={n.href} className="text-xs font-semibold text-gold-deep hover:underline">
                View →
              </Link>
              {!n.read ? (
                <ActionButton
                  size="sm"
                  variant="ghost"
                  action={markNotificationAsRead.bind(null, n.id)}
                >
                  Mark read
                </ActionButton>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ==================================================================
   TAB 10: PRIVACY SETTINGS
   ================================================================== */
function PrivacyTab({ alumni }: { alumni: AlumniRecord }) {
  const [state, onSubmit, pending] = useFormAction(updateAdvancedMemberProfile);
  const visibilityCards = [
    {
      value: "public",
      icon: Globe2,
      title: "Public Profile",
      description: "Visible to visitors and fellow alumni in the directory and batch pages.",
    },
    {
      value: "members",
      icon: Users,
      title: "Members-Only Profile",
      description: "Visible only to signed-in, verified Newton House alumni and administrators.",
    },
    {
      value: "private",
      icon: Lock,
      title: "Private Profile",
      description: "Hidden from public and member directories. Visible only to you and administrators.",
    },
  ] as const;

  return (
    <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 sm:p-8">
      <h2 className="font-serif text-3xl text-navy">Privacy Settings</h2>
      <p className="mt-1 text-sm text-muted-strong">
        Control who can view your profile, email address, location and professional information across the entire
        platform.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-8">
        <input type="hidden" name="fullName" value={alumni.fullName} />
        <input type="hidden" name="department" value={alumni.department} />
        <input type="hidden" name="graduationYear" value={alumni.graduationYear} />
        <input
          type="hidden"
          name="residenceStartYear"
          value={alumni.residenceStartYear ?? alumni.graduationYear - 3}
        />
        <input type="hidden" name="designation" value={alumni.designation ?? ""} />
        <input type="hidden" name="organisation" value={alumni.organisation ?? ""} />
        <input type="hidden" name="profession" value={alumni.profession ?? ""} />
        <input type="hidden" name="city" value={alumni.city ?? ""} />
        <input type="hidden" name="country" value={alumni.country ?? "India"} />
        <input type="hidden" name="linkedinUrl" value={alumni.linkedinUrl ?? ""} />
        <input type="hidden" name="bio" value={alumni.bio ?? ""} />

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-navy">1. Directory Visibility Tier</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            {visibilityCards.map((c) => (
              <label
                key={c.value}
                className="group relative flex cursor-pointer flex-col rounded-md border border-line bg-ivory/40 p-5 transition-colors has-[:checked]:border-gold-dark has-[:checked]:bg-gold/10"
              >
                <input
                  type="radio"
                  name="visibility"
                  value={c.value}
                  defaultChecked={alumni.visibility === c.value}
                  className="sr-only"
                />
                <c.icon className="size-5 text-gold-dark" aria-hidden />
                <span className="mt-3 font-serif text-xl text-navy">{c.title}</span>
                <span className="mt-1 text-xs leading-relaxed text-muted-strong">{c.description}</span>
                <CheckCircle2
                  className="absolute right-4 top-4 size-4 text-gold-dark opacity-0 transition-opacity group-has-[:checked]:opacity-100"
                  aria-hidden
                />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-line pt-6">
          <legend className="text-sm font-semibold text-navy">2. Granular Field Visibility</legend>
          <Checkbox
            id="priv-email"
            name="showEmail"
            defaultChecked={alumni.showEmail}
            label="Email visibility — Show my email address to signed-in verified alumni"
            description={`Your registered email (${alumni.email}) is never exposed to unauthenticated visitors.`}
          />
          <Checkbox
            id="priv-loc"
            name="showLocation"
            defaultChecked={alumni.showLocation !== false}
            label="Location visibility — Display my current city and country on my profile and batch cards"
            description="Uncheck to hide your city and country from directory and batch listings."
          />
          <Checkbox
            id="priv-prof"
            name="showProfessional"
            defaultChecked={alumni.showProfessional !== false}
            label="Professional information visibility — Display my designation, organisation, field and LinkedIn"
            description="Uncheck to show only your name, batch and department."
          />
        </fieldset>

        <FormStatus state={state} />
        <SubmitButton pending={pending} variant="navy" size="lg" pendingLabel="Saving privacy settings…">
          Save Privacy Preferences
        </SubmitButton>
      </form>
    </div>
  );
}

/* ==================================================================
   TAB 11: ACCOUNT SETTINGS
   ================================================================== */
function AccountTab({
  viewerEmail,
  alumni,
  verification,
}: {
  viewerEmail: string;
  alumni: AlumniRecord;
  verification: (typeof verificationStates)[AlumniStatus];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="bg-card p-6 shadow-soft ring-1 ring-line/80 sm:p-8 lg:col-span-6">
        <h2 className="font-serif text-3xl text-navy">Account &amp; Security</h2>
        <p className="mt-1 text-sm text-muted-strong">Update your sign-in password.</p>
        <div className="mt-6">
          <UpdatePasswordForm />
        </div>
      </div>

      <div className="space-y-6 lg:col-span-6">
        <div className="bg-card p-6 shadow-soft ring-1 ring-line/80">
          <h3 className="font-serif text-2xl text-navy">Account Summary</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-line pb-2">
              <dt className="text-muted-strong">Signed-in Email</dt>
              <dd className="font-medium text-ink">{viewerEmail}</dd>
            </div>
            <div className="flex justify-between border-b border-line pb-2">
              <dt className="text-muted-strong">Verification State</dt>
              <dd>
                <Badge variant={verification.badge}>{verification.label}</Badge>
              </dd>
            </div>
            <div className="flex justify-between border-b border-line pb-2">
              <dt className="text-muted-strong">Profile URL</dt>
              <dd>
                <Link href={`/alumni/${alumni.slug}`} className="font-semibold text-gold-deep hover:underline">
                  /alumni/{alumni.slug}
                </Link>
              </dd>
            </div>
          </dl>
          <form action={signOut} className="mt-6">
            <Button type="submit" variant="outline" className="w-full text-brick">
              <LogOut aria-hidden /> Sign out of this device
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
