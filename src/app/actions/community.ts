"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin, getViewer } from "@/lib/auth";
import { updateProfile } from "@/lib/data/alumni";
import {
  archiveCategories,
  deleteArchiveItem,
  deleteStory,
  markAllNotificationsRead,
  markNotificationRead,
  mentorCategories,
  moderateArchiveItem,
  moderateBatchContribution,
  moderateMentorProfile,
  moderateStory,
  removeConnection,
  respondConnectionRequest,
  respondMentorshipRequest,
  sendConnectionRequest,
  storyCategories,
  submitArchiveItem,
  submitBatchContribution,
  submitMentorProfile,
  submitMentorshipRequest,
  submitStory,
  updateSiteSettings,
} from "@/lib/data/community";
import { store } from "@/lib/data/store";
import { ACCEPTED_IMAGE_TYPES, fileFrom, MAX_UPLOAD_BYTES, storeImage, validateImageFile } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type {
  ActionResult,
  ArchiveCategorySlug,
  ArchiveFileFormat,
  ArchiveMediaType,
  BatchContributionType,
  CommunicationMethod,
  Department,
  MentorAvailability,
  MentorCategorySlug,
  MentorshipRequestStatus,
  ModerationStatus,
  Profession,
  ProfileVisibility,
  StoryCategorySlug,
  StoryStatus,
} from "@/types";

const ACCEPTED_ARCHIVE_DOCS = [...ACCEPTED_IMAGE_TYPES, "application/pdf"];
const MAX_ARCHIVE_BYTES = 5 * 1024 * 1024; // 5 MB

/* ==================================================================
   FEATURE 1: ADVANCED MEMBER PORTAL ACTIONS
   ================================================================== */
export async function updateAdvancedMemberProfile(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || !viewer.alumni) {
    return { ok: false, message: "Please sign in as an authorised member to update your profile." };
  }

  const fullName = String(fd.get("fullName") ?? viewer.alumni.fullName).trim();
  const department = String(fd.get("department") ?? viewer.alumni.department).trim() as Department;
  const graduationYear = Number(fd.get("graduationYear") ?? viewer.alumni.graduationYear);
  const resStartRaw = String(fd.get("residenceStartYear") ?? "").trim();
  const residenceStartYear = resStartRaw ? Number(resStartRaw) : null;
  const designation = String(fd.get("designation") ?? "").trim() || null;
  const organisation = String(fd.get("organisation") ?? "").trim() || null;
  const profession = (String(fd.get("profession") ?? "").trim() || null) as Profession | null;
  const city = String(fd.get("city") ?? "").trim() || null;
  const country = String(fd.get("country") ?? "").trim() || "India";
  const linkedinUrl = String(fd.get("linkedinUrl") ?? "").trim() || null;
  const bio = String(fd.get("bio") ?? "").trim() || null;
  const visibility = (String(fd.get("visibility") ?? viewer.alumni.visibility) as ProfileVisibility) || "members";
  const showEmail = fd.get("showEmail") === "on" || fd.get("showEmail") === "true";
  const showLocation = fd.get("showLocation") ? fd.get("showLocation") === "on" : true;
  const showProfessional = fd.get("showProfessional") ? fd.get("showProfessional") === "on" : true;

  const fieldErrors: Record<string, string[]> = {};
  if (fullName.length < 3) fieldErrors.fullName = ["Enter your full name (at least 3 characters)."];
  if (!Number.isInteger(graduationYear) || graduationYear < 1920 || graduationYear > 2035) {
    fieldErrors.graduationYear = ["Enter a valid four-digit graduation year."];
  }
  if (
    residenceStartYear !== null &&
    (!Number.isInteger(residenceStartYear) || residenceStartYear < 1920 || residenceStartYear > graduationYear)
  ) {
    fieldErrors.residenceStartYear = ["Enter a valid residence start year (on or before graduation)."];
  }
  if (
    linkedinUrl &&
    !/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/[A-Za-z0-9\-_%]+\/?$/.test(linkedinUrl)
  ) {
    fieldErrors.linkedinUrl = ["Use a valid LinkedIn URL, e.g. https://www.linkedin.com/in/your-name"];
  }

  const photo = fileFrom(fd, "photo");
  const photoErr = validateImageFile(photo);
  if (photoErr) fieldErrors.photo = [photoErr];

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  try {
    let photoUrl: string | undefined;
    if (photo) {
      const client = isSupabaseConfigured() ? await createClient() : undefined;
      photoUrl = (await storeImage(photo, { bucket: "avatars", folder: viewer.userId, maxSize: 640, client })).url;
    }

    await updateProfile(viewer.alumni.id, {
      fullName,
      department,
      graduationYear,
      residenceStartYear,
      designation,
      organisation,
      profession,
      city,
      country,
      linkedinUrl,
      bio,
      visibility,
      showEmail,
      showLocation,
      showProfessional,
      ...(fd.get("removePhoto") === "on" ? { photoUrl: null } : photoUrl ? { photoUrl } : {}),
    });

    revalidatePath("/member/dashboard");
    revalidatePath("/portal");
    revalidatePath("/alumni");
    revalidatePath("/alumni/batches");
    revalidatePath(`/alumni/${viewer.alumni.slug}`);

    return {
      ok: true,
      demo: viewer.demo,
      message: "Your profile and privacy settings have been updated.",
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save profile changes." };
  }
}

