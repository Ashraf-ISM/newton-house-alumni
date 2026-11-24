import { archiveCategories, mentorCategories, storyCategories } from "@/data/community";
import { slugify, uid } from "@/lib/utils";
import type {
  AlumniConnection,
  AlumniProfile,
  AlumniRecord,
  AlumniStory,
  ArchiveItem,
  AuditLogEntry,
  BatchContribution,
  BatchRecord,
  ConnectionStatus,
  Department,
  MemberNotification,
  MentorProfile,
  MentorshipRequest,
  MentorshipRequestStatus,
  ModerationStatus,
  SiteSettings,
  StoryStatus,
} from "@/types";
import { listDirectory } from "./alumni";
import { store } from "./store";

/* ==================================================================
   1. PROFILE COMPLETION & SUGGESTED CONNECTIONS
   ================================================================== */
export function calculateProfileCompletion(a: AlumniRecord | null): {
  percentage: number;
  missing: string[];
} {
  if (!a) return { percentage: 0, missing: ["Complete alumni registration"] };
  const checks: [string, boolean][] = [
    ["Full name", Boolean(a.fullName)],
    ["Department", Boolean(a.department)],
    ["Graduation year", Boolean(a.graduationYear)],
    ["Residence start year", Boolean(a.residenceStartYear)],
    ["Designation", Boolean(a.designation)],
    ["Organisation", Boolean(a.organisation)],
    ["Professional field", Boolean(a.profession)],
    ["City & country", Boolean(a.city && a.country)],
    ["LinkedIn URL", Boolean(a.linkedinUrl)],
    ["Personal introduction", Boolean(a.bio && a.bio.length >= 20)],
    ["Profile photograph", Boolean(a.photoUrl)],
  ];
  const completed = checks.filter(([, ok]) => ok).length;
  const missing = checks.filter(([, ok]) => !ok).map(([label]) => label);
  return {
    percentage: Math.round((completed / checks.length) * 100),
    missing,
  };
}

function recordAudit(entry: Omit<AuditLogEntry, "id" | "createdAt">) {
  store().auditLogs.unshift({
    ...entry,
    id: uid(),
    createdAt: new Date().toISOString(),
  });
}

/* ==================================================================
   2. CONNECTIONS & NOTIFICATIONS
   ================================================================== */
export interface EnrichedConnection extends AlumniConnection {
  peer: AlumniProfile;
  direction: "incoming" | "outgoing";
}

export async function listConnectionsForAlumnus(
  alumniId: string,
  viewerIsMember = true,
): Promise<{
  accepted: EnrichedConnection[];
  incoming: EnrichedConnection[];
  outgoing: EnrichedConnection[];
  suggested: AlumniProfile[];
}> {
  const s = store();
  const directory = await listDirectory({ viewerIsMember });
  const byId = new Map(directory.map((a) => [a.id, a]));
  const me = s.alumni.find((a) => a.id === alumniId);

  const relevant = s.connections.filter(
    (c) => c.requesterId === alumniId || c.recipientId === alumniId,
  );

  const accepted: EnrichedConnection[] = [];
  const incoming: EnrichedConnection[] = [];
  const outgoing: EnrichedConnection[] = [];
  const connectedIds = new Set<string>([alumniId]);

  for (const c of relevant) {
    const peerId = c.requesterId === alumniId ? c.recipientId : c.requesterId;
    connectedIds.add(peerId);
    const peer = byId.get(peerId);
    if (!peer) continue;
    const direction = c.recipientId === alumniId ? "incoming" : "outgoing";
    const item: EnrichedConnection = { ...c, peer, direction };
    if (c.status === "accepted") accepted.push(item);
    else if (c.status === "pending" && direction === "incoming") incoming.push(item);
    else if (c.status === "pending" && direction === "outgoing") outgoing.push(item);
  }

  const suggested = directory
    .filter((a) => !connectedIds.has(a.id))
    .sort((a, b) => {
      const scoreA =
        (me && a.graduationYear === me.graduationYear ? 3 : 0) +
        (me && a.department === me.department ? 2 : 0) +
        (me && a.city === me.city ? 1 : 0);
      const scoreB =
        (me && b.graduationYear === me.graduationYear ? 3 : 0) +
        (me && b.department === me.department ? 2 : 0) +
        (me && b.city === me.city ? 1 : 0);
      return scoreB - scoreA || a.fullName.localeCompare(b.fullName);
    })
    .slice(0, 6);

  return { accepted, incoming, outgoing, suggested };
}

