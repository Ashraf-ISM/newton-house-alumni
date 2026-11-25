"use server";

import { revalidatePath } from "next/cache";
import { associationLeadershipRoles, heritageTimelineCategories } from "@/data/about";
import { assertAdmin, getViewer } from "@/lib/auth";
import {
  deleteAssociationLeader,
  deleteHeritageMilestone,
  deleteSuperintendent,
  deleteTestimonial,
  moderateTestimonial,
  reorderHeritageMilestone,
  reorderSuperintendent,
  setCurrentSuperintendent,
  submitTestimonial,
  toggleHeritageMilestonePublished,
  toggleSuperintendentPublished,
  upsertAssociationLeader,
  upsertHeritageMilestone,
  upsertSuperintendent,
} from "@/lib/data/about";
import { fileFrom, storeImage, validateImageFile } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type {
  ActionResult,
  AssociationLeadershipRole,
  Department,
  HeritageTimelineCategory,
  ModerationStatus,
} from "@/types";

function refreshAbout() {
  revalidatePath("/about");
  revalidatePath("/legacy");
  revalidatePath("/admin");
  revalidatePath("/admin/about");
}

/* ==================================================================
   1. SUPERINTENDENT MANAGEMENT (ADMIN ONLY)
   ================================================================== */
export async function saveSuperintendentAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = String(fd.get("id") ?? "").trim() || null;
    const fullName = String(fd.get("fullName") ?? "").trim();
    const isCurrent = fd.get("isCurrent") === "on" || fd.get("isCurrent") === "true";
    const designationRaw = String(fd.get("designation") ?? "").trim();
    const designation =
      designationRaw ||
      (isCurrent ? "Current Superintendent, Newton House" : "Former Superintendent, Newton House");
    const tenureStart = String(fd.get("tenureStart") ?? "").trim() || null;
    const tenureEndRaw = String(fd.get("tenureEnd") ?? "").trim();
    const tenureEnd = isCurrent ? "Present" : tenureEndRaw || null;
    const tenurePeriodLabelRaw = String(fd.get("tenurePeriodLabel") ?? "").trim();
    const tenurePeriodLabel =
      tenurePeriodLabelRaw ||
      (tenureStart && tenureEnd
        ? `${tenureStart} – ${tenureEnd}`
        : isCurrent
          ? "Current Tenure · Official Appointment Date Pending Verification"
          : "Former Tenure · Official Dates Pending Verification");
    const biography = String(fd.get("biography") ?? "").trim();
    const academicBackground = String(fd.get("academicBackground") ?? "").trim() || null;
    const contributions = String(fd.get("contributions") ?? "").trim();
    const personalMessage = String(fd.get("personalMessage") ?? "").trim() || null;
    const displayOrder = Number(fd.get("displayOrder") ?? 10) || 10;
    const isPublished = fd.get("isPublished") === "on" || fd.get("isPublished") === "true";
    const isPlaceholder = fd.get("isPlaceholder") === "on" || fd.get("isPlaceholder") === "true";
    const existingImage = String(fd.get("existingImage") ?? "").trim() || null;
    const photo = fileFrom(fd, "photo");

    const fieldErrors: Record<string, string[]> = {};
    if (fullName.length < 3) fieldErrors.fullName = ["Enter the superintendent's full name (or clearly labelled placeholder title)."];
    if (biography.length < 15) fieldErrors.biography = ["Provide a biography of at least 15 characters."];
    if (contributions.length < 10) fieldErrors.contributions = ["Describe the superintendent's contributions to Newton House."];
    const photoErr = validateImageFile(photo);
    if (photoErr) fieldErrors.photo = [photoErr];

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, message: "Please review the highlighted fields.", fieldErrors };
    }

    let profileImage = existingImage;
    if (photo) {
      const client = isSupabaseConfigured() ? await createClient() : undefined;
      profileImage = (await storeImage(photo, { bucket: "gallery", folder: "superintendents", maxSize: 900, client })).url;
    }

    upsertSuperintendent(
      id,
      {
        fullName,
        designation,
        profileImage,
        tenureStart,
        tenureEnd,
        tenurePeriodLabel,
        isCurrent,
        biography,
        academicBackground,
        contributions,
        personalMessage,
        displayOrder,
        isPublished,
        isPlaceholder,
      },
      admin.email ?? "admin@newtonhouse.org",
    );

    refreshAbout();
    return {
      ok: true,
      message: isCurrent
        ? "Superintendent profile saved as Current Superintendent. Any previous current record was automatically preserved as a Former Superintendent."
        : "Superintendent profile saved.",
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save superintendent profile." };
  }
}

