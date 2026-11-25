import { uid } from "@/lib/utils";
import type {
  AlumniTestimonial,
  AssociationLeader,
  AuditLogEntry,
  HeritageMilestone,
  ModerationStatus,
  SuperintendentRecord,
} from "@/types";
import { listDirectory } from "./alumni";
import { listBatchesWithMembers } from "./community";
import { store } from "./store";

function recordAudit(entry: Omit<AuditLogEntry, "id" | "createdAt">) {
  store().auditLogs.unshift({
    ...entry,
    id: uid(),
    createdAt: new Date().toISOString(),
  });
}

/* ==================================================================
   1. SUPERINTENDENTS OF NEWTON HOUSE
   ================================================================== */
export function listSuperintendents(opts: { includeUnpublished?: boolean } = {}): SuperintendentRecord[] {
  return [...store().superintendents]
    .filter((s) => opts.includeUnpublished || s.isPublished)
    .sort((a, b) => {
      if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
      return a.displayOrder - b.displayOrder;
    });
}

/**
 * Transitions any existing `isCurrent` superintendent to a former superintendent
 * while preserving their complete historical profile and service record.
 */
function demotePreviousCurrentSuperintendents(exceptId: string, newTenureStart: string | null) {
  const s = store();
  const nowIso = new Date().toISOString();
  for (const rec of s.superintendents) {
    if (rec.id !== exceptId && rec.isCurrent) {
      rec.isCurrent = false;
      if (rec.designation.toLowerCase().includes("current superintendent")) {
        rec.designation = "Former Superintendent, Newton House";
      }
      if (!rec.tenureEnd || rec.tenureEnd.toLowerCase() === "present") {
        rec.tenureEnd = newTenureStart || rec.tenureEnd || null;
      }
      if (rec.tenureStart && rec.tenureEnd) {
        rec.tenurePeriodLabel = `${rec.tenureStart} – ${rec.tenureEnd}`;
      } else if (rec.tenurePeriodLabel.toLowerCase().startsWith("current tenure")) {
        rec.tenurePeriodLabel = rec.tenureStart
          ? `${rec.tenureStart} – Former Tenure`
          : "Former Tenure · Official Dates Pending Verification";
      }
      rec.updatedAt = nowIso;
    }
  }
}

export function upsertSuperintendent(
  id: string | null,
  input: Omit<SuperintendentRecord, "id" | "createdAt" | "updatedAt">,
  actorEmail: string,
): SuperintendentRecord {
  const s = store();
  const now = new Date().toISOString();

  if (id) {
    const existing = s.superintendents.find((x) => x.id === id);
    if (!existing) throw new Error("Superintendent profile not found.");
    if (input.isCurrent) {
      demotePreviousCurrentSuperintendents(id, input.tenureStart);
    }
    Object.assign(existing, input, { updatedAt: now });
    recordAudit({
      entityType: "superintendent",
      entityId: existing.id,
      entityTitle: existing.fullName,
      action: input.isCurrent
        ? "Updated & marked as Current Superintendent"
        : "Updated superintendent profile",
      actorEmail,
      previousStatus: null,
      newStatus: existing.isPublished ? "published" : "unpublished",
    });
    return existing;
  }

  const newId = uid();
  if (input.isCurrent) {
    demotePreviousCurrentSuperintendents(newId, input.tenureStart);
  }
  const created: SuperintendentRecord = {
    ...input,
    id: newId,
    createdAt: now,
    updatedAt: now,
  };
  s.superintendents.push(created);
  recordAudit({
    entityType: "superintendent",
    entityId: created.id,
    entityTitle: created.fullName,
    action: created.isCurrent
      ? "Appointed new Current Superintendent (historical records preserved)"
      : "Added former superintendent record",
    actorEmail,
    previousStatus: null,
    newStatus: created.isPublished ? "published" : "unpublished",
  });
  return created;
}

export function setCurrentSuperintendent(id: string, actorEmail: string) {
  const s = store();
  const target = s.superintendents.find((x) => x.id === id);
  if (!target) throw new Error("Superintendent profile not found.");

  demotePreviousCurrentSuperintendents(target.id, target.tenureStart);

  target.isCurrent = true;
  target.designation = "Current Superintendent, Newton House";
  target.tenureEnd = "Present";
  target.tenurePeriodLabel = target.tenureStart
    ? `${target.tenureStart} – Present`
    : "Current Tenure · Official Appointment Date Pending Verification";
  target.updatedAt = new Date().toISOString();

  recordAudit({
    entityType: "superintendent",
    entityId: target.id,
    entityTitle: target.fullName,
    action: "Designated as Current Superintendent (previous current moved to former)",
    actorEmail,
    previousStatus: "former",
    newStatus: "current",
  });
}