export async function requestAlumniConnection(
  recipientId: string,
  note: string | null = null,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || !viewer.alumni || !viewer.isApprovedMember) {
    return { ok: false, message: "Only verified Newton House alumni can send connection requests." };
  }
  try {
    sendConnectionRequest(viewer.alumni.id, recipientId, note);
    revalidatePath("/member/dashboard");
    return { ok: true, demo: viewer.demo, message: "Connection request sent." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not send request." };
  }
}

export async function respondToConnection(
  connectionId: string,
  status: "accepted" | "rejected",
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || !viewer.alumni) {
    return { ok: false, message: "Please sign in first." };
  }
  try {
    respondConnectionRequest(connectionId, viewer.alumni.id, status);
    revalidatePath("/member/dashboard");
    return {
      ok: true,
      demo: viewer.demo,
      message: status === "accepted" ? "Connection accepted." : "Connection request declined.",
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function deleteAlumniConnection(connectionId: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || !viewer.alumni) {
    return { ok: false, message: "Please sign in first." };
  }
  try {
    removeConnection(connectionId, viewer.alumni.id);
    revalidatePath("/member/dashboard");
    return { ok: true, demo: viewer.demo, message: "Connection removed." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not remove connection." };
  }
}

export async function markNotificationAsRead(id: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId) return { ok: false, message: "Please sign in." };
  markNotificationRead(id, viewer.alumni?.id ?? null);
  revalidatePath("/member/dashboard");
  return { ok: true, message: "Notification marked as read." };
}

export async function markAllMemberNotificationsRead(): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId) return { ok: false, message: "Please sign in." };
  markAllNotificationsRead(viewer.alumni?.id ?? null);
  revalidatePath("/member/dashboard");
  return { ok: true, message: "All notifications marked as read." };
}

/* ==================================================================
   FEATURE 2: BATCH CONTRIBUTIONS & MODERATION
   ================================================================== */