export async function setCurrentSuperintendentAction(id: string): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    setCurrentSuperintendent(id, admin.email ?? "admin@newtonhouse.org");
    refreshAbout();
    return {
      ok: true,
      message: "Designated as Current Superintendent. The previous current superintendent has been preserved in the Former Superintendents roster.",
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function reorderSuperintendentAction(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    reorderSuperintendent(id, direction, admin.email ?? "admin@newtonhouse.org");
    refreshAbout();
    return { ok: true, message: "Display order updated." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Reorder failed." };
  }
}

export async function toggleSuperintendentPublishedAction(
  id: string,
  isPublished: boolean,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    toggleSuperintendentPublished(id, isPublished, admin.email ?? "admin@newtonhouse.org");
    refreshAbout();
    return {
      ok: true,
      message: isPublished ? "Superintendent profile published." : "Superintendent profile unpublished.",
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function removeSuperintendentAction(id: string): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    deleteSuperintendent(id, admin.email ?? "admin@newtonhouse.org");
    refreshAbout();
    return { ok: true, message: "Superintendent record deleted." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not delete record." };
  }
}

/* ==================================================================
   2. HERITAGE TIMELINE MANAGEMENT (ADMIN ONLY)
   ================================================================== */
export async function saveHeritageMilestoneAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = String(fd.get("id") ?? "").trim() || null;
    const categoryRaw = String(fd.get("category") ?? "The Early Years") as HeritageTimelineCategory;
    const category = heritageTimelineCategories.includes(categoryRaw)
      ? categoryRaw
      : "The Early Years";
    const periodLabel = String(fd.get("periodLabel") ?? "").trim() || null;
    const verified = fd.get("verified") === "on" || fd.get("verified") === "true";
    const title = String(fd.get("title") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const importantDevelopment = String(fd.get("importantDevelopment") ?? "").trim() || null;
    const displayOrder = Number(fd.get("displayOrder") ?? 10) || 10;
    const isPublished = fd.get("isPublished") === "on" || fd.get("isPublished") === "true";
    const isPlaceholder = fd.get("isPlaceholder") === "on" || fd.get("isPlaceholder") === "true";
    const existingImageUrl = String(fd.get("existingImageUrl") ?? "").trim() || null;
    const imageAlt = String(fd.get("imageAlt") ?? "").trim() || title;
    const photo = fileFrom(fd, "photo");

    const fieldErrors: Record<string, string[]> = {};
    if (title.length < 4) fieldErrors.title = ["Enter a milestone title (at least 4 characters)."];
    if (description.length < 15) fieldErrors.description = ["Enter a historical description (at least 15 characters)."];
    const photoErr = validateImageFile(photo);
    if (photoErr) fieldErrors.photo = [photoErr];

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, message: "Please complete the highlighted fields.", fieldErrors };
    }

    let imageUrl = existingImageUrl;
    if (photo) {
      const client = isSupabaseConfigured() ? await createClient() : undefined;
      imageUrl = (await storeImage(photo, { bucket: "gallery", folder: "timeline", maxSize: 1600, client })).url;
    }

    upsertHeritageMilestone(
      id,
      {
        category,
        periodLabel,
        verified,
        title,
        description,
        importantDevelopment,
        imageUrl,
        imageAlt: imageUrl ? imageAlt : null,
        displayOrder,
        isPublished,
        isPlaceholder,
      },
      admin.email ?? "admin@newtonhouse.org",
    );

    refreshAbout();
    return { ok: true, message: "Heritage timeline milestone saved." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save timeline milestone." };
  }
}

export async function reorderHeritageMilestoneAction(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    reorderHeritageMilestone(id, direction, admin.email ?? "admin@newtonhouse.org");
    refreshAbout();
    return { ok: true, message: "Milestone order updated." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not reorder milestone." };
  }
}

export async function toggleHeritageMilestonePublishedAction(
  id: string,
  isPublished: boolean,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    toggleHeritageMilestonePublished(id, isPublished, admin.email ?? "admin@newtonhouse.org");
    refreshAbout();
    return {
      ok: true,
      message: isPublished ? "Timeline milestone published." : "Timeline milestone unpublished.",
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function removeHeritageMilestoneAction(id: string): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    deleteHeritageMilestone(id, admin.email ?? "admin@newtonhouse.org");
    refreshAbout();
    return { ok: true, message: "Timeline milestone deleted." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not delete milestone." };
  }
}

/* ==================================================================
   3. TESTIMONIALS SUBMISSION & ADMIN MODERATION
   ================================================================== */
export async function submitAlumniTestimonialAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || (!viewer.isApprovedMember && !viewer.role)) {
    return {
      ok: false,
      message: "Please sign in with a verified Newton House alumni account to submit a testimonial.",
    };
  }

  const alumniName = String(fd.get("alumniName") ?? viewer.alumni?.fullName ?? "").trim();
  const batchYear = String(
    fd.get("batchYear") ??
      (viewer.alumni ? `Class of ${viewer.alumni.graduationYear}` : ""),
  ).trim();
  const department = (String(fd.get("department") ?? viewer.alumni?.department ?? "").trim() ||
    null) as Department | null;
  const designation = String(fd.get("designation") ?? viewer.alumni?.designation ?? "").trim() || null;
  const quote = String(fd.get("quote") ?? "").trim();

  const fieldErrors: Record<string, string[]> = {};
  if (alumniName.length < 3) fieldErrors.alumniName = ["Enter your full name."];
  if (batchYear.length < 3) fieldErrors.batchYear = ["Enter your batch or graduation year."];
  if (quote.length < 25 || quote.length > 420) {
    fieldErrors.quote = ["Write a reflection between 25 and 420 characters."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please complete the highlighted fields.", fieldErrors };
  }

  submitTestimonial({
    alumniName,
    batchYear,
    department,
    designation,
    photoUrl: viewer.alumni?.photoUrl ?? null,
    quote,
    submittedBy: viewer.email ?? "member@newtonhouse.org",
  });

  refreshAbout();
  return {
    ok: true,
    demo: viewer.demo,
    message:
      "Thank you! Your reflection has been submitted to the Association for verification and will appear in Voices of Newton House once approved.",
  };
}