export function reorderSuperintendent(id: string, direction: "up" | "down", actorEmail: string) {
  const s = store();
  const ordered = [...s.superintendents].sort((a, b) => a.displayOrder - b.displayOrder);
  const idx = ordered.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("Superintendent profile not found.");
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= ordered.length) return;

  const a = ordered[idx];
  const b = ordered[swapIdx];
  const temp = a.displayOrder;
  a.displayOrder = b.displayOrder;
  b.displayOrder = temp === b.displayOrder ? temp + (direction === "up" ? -1 : 1) : temp;

  recordAudit({
    entityType: "superintendent",
    entityId: a.id,
    entityTitle: a.fullName,
    action: `Reordered superintendent profile (${direction})`,
    actorEmail,
    previousStatus: null,
    newStatus: `order ${a.displayOrder}`,
  });
}

export function toggleSuperintendentPublished(id: string, isPublished: boolean, actorEmail: string) {
  const s = store();
  const target = s.superintendents.find((x) => x.id === id);
  if (!target) throw new Error("Superintendent profile not found.");
  const prev = target.isPublished ? "published" : "unpublished";
  target.isPublished = isPublished;
  target.updatedAt = new Date().toISOString();
  recordAudit({
    entityType: "superintendent",
    entityId: target.id,
    entityTitle: target.fullName,
    action: isPublished ? "Published superintendent profile" : "Unpublished superintendent profile",
    actorEmail,
    previousStatus: prev,
    newStatus: isPublished ? "published" : "unpublished",
  });
}

export function deleteSuperintendent(id: string, actorEmail: string) {
  const s = store();
  const target = s.superintendents.find((x) => x.id === id);
  if (!target) throw new Error("Superintendent profile not found.");
  s.superintendents = s.superintendents.filter((x) => x.id !== id);
  recordAudit({
    entityType: "superintendent",
    entityId: id,
    entityTitle: target.fullName,
    action: "Deleted superintendent record",
    actorEmail,
    previousStatus: target.isPublished ? "published" : "unpublished",
    newStatus: "deleted",
  });
}

/* ==================================================================
   2. HERITAGE TIMELINE MILESTONES
   ================================================================== */
export function listHeritageMilestones(opts: { includeUnpublished?: boolean } = {}): HeritageMilestone[] {
  return [...store().heritageMilestones]
    .filter((m) => opts.includeUnpublished || m.isPublished)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function upsertHeritageMilestone(
  id: string | null,
  input: Omit<HeritageMilestone, "id" | "createdAt" | "updatedAt">,
  actorEmail: string,
): HeritageMilestone {
  const s = store();
  const now = new Date().toISOString();

  if (id) {
    const existing = s.heritageMilestones.find((m) => m.id === id);
    if (!existing) throw new Error("Timeline milestone not found.");
    Object.assign(existing, input, { updatedAt: now });
    recordAudit({
      entityType: "timeline",
      entityId: existing.id,
      entityTitle: existing.title,
      action: "Updated heritage timeline milestone",
      actorEmail,
      previousStatus: null,
      newStatus: existing.isPublished ? "published" : "unpublished",
    });
    return existing;
  }

  const created: HeritageMilestone = {
    ...input,
    id: uid(),
    createdAt: now,
    updatedAt: now,
  };
  s.heritageMilestones.push(created);
  recordAudit({
    entityType: "timeline",
    entityId: created.id,
    entityTitle: created.title,
    action: "Added heritage timeline milestone",
    actorEmail,
    previousStatus: null,
    newStatus: created.isPublished ? "published" : "unpublished",
  });
  return created;
}

export function reorderHeritageMilestone(id: string, direction: "up" | "down", actorEmail: string) {
  const s = store();
  const ordered = [...s.heritageMilestones].sort((a, b) => a.displayOrder - b.displayOrder);
  const idx = ordered.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error("Timeline milestone not found.");
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= ordered.length) return;

  const a = ordered[idx];
  const b = ordered[swapIdx];
  const temp = a.displayOrder;
  a.displayOrder = b.displayOrder;
  b.displayOrder = temp === b.displayOrder ? temp + (direction === "up" ? -1 : 1) : temp;

  recordAudit({
    entityType: "timeline",
    entityId: a.id,
    entityTitle: a.title,
    action: `Reordered heritage milestone (${direction})`,
    actorEmail,
    previousStatus: null,
    newStatus: `order ${a.displayOrder}`,
  });
}

