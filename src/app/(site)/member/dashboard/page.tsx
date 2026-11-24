import type { Metadata } from "next";
import { MemberDashboard, type DashboardTab } from "@/components/member/member-dashboard";
import { requireUser } from "@/lib/auth";
import { listDirectory } from "@/lib/data/alumni";
import {
  calculateProfileCompletion,
  listArchiveItems,
  listConnectionsForAlumnus,
  listMentorshipRequests,
  listNotificationsForAlumnus,
  listStories,
} from "@/lib/data/community";
import { listAchievements } from "@/lib/data/content";
import { splitEvents } from "@/lib/data/events";
import { DEMO_MEMBER_ID, store } from "@/lib/data/store";
import { paramValue } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Member Dashboard",
  description: "Newton House Alumni Member Portal — manage your profile, connections, batch, stories and privacy.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const validTabs: DashboardTab[] = [
  "overview",
  "profile",
  "batch",
  "connections",
  "memories",
  "achievements",
  "events",
  "mentorship",
  "notifications",
  "privacy",
  "account",
];

export default async function MemberDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireUser("/member/dashboard");
  const sp = await searchParams;
  const rawTab = paramValue(sp.tab) as DashboardTab | undefined;
  const initialTab = rawTab && validTabs.includes(rawTab) ? rawTab : "overview";

  // If an administrator opens /member/dashboard without a personal alumni row, use the seeded member record for preview
  const alumni =
    viewer.alumni ??
    store().alumni.find((a) => a.id === DEMO_MEMBER_ID) ??
    store().alumni[0];

  const [connections, directory, { upcoming }, allAchievements] = await Promise.all([
    listConnectionsForAlumnus(alumni.id, true),
    listDirectory({ viewerIsMember: true }),
    splitEvents(),
    listAchievements({ includeUnpublished: true }),
  ]);

  const completion = calculateProfileCompletion(alumni);
  const batchPeers = directory.filter((a) => a.graduationYear === alumni.graduationYear);
  const notifications = listNotificationsForAlumnus(alumni.id);
  const myAchievements = allAchievements.filter(
    (a) =>
      a.name.toLowerCase().includes(alumni.fullName.toLowerCase()) ||
      (viewer.email && a.submittedBy?.toLowerCase() === viewer.email.toLowerCase()),
  );
  const myStories = listStories({ includeUnpublished: true }).filter(
    (s) =>
      s.authorAlumniId === alumni.id ||
      (viewer.email && s.submittedBy.toLowerCase() === viewer.email.toLowerCase()),
  );
  const myArchiveItems = listArchiveItems({ includeUnapproved: true }).filter(
    (i) => viewer.email && i.submittedBy.toLowerCase() === viewer.email.toLowerCase(),
  );
  const mentorshipRequests = listMentorshipRequests({
    alumniId: alumni.id,
    includeAllForAdmin: Boolean(viewer.role),
  });

  return (
    <MemberDashboard
      initialTab={initialTab}
      viewerEmail={viewer.email ?? alumni.email}
      viewerRole={viewer.role}
      demo={viewer.demo}
      alumni={alumni}
      completion={completion}
      connections={connections}
      batchPeers={batchPeers}
      notifications={notifications}
      upcomingEvents={upcoming}
      myAchievements={myAchievements}
      myStories={myStories}
      myArchiveItems={myArchiveItems}
      mentorshipRequests={mentorshipRequests}
    />
  );
}