export async function submitBatchContributionAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || (!viewer.isApprovedMember && !viewer.role)) {
    return {
      ok: false,
      message: "Only signed-in, verified Newton House alumni can submit batch contributions.",
    };
  }

  const batchSlug = String(fd.get("batchSlug") ?? "").trim();
  const batchYear = Number(fd.get("batchYear") ?? 0);
  const type = String(fd.get("type") ?? "memory") as BatchContributionType;
  const title = String(fd.get("title") ?? "").trim();
  const content = String(fd.get("content") ?? "").trim();
  const photo = fileFrom(fd, "photo");

  const fieldErrors: Record<string, string[]> = {};
  if (title.length < 4) fieldErrors.title = ["Enter a descriptive title (at least 4 characters)."];
  if (content.length < 15) fieldErrors.content = ["Provide at least 15 characters of context or memory."];
  if (!Number.isInteger(batchYear) || batchYear < 1920 || batchYear > 2035) {
    fieldErrors.batchYear = ["Select a valid batch year."];
  }
  const photoErr = validateImageFile(photo);
  if (photoErr) fieldErrors.photo = [photoErr];

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please complete the highlighted fields.", fieldErrors };
  }

  try {
    let imageUrl: string | null = null;
    if (photo) {
      imageUrl = (await storeImage(photo, { bucket: "gallery", folder: "batches", maxSize: 1600 })).url;
    }

    submitBatchContribution({
      batchSlug: batchSlug || `batch-${batchYear}`,
      batchYear,
      type,
      title,
      content,
      imageUrl,
      submittedBy: viewer.email ?? "member@newtonhouse.org",
      submitterAlumniId: viewer.alumni?.id ?? null,
    });

    revalidatePath("/alumni/batches");
    revalidatePath(`/alumni/batches/${batchSlug || `batch-${batchYear}`}`);
    revalidatePath("/admin");
    revalidatePath("/admin/batches");

    return {
      ok: true,
      demo: viewer.demo,
      message:
        "Thank you! Your batch contribution has been submitted for moderator review and will appear on the batch page once approved.",
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not submit contribution." };
  }
}

export async function moderateBatchContributionAction(
  id: string,
  status: ModerationStatus,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    moderateBatchContribution(id, status, admin.email ?? "admin@newtonhouse.org");
    revalidatePath("/alumni/batches");
    revalidatePath("/admin");
    revalidatePath("/admin/batches");
    return { ok: true, message: `Batch contribution ${status}.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Moderation failed." };
  }
}

/* ==================================================================
   FEATURE 3: DIGITAL HERITAGE ARCHIVE SUBMISSIONS & MODERATION
   ================================================================== */
export async function submitArchiveItemAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || (!viewer.isApprovedMember && !viewer.role)) {
    return {
      ok: false,
      message: "Please sign in with a verified Newton House alumni account to contribute to the Heritage Archive.",
    };
  }

  const title = String(fd.get("title") ?? "").trim();
  const categorySlug = String(fd.get("categorySlug") ?? "historical-building") as ArchiveCategorySlug;
  const approximateYear = String(fd.get("approximateYear") ?? "").trim();
  const description = String(fd.get("description") ?? "").trim();
  const contributorName = String(fd.get("contributorName") ?? viewer.alumni?.fullName ?? "").trim();
  const showContributor = fd.get("showContributor") !== "off";
  const permissionConfirmed = fd.get("permissionConfirmed") === "on" || fd.get("permissionConfirmed") === "true";
  const file = fileFrom(fd, "file");

  const fieldErrors: Record<string, string[]> = {};
  if (title.length < 4) fieldErrors.title = ["Enter a title for this archival item."];
  if (!archiveCategories.some((c) => c.slug === categorySlug)) {
    fieldErrors.categorySlug = ["Select a valid archive category."];
  }
  if (approximateYear.length < 2) {
    fieldErrors.approximateYear = ["Enter the approximate year or era (e.g. 'c. 1998' or '2012')."];
  }
  if (description.length < 15) {
    fieldErrors.description = ["Describe the photograph or document (at least 15 characters)."];
  }
  if (contributorName.length < 2) {
    fieldErrors.contributorName = ["Enter the contributor's name."];
  }
  if (!permissionConfirmed) {
    fieldErrors.permissionConfirmed = [
      "Please confirm you have permission to share this material with the Newton House Archive.",
    ];
  }

  if (!file) {
    fieldErrors.file = ["Upload a photograph or document (PDF, JPEG, PNG or WebP)."];
  } else {
    if (!ACCEPTED_ARCHIVE_DOCS.includes(file.type)) {
      fieldErrors.file = ["Unsupported file format. Upload a PDF, JPEG, PNG, WebP or AVIF file."];
    } else if (file.size > MAX_ARCHIVE_BYTES) {
      fieldErrors.file = ["File size must be 5 MB or smaller."];
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please review and complete the highlighted fields.", fieldErrors };
  }

  try {
    const isPdf = file!.type === "application/pdf";
    const mediaType: ArchiveMediaType =
      isPdf || categorySlug === "important-documents" || categorySlug === "newspaper-features"
        ? "document"
        : "photograph";
    const fileFormat: ArchiveFileFormat = isPdf
      ? "pdf"
      : file!.type.includes("png")
        ? "png"
        : file!.type.includes("jpeg") || file!.type.includes("jpg")
          ? "jpeg"
          : "webp";

    let fileUrl = "/images/hostel/exterior-vintage.webp";
    let previewUrl: string | null = null;
    let width = 1200;
    let height = 850;

    if (isPdf) {
      const buf = Buffer.from(await file!.arrayBuffer());
      fileUrl = `data:application/pdf;base64,${buf.toString("base64")}`;
      previewUrl = null;
    } else {
      const stored = await storeImage(file!, { bucket: "gallery", folder: "archive", maxSize: 2000 });
      fileUrl = stored.url;
      previewUrl = stored.url;
      width = stored.width;
      height = stored.height;
    }

    submitArchiveItem({
      title,
      categorySlug,
      mediaType,
      fileFormat,
      fileUrl,
      previewUrl,
      width,
      height,
      approximateYear,
      yearVerified: false,
      description,
      contributorName,
      showContributor,
      permissionConfirmed: true,
      submittedBy: viewer.email ?? "member@newtonhouse.org",
    });

    revalidatePath("/archive");
    revalidatePath("/member/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/archive");

    return {
      ok: true,
      demo: viewer.demo,
      message:
        "Your archival contribution has been received and placed in the Pending Review queue. Once verified by the Association's archivists, it will appear in the Digital Heritage Archive.",
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not upload archival item." };
  }
}

export async function moderateArchiveItemAction(
  id: string,
  status: ModerationStatus,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    moderateArchiveItem(id, status, admin.email ?? "admin@newtonhouse.org");
    revalidatePath("/archive");
    revalidatePath("/admin");
    revalidatePath("/admin/archive");
    return { ok: true, message: `Archive submission ${status}.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Moderation failed." };
  }
}