export function toggleHeritageMilestonePublished(id: string, isPublished: boolean, actorEmail: string) {
  const s = store();
  const target = s.heritageMilestones.find((m) => m.id === id);
  if (!target) throw new Error("Timeline milestone not found.");
  const prev = target.isPublished ? "published" : "unpublished";
  target.isPublished = isPublished;
  target.updatedAt = new Date().toISOString();
  recordAudit({
    entityType: "timeline",
    entityId: target.id,
    entityTitle: target.title,
    action: isPublished ? "Published heritage milestone" : "Unpublished heritage milestone",
    actorEmail,
    previousStatus: prev,
    newStatus: isPublished ? "published" : "unpublished",
  });
}

export function deleteHeritageMilestone(id: string, actorEmail: string) {
  const s = store();
  const target = s.heritageMilestones.find((m) => m.id === id);
  if (!target) throw new Error("Timeline milestone not found.");
  s.heritageMilestones = s.heritageMilestones.filter((m) => m.id !== id);
  recordAudit({
    entityType: "timeline",
    entityId: id,
    entityTitle: target.title,
    action: "Deleted heritage milestone",
    actorEmail,
    previousStatus: target.isPublished ? "published" : "unpublished",
    newStatus: "deleted",
  });
}

/* ==================================================================
   3. ALUMNI TESTIMONIALS (VOICES OF NEWTON HOUSE)
   ================================================================== */
export function listTestimonials(opts: { includeUnpublished?: boolean } = {}): AlumniTestimonial[] {
  return [...store().testimonials].filter(
    (t) => opts.includeUnpublished || (t.status === "approved" && t.isPublished),
  );
}

export function submitTestimonial(
  input: Pick<
    AlumniTestimonial,
    "alumniName" | "batchYear" | "department" | "designation" | "photoUrl" | "quote" | "submittedBy"
  >,
): AlumniTestimonial {
  const s = store();
  const item: AlumniTestimonial = {
    ...input,
    id: uid(),
    status: "pending",
    isPublished: false,
    isSample: false,
    submittedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
  };
  s.testimonials.unshift(item);
  return item;
}

export function moderateTestimonial(
  id: string,
  status: ModerationStatus,
  isPublished: boolean,
  actorEmail: string,
  patch?: Partial<Pick<AlumniTestimonial, "alumniName" | "batchYear" | "designation" | "quote" | "isSample">>,
) {
  const s = store();
  const item = s.testimonials.find((t) => t.id === id);
  if (!item) throw new Error("Testimonial not found.");
  const prev = item.status;
  if (patch) Object.assign(item, patch);
  item.status = status;
  item.isPublished = status === "approved" ? isPublished : false;
  item.reviewedBy = actorEmail;
  item.reviewedAt = new Date().toISOString();

  recordAudit({
    entityType: "testimonial",
    entityId: item.id,
    entityTitle: `${item.alumniName} (${item.batchYear})`,
    action: `Testimonial ${status}${item.isPublished ? " & published" : ""}`,
    actorEmail,
    previousStatus: prev,
    newStatus: status,
  });
}

export function deleteTestimonial(id: string, actorEmail: string) {
  const s = store();
  const item = s.testimonials.find((t) => t.id === id);
  if (!item) throw new Error("Testimonial not found.");
  s.testimonials = s.testimonials.filter((t) => t.id !== id);
  recordAudit({
    entityType: "testimonial",
    entityId: id,
    entityTitle: item.alumniName,
    action: "Deleted testimonial",
    actorEmail,
    previousStatus: item.status,
    newStatus: "deleted",
  });
}

/* ==================================================================
   4. ASSOCIATION LEADERSHIP
   ================================================================== */