export function sendConnectionRequest(
  requesterId: string,
  recipientId: string,
  note: string | null,
) {
  if (requesterId === recipientId) throw new Error("You cannot connect with yourself.");
  const s = store();
  if (!s.settings.allowMemberConnections) {
    throw new Error("Connection requests are currently disabled by the administrator.");
  }
  const existing = s.connections.find(
    (c) =>
      (c.requesterId === requesterId && c.recipientId === recipientId) ||
      (c.requesterId === recipientId && c.recipientId === requesterId),
  );
  if (existing) {
    if (existing.status === "rejected") {
      existing.status = "pending";
      existing.requesterId = requesterId;
      existing.recipientId = recipientId;
      existing.note = note;
      existing.updatedAt = new Date().toISOString();
      return existing;
    }
    throw new Error("A connection or pending request already exists with this alumnus.");
  }

  const now = new Date().toISOString();
  const conn: AlumniConnection = {
    id: uid(),
    requesterId,
    recipientId,
    status: "pending",
    note,
    createdAt: now,
    updatedAt: now,
  };
  s.connections.unshift(conn);

  const requester = s.alumni.find((a) => a.id === requesterId);
  s.notifications.unshift({
    id: uid(),
    alumniId: recipientId,
    type: "connection_request",
    title: "New Connection Request",
    body: `${requester?.fullName ?? "A fellow alumnus"} sent you a connection request.`,
    href: "/member/dashboard?tab=connections",
    read: false,
    createdAt: now,
  });

  return conn;
}

export function respondConnectionRequest(
  connectionId: string,
  actorAlumniId: string,
  status: Extract<ConnectionStatus, "accepted" | "rejected">,
) {
  const s = store();
  const conn = s.connections.find((c) => c.id === connectionId);
  if (!conn || conn.recipientId !== actorAlumniId) {
    throw new Error("Connection request not found.");
  }
  conn.status = status;
  conn.updatedAt = new Date().toISOString();
  return conn;
}

export function removeConnection(connectionId: string, actorAlumniId: string) {
  const s = store();
  const idx = s.connections.findIndex(
    (c) => c.id === connectionId && (c.requesterId === actorAlumniId || c.recipientId === actorAlumniId),
  );
  if (idx === -1) throw new Error("Connection not found.");
  s.connections.splice(idx, 1);
}