export async function removeArchiveItemAction(id: string): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    deleteArchiveItem(id, admin.email ?? "admin@newtonhouse.org");
    revalidatePath("/archive");
    revalidatePath("/admin");
    revalidatePath("/admin/archive");
    return { ok: true, message: "Archive item removed." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

/* ==================================================================
   FEATURE 4: ALUMNI STORIES SUBMISSION & MODERATION
   ================================================================== */
export async function submitAlumniStoryAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || (!viewer.isApprovedMember && !viewer.role)) {
    return {
      ok: false,
      message: "Only signed-in, verified Newton House alumni can submit stories.",
    };
  }

  const title = String(fd.get("title") ?? "").trim();
  const categorySlug = String(fd.get("categorySlug") ?? "personal-memories") as StoryCategorySlug;
  const summary = String(fd.get("summary") ?? "").trim();
  const bodyRaw = String(fd.get("content") ?? "").trim();
  const authorName = String(fd.get("authorName") ?? viewer.alumni?.fullName ?? "").trim();
  const authorDepartment = String(fd.get("authorDepartment") ?? viewer.alumni?.department ?? "Physics") as Department;
  const authorGraduationYear = Number(fd.get("authorGraduationYear") ?? viewer.alumni?.graduationYear ?? 2014);
  const authorResidenceYears = String(fd.get("authorResidenceYears") ?? "").trim() || null;
  const authorDesignation = String(fd.get("authorDesignation") ?? viewer.alumni?.designation ?? "").trim() || null;
  const authorOrganisation = String(fd.get("authorOrganisation") ?? viewer.alumni?.organisation ?? "").trim() || null;
  const saveAsDraft = fd.get("saveMode") === "draft";
  const coverFile = fileFrom(fd, "coverImage");

  const fieldErrors: Record<string, string[]> = {};
  if (title.length < 6) fieldErrors.title = ["Enter a compelling headline (at least 6 characters)."];
  if (!storyCategories.some((c) => c.slug === categorySlug)) {
    fieldErrors.categorySlug = ["Select a story category."];
  }
  if (summary.length < 20 || summary.length > 320) {
    fieldErrors.summary = ["Write a short introduction between 20 and 320 characters."];
  }
  if (bodyRaw.length < 60) {
    fieldErrors.content = ["Please write your full story (at least 60 characters)."];
  }
  if (authorName.length < 3) {
    fieldErrors.authorName = ["Enter the author's name."];
  }
  if (!Number.isInteger(authorGraduationYear) || authorGraduationYear < 1920 || authorGraduationYear > 2035) {
    fieldErrors.authorGraduationYear = ["Enter a valid graduation year."];
  }
  const coverErr = validateImageFile(coverFile);
  if (coverErr) fieldErrors.coverImage = [coverErr];

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please complete the highlighted fields.", fieldErrors };
  }

  try {
    let coverImageUrl: string | null = "/images/hero/newton-house-exterior.webp";
    if (coverFile) {
      coverImageUrl = (await storeImage(coverFile, { bucket: "gallery", folder: "stories", maxSize: 1800 })).url;
    }

    const paragraphs = bodyRaw
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    const story = submitStory({
      title,
      categorySlug,
      summary,
      content: paragraphs,
      coverImageUrl,
      supportingImages: [],
      authorAlumniId: viewer.alumni?.id ?? null,
      authorSlug: viewer.alumni?.slug ?? null,
      authorName,
      authorPhotoUrl: viewer.alumni?.photoUrl ?? null,
      authorDepartment,
      authorGraduationYear,
      authorResidenceYears,
      authorDesignation,
      authorOrganisation,
      submittedBy: viewer.email ?? "member@newtonhouse.org",
      status: saveAsDraft ? "draft" : "submitted",
    });

    revalidatePath("/alumni/stories");
    revalidatePath("/member/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/stories");

    return {
      ok: true,
      demo: viewer.demo,
      message:
        story.status === "draft"
          ? "Your story draft has been saved. Editors and administrators can review it before publication."
          : "Thank you! Your story has been submitted to the editorial committee for review.",
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not submit story." };
  }
}