export async function moderateTestimonialAction(
  id: string,
  status: ModerationStatus,
  isPublished: boolean,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    moderateTestimonial(id, status, isPublished, admin.email ?? "admin@newtonhouse.org");
    refreshAbout();
    return {
      ok: true,
      message:
        status === "approved"
          ? isPublished
            ? "Testimonial approved and published."
            : "Testimonial approved (unpublished)."
          : `Testimonial marked as ${status}.`,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Moderation failed." };
  }
}

export async function saveEditedTestimonialAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = String(fd.get("id") ?? "").trim();
    const alumniName = String(fd.get("alumniName") ?? "").trim();
    const batchYear = String(fd.get("batchYear") ?? "").trim();
    const designation = String(fd.get("designation") ?? "").trim() || null;
    const quote = String(fd.get("quote") ?? "").trim();
    const status = String(fd.get("status") ?? "approved") as ModerationStatus;
    const isPublished = fd.get("isPublished") === "on" || fd.get("isPublished") === "true";
    const isSample = fd.get("isSample") === "on" || fd.get("isSample") === "true";

    if (alumniName.length < 3 || batchYear.length < 2 || quote.length < 15) {
      return { ok: false, message: "Please provide a complete name, batch year, and quotation." };
    }

    moderateTestimonial(id, status, isPublished, admin.email ?? "admin@newtonhouse.org", {
      alumniName,
      batchYear,
      designation,
      quote,
      isSample,
    });

    refreshAbout();
    return { ok: true, message: "Testimonial updated." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save testimonial." };
  }
}

export async function removeTestimonialAction(id: string): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    deleteTestimonial(id, admin.email ?? "admin@newtonhouse.org");
    refreshAbout();
    return { ok: true, message: "Testimonial deleted." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not delete testimonial." };
  }
}

/* ==================================================================
   4. ASSOCIATION LEADERSHIP MANAGEMENT (ADMIN ONLY)
   ================================================================== */
export async function saveAssociationLeaderAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = String(fd.get("id") ?? "").trim() || null;
    const fullName = String(fd.get("fullName") ?? "").trim();
    const roleRaw = String(fd.get("role") ?? "Executive Committee Member") as AssociationLeadershipRole;
    const role = associationLeadershipRoles.some((r) => r.role === roleRaw)
      ? roleRaw
      : "Executive Committee Member";
    const batchYearRaw = String(fd.get("batchYear") ?? "").trim();
    const batchYear = batchYearRaw ? Number(batchYearRaw) : null;
    const department = (String(fd.get("department") ?? "").trim() || null) as Department | null;
    const designation = String(fd.get("designation") ?? "").trim() || null;
    const bio = String(fd.get("bio") ?? "").trim() || null;
    const displayOrder = Number(fd.get("displayOrder") ?? 10) || 10;
    const isConfirmed = fd.get("isConfirmed") === "on" || fd.get("isConfirmed") === "true";
    const isPublished = fd.get("isPublished") === "on" || fd.get("isPublished") === "true";
    const existingPhotoUrl = String(fd.get("existingPhotoUrl") ?? "").trim() || null;
    const photo = fileFrom(fd, "photo");

    const fieldErrors: Record<string, string[]> = {};
    if (fullName.length < 3) fieldErrors.fullName = ["Enter the office-bearer's confirmed full name."];
    const photoErr = validateImageFile(photo);
    if (photoErr) fieldErrors.photo = [photoErr];

    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, message: "Please complete the highlighted fields.", fieldErrors };
    }

    let photoUrl = existingPhotoUrl;
    if (photo) {
      const client = isSupabaseConfigured() ? await createClient() : undefined;
      photoUrl = (await storeImage(photo, { bucket: "gallery", folder: "leadership", maxSize: 900, client })).url;
    }

    upsertAssociationLeader(
      id,
      {
        fullName,
        role,
        batchYear,
        department,
        designation,
        photoUrl,
        bio,
        displayOrder,
        isConfirmed,
        isPublished,
      },
      admin.email ?? "admin@newtonhouse.org",
    );

    refreshAbout();
    return { ok: true, message: "Association leadership record saved." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save leadership profile." };
  }
}

export async function removeAssociationLeaderAction(id: string): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    deleteAssociationLeader(id, admin.email ?? "admin@newtonhouse.org");
    refreshAbout();
    return { ok: true, message: "Association leadership record removed." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not remove record." };
  }
}