export function listNotificationsForAlumnus(alumniId: string | null): MemberNotification[] {
  return store()
    .notifications.filter((n) => n.alumniId === null || (alumniId && n.alumniId === alumniId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markNotificationRead(id: string, alumniId: string | null) {
  const n = store().notifications.find(
    (x) => x.id === id && (x.alumniId === null || x.alumniId === alumniId),
  );
  if (n) n.read = true;
}

export function markAllNotificationsRead(alumniId: string | null) {
  for (const n of store().notifications) {
    if (n.alumniId === null || n.alumniId === alumniId) n.read = true;
  }
}

/* ==================================================================
   3. BATCH DIRECTORY & CONTRIBUTIONS
   ================================================================== */
export interface BatchSummary extends BatchRecord {
  memberCount: number;
  departments: { department: Department; count: number }[];
  members: AlumniProfile[];
  contributions: BatchContribution[];
}

export async function listBatchesWithMembers(opts: { viewerIsMember: boolean }): Promise<BatchSummary[]> {
  const s = store();
  const alumni = await listDirectory(opts);
  const byYear = new Map<number, AlumniProfile[]>();
  for (const a of alumni) {
    const arr = byYear.get(a.graduationYear) ?? [];
    arr.push(a);
    byYear.set(a.graduationYear, arr);
  }

  const allYears = new Set<number>([
    ...s.batches.map((b) => b.year),
    ...byYear.keys(),
  ]);

  const summaries: BatchSummary[] = [];
  for (const year of [...allYears].sort((a, b) => b - a)) {
    const existing = s.batches.find((b) => b.year === year);
    const members = byYear.get(year) ?? [];
    const deptCounts = new Map<Department, number>();
    for (const m of members) {
      deptCounts.set(m.department, (deptCounts.get(m.department) ?? 0) + 1);
    }
    const departments = [...deptCounts.entries()]
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count || a.department.localeCompare(b.department));

    const slug = existing?.slug ?? `batch-${year}`;
    const contributions = s.batchContributions.filter(
      (c) => (c.batchSlug === slug || c.batchYear === year) && c.status === "approved",
    );

    summaries.push({
      id: existing?.id ?? `batch-${year}`,
      slug,
      year,
      residencePeriod: existing?.residencePeriod ?? `${year - 3} – ${year}`,
      title: existing?.title ?? `Class of ${year}`,
      description:
        existing?.description ??
        `Newton House residents who graduated in ${year} (${year - 3}–${year} residence cohort).`,
      photoUrl: existing?.photoUrl ?? null,
      isSample: existing?.isSample ?? members.every((m) => m.isSample),
      memberCount: members.length,
      departments,
      members,
      contributions,
    });
  }

  return summaries;
}

export async function getBatchBySlug(
  slug: string,
  opts: { viewerIsMember: boolean },
): Promise<BatchSummary | null> {
  const all = await listBatchesWithMembers(opts);
  return all.find((b) => b.slug === slug || String(b.year) === slug) ?? null;
}

export function submitBatchContribution(
  input: Omit<BatchContribution, "id" | "submittedAt" | "reviewedBy" | "reviewedAt" | "status" | "isSample">,
) {
  const s = store();
  const item: BatchContribution = {
    ...input,
    id: uid(),
    submittedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    status: "pending",
    isSample: false,
  };
  s.batchContributions.unshift(item);
  return item;
}

export function listBatchContributions(opts: { includeUnapproved?: boolean } = {}): BatchContribution[] {
  return store().batchContributions.filter((c) => opts.includeUnapproved || c.status === "approved");
}

export function moderateBatchContribution(
  id: string,
  status: ModerationStatus,
  reviewerEmail: string,
) {
  const s = store();
  const item = s.batchContributions.find((c) => c.id === id);
  if (!item) throw new Error("Contribution not found.");
  const prev = item.status;
  item.status = status;
  item.reviewedBy = reviewerEmail;
  item.reviewedAt = new Date().toISOString();
  recordAudit({
    entityType: "batch_contribution",
    entityId: item.id,
    entityTitle: `${item.title} (Batch ${item.batchYear})`,
    action: `Batch contribution ${status}`,
    actorEmail: reviewerEmail,
    previousStatus: prev,
    newStatus: status,
  });
}

/* ==================================================================
   4. DIGITAL HERITAGE ARCHIVE
   ================================================================== */
export { archiveCategories };

export function listArchiveItems(opts: { includeUnapproved?: boolean } = {}): ArchiveItem[] {
  return store().archiveItems.filter((i) => opts.includeUnapproved || i.status === "approved");
}

export function submitArchiveItem(
  input: Omit<ArchiveItem, "id" | "submittedAt" | "reviewedBy" | "reviewedAt" | "status" | "isSample">,
) {
  const s = store();
  const item: ArchiveItem = {
    ...input,
    id: uid(),
    submittedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    status: "pending",
    isSample: false,
  };
  s.archiveItems.unshift(item);
  return item;
}

export function moderateArchiveItem(id: string, status: ModerationStatus, reviewerEmail: string) {
  const s = store();
  const item = s.archiveItems.find((i) => i.id === id);
  if (!item) throw new Error("Archive item not found.");
  const prev = item.status;
  item.status = status;
  item.reviewedBy = reviewerEmail;
  item.reviewedAt = new Date().toISOString();
  recordAudit({
    entityType: "archive",
    entityId: item.id,
    entityTitle: item.title,
    action: `Archive item ${status}`,
    actorEmail: reviewerEmail,
    previousStatus: prev,
    newStatus: status,
  });
}

export function deleteArchiveItem(id: string, reviewerEmail: string) {
  const s = store();
  const item = s.archiveItems.find((i) => i.id === id);
  if (!item) throw new Error("Archive item not found.");
  s.archiveItems = s.archiveItems.filter((i) => i.id !== id);
  recordAudit({
    entityType: "archive",
    entityId: id,
    entityTitle: item.title,
    action: "Archive item deleted",
    actorEmail: reviewerEmail,
    previousStatus: item.status,
    newStatus: "deleted",
  });
}

/* ==================================================================
   5. ALUMNI STORIES
   ================================================================== */
export { storyCategories };

export function listStories(opts: { includeUnpublished?: boolean } = {}): AlumniStory[] {
  return store().stories.filter((st) => opts.includeUnpublished || st.status === "published");
}

export function getStoryBySlug(slug: string, opts: { includeUnpublished?: boolean } = {}): AlumniStory | null {
  return listStories(opts).find((s) => s.slug === slug) ?? null;
}

export function getStoryById(id: string): AlumniStory | null {
  return store().stories.find((s) => s.id === id) ?? null;
}

export function submitStory(
  input: Omit<
    AlumniStory,
    "id" | "slug" | "featured" | "status" | "publishedAt" | "submittedAt" | "reviewedBy" | "reviewedAt" | "isSample"
  > & { status?: Extract<StoryStatus, "draft" | "submitted"> },
) {
  const s = store();
  const baseSlug = slugify(input.title) || `story-${Date.now()}`;
  let slug = baseSlug;
  let n = 2;
  while (s.stories.some((st) => st.slug === slug)) slug = `${baseSlug}-${n++}`;

  const story: AlumniStory = {
    ...input,
    id: uid(),
    slug,
    featured: false,
    status: input.status ?? "submitted",
    publishedAt: null,
    submittedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    isSample: false,
  };
  s.stories.unshift(story);
  return story;
}

export function moderateStory(
  id: string,
  status: StoryStatus,
  reviewerEmail: string,
  patch?: Partial<Pick<AlumniStory, "title" | "summary" | "content" | "categorySlug" | "featured">>,
) {
  const s = store();
  const story = s.stories.find((st) => st.id === id);
  if (!story) throw new Error("Story not found.");
  const prev = story.status;
  if (patch) Object.assign(story, patch);
  story.status = status;
  story.reviewedBy = reviewerEmail;
  story.reviewedAt = new Date().toISOString();
  if (status === "published" && !story.publishedAt) {
    story.publishedAt = story.reviewedAt;
    if (story.authorAlumniId) {
      s.notifications.unshift({
        id: uid(),
        alumniId: story.authorAlumniId,
        type: "published_story",
        title: "Your Alumni Story Is Published",
        body: `"${story.title}" is now live in Voices of Newton House.`,
        href: `/alumni/stories/${story.slug}`,
        read: false,
        createdAt: story.reviewedAt,
      });
    }
  }
  recordAudit({
    entityType: "story",
    entityId: story.id,
    entityTitle: story.title,
    action: `Story status updated to ${status}`,
    actorEmail: reviewerEmail,
    previousStatus: prev,
    newStatus: status,
  });
}

export function deleteStory(id: string, reviewerEmail: string) {
  const s = store();
  const story = s.stories.find((st) => st.id === id);
  if (!story) throw new Error("Story not found.");
  s.stories = s.stories.filter((st) => st.id !== id);
  recordAudit({
    entityType: "story",
    entityId: id,
    entityTitle: story.title,
    action: "Story deleted",
    actorEmail: reviewerEmail,
    previousStatus: story.status,
    newStatus: "deleted",
  });
}

/* ==================================================================
   6. MENTORSHIP NETWORK
   ================================================================== */
export { mentorCategories };

export function listMentors(opts: { includeUnapproved?: boolean } = {}): MentorProfile[] {
  return store().mentors.filter((m) => opts.includeUnapproved || m.status === "approved");
}

export function submitMentorProfile(
  input: Omit<MentorProfile, "id" | "submittedAt" | "reviewedBy" | "reviewedAt" | "status" | "isSample">,
) {
  const s = store();
  const existing = s.mentors.find(
    (m) => (input.alumniId && m.alumniId === input.alumniId) || m.submittedBy.toLowerCase() === input.submittedBy.toLowerCase(),
  );
  if (existing) {
    Object.assign(existing, {
      ...input,
      status: "pending" as const,
      submittedAt: new Date().toISOString(),
    });
    return existing;
  }
  const mentor: MentorProfile = {
    ...input,
    id: uid(),
    submittedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    status: "pending",
    isSample: false,
  };
  s.mentors.unshift(mentor);
  return mentor;
}

export function moderateMentorProfile(id: string, status: ModerationStatus, reviewerEmail: string) {
  const s = store();
  const mentor = s.mentors.find((m) => m.id === id);
  if (!mentor) throw new Error("Mentor profile not found.");
  const prev = mentor.status;
  mentor.status = status;
  mentor.reviewedBy = reviewerEmail;
  mentor.reviewedAt = new Date().toISOString();
  recordAudit({
    entityType: "mentor",
    entityId: mentor.id,
    entityTitle: `${mentor.name} (${mentor.designation})`,
    action: `Mentor profile ${status}`,
    actorEmail: reviewerEmail,
    previousStatus: prev,
    newStatus: status,
  });
}

export function submitMentorshipRequest(
  input: Omit<MentorshipRequest, "id" | "status" | "mentorResponseNote" | "createdAt" | "updatedAt">,
) {
  const s = store();
  const mentor = s.mentors.find((m) => m.id === input.mentorId && m.status === "approved");
  if (!mentor) throw new Error("Selected mentor is not available.");
  const now = new Date().toISOString();
  const req: MentorshipRequest = {
    ...input,
    id: uid(),
    status: "pending",
    mentorResponseNote: null,
    createdAt: now,
    updatedAt: now,
  };
  s.mentorshipRequests.unshift(req);
  return req;
}

export function listMentorshipRequests(opts: {
  alumniId?: string | null;
  includeAllForAdmin?: boolean;
}): MentorshipRequest[] {
  const s = store();
  if (opts.includeAllForAdmin) return [...s.mentorshipRequests];
  if (!opts.alumniId) return [];
  const myMentorIds = new Set(
    s.mentors.filter((m) => m.alumniId === opts.alumniId).map((m) => m.id),
  );
  return s.mentorshipRequests.filter(
    (r) => r.menteeAlumniId === opts.alumniId || myMentorIds.has(r.mentorId),
  );
}

export function respondMentorshipRequest(
  requestId: string,
  status: MentorshipRequestStatus,
  note: string | null,
  actorEmail: string,
) {
  const s = store();
  const req = s.mentorshipRequests.find((r) => r.id === requestId);
  if (!req) throw new Error("Mentorship request not found.");
  const prev = req.status;
  req.status = status;
  req.mentorResponseNote = note;
  req.updatedAt = new Date().toISOString();
  recordAudit({
    entityType: "mentorship_request",
    entityId: req.id,
    entityTitle: `${req.title} (${req.menteeName} → ${req.mentorName})`,
    action: `Mentorship request ${status}`,
    actorEmail,
    previousStatus: prev,
    newStatus: status,
  });
}

/* ==================================================================
   7. AUDIT LOGS, ROLES & SITE SETTINGS
   ================================================================== */
export function listAuditLogs(): AuditLogEntry[] {
  return [...store().auditLogs];
}

export function getSiteSettings(): SiteSettings {
  return store().settings;
}

export function updateSiteSettings(patch: Partial<SiteSettings>, actorEmail: string) {
  const s = store();
  Object.assign(s.settings, patch, {
    updatedAt: new Date().toISOString(),
    updatedBy: actorEmail,
  });
  recordAudit({
    entityType: "settings",
    entityId: "site-settings",
    entityTitle: "Platform Moderation & Privacy Settings",
    action: "Updated platform settings",
    actorEmail,
    previousStatus: null,
    newStatus: "updated",
  });
}