export async function moderateAlumniStoryAction(
  id: string,
  status: StoryStatus,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    moderateStory(id, status, admin.email ?? "admin@newtonhouse.org");
    revalidatePath("/alumni/stories");
    revalidatePath("/admin");
    revalidatePath("/admin/stories");
    return { ok: true, message: `Story moved to '${status.replace("_", " ")}'.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Moderation failed." };
  }
}

export async function saveEditedStoryAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const id = String(fd.get("id") ?? "");
    const title = String(fd.get("title") ?? "").trim();
    const categorySlug = String(fd.get("categorySlug") ?? "personal-memories") as StoryCategorySlug;
    const summary = String(fd.get("summary") ?? "").trim();
    const contentRaw = String(fd.get("content") ?? "").trim();
    const status = String(fd.get("status") ?? "published") as StoryStatus;
    const featured = fd.get("featured") === "on" || fd.get("featured") === "true";

    if (title.length < 5 || summary.length < 15 || contentRaw.length < 30) {
      return { ok: false, message: "Please provide a complete title, summary, and story body." };
    }

    moderateStory(id, status, admin.email ?? "admin@newtonhouse.org", {
      title,
      categorySlug,
      summary,
      content: contentRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      featured,
    });

    revalidatePath("/alumni/stories");
    revalidatePath("/admin");
    revalidatePath("/admin/stories");
    return { ok: true, message: "Story updated and saved." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save story." };
  }
}

export async function removeAlumniStoryAction(id: string): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    deleteStory(id, admin.email ?? "admin@newtonhouse.org");
    revalidatePath("/alumni/stories");
    revalidatePath("/admin");
    revalidatePath("/admin/stories");
    return { ok: true, message: "Story deleted." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

/* ==================================================================
   FEATURE 5: MENTORSHIP NETWORK ACTIONS
   ================================================================== */
export async function registerAsMentorAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || (!viewer.isApprovedMember && !viewer.role)) {
    return {
      ok: false,
      message: "Only signed-in, verified Newton House alumni can register as mentors.",
    };
  }

  const designation = String(fd.get("designation") ?? viewer.alumni?.designation ?? "").trim();
  const organisation = String(fd.get("organisation") ?? viewer.alumni?.organisation ?? "").trim();
  const experienceYears = Number(fd.get("experienceYears") ?? 0);
  const industry = String(fd.get("industry") ?? viewer.alumni?.profession ?? "Research & Academia").trim();
  const city = String(fd.get("city") ?? viewer.alumni?.city ?? "Patna").trim();
  const expertiseRaw = String(fd.get("expertise") ?? "").trim();
  const categories = fd.getAll("categories").map(String) as MentorCategorySlug[];
  const preferredCommunication = String(
    fd.get("preferredCommunication") ?? "Platform Message",
  ) as CommunicationMethod;
  const availability = String(fd.get("availability") ?? "Open for Mentorship") as MentorAvailability;
  const bio = String(fd.get("bio") ?? "").trim();

  const fieldErrors: Record<string, string[]> = {};
  if (designation.length < 2) fieldErrors.designation = ["Enter your current professional designation."];
  if (organisation.length < 2) fieldErrors.organisation = ["Enter your current organisation or institution."];
  if (!Number.isInteger(experienceYears) || experienceYears < 1 || experienceYears > 65) {
    fieldErrors.experienceYears = ["Enter your years of professional experience (1–65)."];
  }
  const expertise = expertiseRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (expertise.length === 0) {
    fieldErrors.expertise = ["Enter at least one area of expertise (comma-separated)."];
  }
  const validCategories = categories.filter((c) => mentorCategories.some((mc) => mc.slug === c));
  if (validCategories.length === 0) {
    fieldErrors.categories = ["Select at least one mentorship category."];
  }
  if (bio.length < 20) {
    fieldErrors.bio = ["Write a short mentorship introduction (at least 20 characters)."];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please complete the highlighted fields.", fieldErrors };
  }

  try {
    submitMentorProfile({
      alumniId: viewer.alumni?.id ?? null,
      slug: viewer.alumni?.slug ?? `mentor-${Date.now()}`,
      name: viewer.alumni?.fullName ?? "Verified Alumnus",
      photoUrl: viewer.alumni?.photoUrl ?? null,
      graduationYear: viewer.alumni?.graduationYear ?? 2014,
      department: viewer.alumni?.department ?? "Physics",
      designation,
      organisation,
      city,
      industry,
      experienceYears,
      expertise,
      categories: validCategories,
      preferredCommunication,
      availability,
      bio,
      submittedBy: viewer.email ?? "member@newtonhouse.org",
    });

    revalidatePath("/mentorship");
    revalidatePath("/member/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/mentorship");

    return {
      ok: true,
      demo: viewer.demo,
      message:
        "Thank you for volunteering as a Newton House mentor! Your mentor profile has been submitted for administrator approval.",
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not submit mentor registration." };
  }
}

export async function requestMentorshipAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || (!viewer.isApprovedMember && !viewer.role)) {
    return {
      ok: false,
      message: "Only signed-in, verified Newton House members can send mentorship requests.",
    };
  }

  const mentorId = String(fd.get("mentorId") ?? "").trim();
  const mentorName = String(fd.get("mentorName") ?? "Newton House Mentor").trim();
  const title = String(fd.get("title") ?? "").trim();
  const areaOfGuidance = String(fd.get("areaOfGuidance") ?? "").trim();
  const introduction = String(fd.get("introduction") ?? "").trim();
  const question = String(fd.get("question") ?? "").trim();
  const preferredCommunication = String(
    fd.get("preferredCommunication") ?? "Platform Message",
  ) as CommunicationMethod;

  const fieldErrors: Record<string, string[]> = {};
  if (!mentorId) fieldErrors.mentorId = ["Choose a mentor."];
  if (title.length < 5) fieldErrors.title = ["Enter a concise request title (at least 5 characters)."];
  if (areaOfGuidance.length < 3) fieldErrors.areaOfGuidance = ["Specify the area of guidance."];
  if (introduction.length < 15) fieldErrors.introduction = ["Write a brief introduction (at least 15 characters)."];
  if (question.length < 15) fieldErrors.question = ["State your specific question or goal (at least 15 characters)."];

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: "Please complete the highlighted fields.", fieldErrors };
  }

  try {
    submitMentorshipRequest({
      mentorId,
      mentorName,
      menteeAlumniId: viewer.alumni?.id ?? null,
      menteeName: viewer.alumni?.fullName ?? viewer.email ?? "Verified Member",
      menteeEmail: viewer.email ?? "member@newtonhouse.org",
      menteeBatch: viewer.alumni
        ? `${viewer.alumni.department}, Class of ${viewer.alumni.graduationYear}`
        : "Newton House Member",
      title,
      areaOfGuidance,
      introduction,
      question,
      preferredCommunication,
    });

    revalidatePath("/mentorship");
    revalidatePath("/member/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/mentorship");

    return {
      ok: true,
      demo: viewer.demo,
      message: `Your mentorship request has been sent to ${mentorName}. Private contact details remain protected until the mentor accepts your request.`,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not send mentorship request." };
  }
}

export async function respondToMentorshipRequestAction(
  requestId: string,
  status: MentorshipRequestStatus,
  note: string | null = null,
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || (!viewer.isApprovedMember && !viewer.role)) {
    return { ok: false, message: "Authorisation required." };
  }
  try {
    respondMentorshipRequest(requestId, status, note, viewer.email ?? "member@newtonhouse.org");
    revalidatePath("/mentorship");
    revalidatePath("/member/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/mentorship");
    const label =
      status === "accepted"
        ? "accepted"
        : status === "declined"
          ? "declined"
          : "marked as needing more information";
    return { ok: true, message: `Mentorship request ${label}.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not update request." };
  }
}