export function listAssociationLeaders(opts: { includeUnpublished?: boolean } = {}): AssociationLeader[] {
  return [...store().associationLeaders]
    .filter((l) => opts.includeUnpublished || (l.isConfirmed && l.isPublished))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function upsertAssociationLeader(
  id: string | null,
  input: Omit<AssociationLeader, "id" | "createdAt" | "updatedAt">,
  actorEmail: string,
): AssociationLeader {
  const s = store();
  const now = new Date().toISOString();

  if (id) {
    const existing = s.associationLeaders.find((l) => l.id === id);
    if (!existing) throw new Error("Leadership profile not found.");
    Object.assign(existing, input, { updatedAt: now });
    recordAudit({
      entityType: "leadership",
      entityId: existing.id,
      entityTitle: `${existing.fullName} — ${existing.role}`,
      action: "Updated Association leadership profile",
      actorEmail,
      previousStatus: null,
      newStatus: existing.isPublished ? "published" : "unpublished",
    });
    return existing;
  }

  const created: AssociationLeader = {
    ...input,
    id: uid(),
    createdAt: now,
    updatedAt: now,
  };
  s.associationLeaders.push(created);
  recordAudit({
    entityType: "leadership",
    entityId: created.id,
    entityTitle: `${created.fullName} — ${created.role}`,
    action: "Added Association leadership profile",
    actorEmail,
    previousStatus: null,
    newStatus: created.isPublished ? "published" : "unpublished",
  });
  return created;
}

export function deleteAssociationLeader(id: string, actorEmail: string) {
  const s = store();
  const existing = s.associationLeaders.find((l) => l.id === id);
  if (!existing) throw new Error("Leadership profile not found.");
  s.associationLeaders = s.associationLeaders.filter((l) => l.id !== id);
  recordAudit({
    entityType: "leadership",
    entityId: id,
    entityTitle: `${existing.fullName} — ${existing.role}`,
    action: "Removed Association leadership profile",
    actorEmail,
    previousStatus: "published",
    newStatus: "deleted",
  });
}

/* ==================================================================
   5. DYNAMIC ALUMNI COMMUNITY SNAPSHOT (SECTION 7)
   ================================================================== */
export interface CommunitySnapshot {
  totalProfilesCount: number;
  verifiedNonSampleCount: number;
  sampleCount: number;
  batchesCount: number;
  citiesCount: number;
  countriesCount: number;
  domainsCount: number;
  cityDistribution: { city: string; country: string; count: number; hasSample: boolean }[];
  domainDistribution: { domain: string; count: number }[];
  departmentDistribution: { department: string; count: number }[];
}

export async function getLiveCommunitySnapshot(): Promise<CommunitySnapshot> {
  const [directory, batches] = await Promise.all([
    listDirectory({ viewerIsMember: false }),
    listBatchesWithMembers({ viewerIsMember: false }),
  ]);

  const verifiedNonSample = directory.filter((a) => !a.isSample);
  const sampleCount = directory.filter((a) => a.isSample).length;

  const cityMap = new Map<string, { city: string; country: string; count: number; hasSample: boolean }>();
  const countrySet = new Set<string>();
  const domainMap = new Map<string, number>();
  const deptMap = new Map<string, number>();

  for (const a of directory) {
    deptMap.set(a.department, (deptMap.get(a.department) ?? 0) + 1);

    // Respect member privacy: listDirectory already redacts city/country when showLocation is false
    if (a.city) {
      const country = a.country ?? "India";
      countrySet.add(country);
      const key = `${a.city}|${country}`;
      const prev = cityMap.get(key);
      cityMap.set(key, {
        city: a.city,
        country,
        count: (prev?.count ?? 0) + 1,
        hasSample: Boolean(prev?.hasSample || a.isSample),
      });
    }

    if (a.profession) {
      domainMap.set(a.profession, (domainMap.get(a.profession) ?? 0) + 1);
    }
  }

  return {
    totalProfilesCount: directory.length,
    verifiedNonSampleCount: verifiedNonSample.length,
    sampleCount,
    batchesCount: batches.length,
    citiesCount: cityMap.size,
    countriesCount: countrySet.size,
    domainsCount: domainMap.size,
    cityDistribution: [...cityMap.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city)),
    domainDistribution: [...domainMap.entries()]
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count || a.domain.localeCompare(b.domain)),
    departmentDistribution: [...deptMap.entries()]
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count || a.department.localeCompare(b.department)),
  };
}