export async function moderateMentorProfileAction(
  id: string,
  status: ModerationStatus,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    moderateMentorProfile(id, status, admin.email ?? "admin@newtonhouse.org");
    revalidatePath("/mentorship");
    revalidatePath("/admin");
    revalidatePath("/admin/mentorship");
    return { ok: true, message: `Mentor profile ${status}.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Moderation failed." };
  }
}

/* ==================================================================
   ADMIN: ROLES & SITE SETTINGS
   ================================================================== */
export async function updateUserRoleAction(
  userId: string,
  role: "admin" | "editor" | null,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    const s = store();
    const user = s.users.find((u) => u.id === userId);
    if (!user) return { ok: false, message: "User account not found." };
    const prev = user.role ?? "member";
    user.role = role;
    s.auditLogs.unshift({
      id: Math.random().toString(36).slice(2),
      entityType: "role",
      entityId: user.id,
      entityTitle: user.email,
      action: `Updated user role from ${prev} to ${role ?? "member"}`,
      actorEmail: admin.email ?? "admin@newtonhouse.org",
      previousStatus: prev,
      newStatus: role ?? "member",
      createdAt: new Date().toISOString(),
    });
    revalidatePath("/admin/roles");
    return { ok: true, message: `Role for ${user.email} updated to ${role ?? "member"}.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not update role." };
  }
}

export async function savePlatformSettingsAction(
  _: ActionResult | null,
  fd: FormData,
): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    updateSiteSettings(
      {
        requireRegistrationApproval: fd.get("requireRegistrationApproval") === "on",
        requireStoryModeration: fd.get("requireStoryModeration") === "on",
        requireArchiveModeration: fd.get("requireArchiveModeration") === "on",
        requireMentorApproval: fd.get("requireMentorApproval") === "on",
        allowMemberConnections: fd.get("allowMemberConnections") === "on",
      },
      admin.email ?? "admin@newtonhouse.org",
    );
    revalidatePath("/admin/settings");
    return { ok: true, message: "Platform moderation and privacy settings saved." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save settings." };
  }
}
