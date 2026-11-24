"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth";
import { adminDeleteAlumni, adminSetStatus, adminUpdateIdentity, updateProfile } from "@/lib/data/alumni";
import {
  addGalleryItem,
  createAnnouncement,
  deleteAchievement,
  deleteAnnouncement,
  deleteGalleryItem,
  setAchievementApproval,
  setAnnouncementPublished,
  setGalleryPublished,
  upsertAchievement,
} from "@/lib/data/content";
import { deleteEvent, upsertEvent } from "@/lib/data/events";
import { removeSubscriber, setMessageHandled } from "@/lib/data/inbox";
import { fileFrom, storeImage, validateImageFile } from "@/lib/storage";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  achievementSchema,
  announcementSchema,
  departmentSchema,
  eventSchema,
  fieldErrors,
  formToObject,
  galleryItemSchema,
  profileSchema,
} from "@/lib/validations";
import type { ActionResult, AlumniStatus, Department, Profession } from "@/types";

function refreshPublic(...paths: string[]) {
  ["/", "/admin", ...paths].forEach((p) => revalidatePath(p));
}

async function storageClient() {
  return isSupabaseConfigured() ? await createClient() : undefined;
}

/* ---------------- Alumni moderation ---------------- */
export async function setAlumniStatus(id: string, status: AlumniStatus): Promise<ActionResult> {
  try {
    const admin = await assertAdmin();
    await adminSetStatus(id, status, admin.demo ? null : admin.userId);
    refreshPublic("/alumni", "/admin/alumni");
    const verb = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "returned to pending";
    return { ok: true, message: `Registration ${verb}.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function removeAlumni(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    await adminDeleteAlumni(id);
    refreshPublic("/alumni", "/admin/alumni");
    return { ok: true, message: "Record deleted." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function adminSaveAlumni(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  const id = String(fd.get("id") ?? "");
  const obj = formToObject(fd);
  const profile = profileSchema.safeParse(obj);
  const dept = departmentSchema.safeParse(obj.department);
  const year = Number(obj.graduationYear);
  const errors = profile.success ? {} : fieldErrors(profile.error);
  if (!dept.success) errors.department = ["Choose a department."];
  if (!Number.isInteger(year) || year < 1920 || year > 2100) errors.graduationYear = ["Enter a valid year."];
  if (!obj.fullName || obj.fullName.trim().length < 3) errors.fullName = ["Enter the full name."];
  if (!profile.success || Object.keys(errors).length) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: errors };
  }
  try {
    await adminUpdateIdentity(id, { fullName: obj.fullName.trim(), graduationYear: year, department: dept.data as Department });
    await updateProfile(id, { ...profile.data, profession: profile.data.profession as Profession | null });
    refreshPublic("/alumni", "/admin/alumni");
    return { ok: true, message: "Profile updated." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save." };
  }
}

/* ---------------- Events ---------------- */
export async function saveEvent(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  const id = (fd.get("id") as string) || null;
  const parsed = eventSchema.safeParse(formToObject(fd));
  const image = fileFrom(fd, "image");
  const imageErr = validateImageFile(image);
  const errors = parsed.success ? {} : fieldErrors(parsed.error);
  if (imageErr) errors.image = [imageErr];
  if (!parsed.success || Object.keys(errors).length) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: errors };
  }
  const v = parsed.data;
  // datetime-local values are entered in IST
  const toIso = (local: string) => new Date(`${local}:00+05:30`).toISOString();
  try {
    let imageUrl = v.imageUrl;
    if (image) imageUrl = (await storeImage(image, { bucket: "events", folder: "covers", maxSize: 2000, client: await storageClient() })).url;
    await upsertEvent(id, {
      slug: v.slug,
      title: v.title,
      category: v.category,
      startsAt: toIso(v.startsAt),
      endsAt: v.endsAt ? toIso(v.endsAt) : null,
      venue: v.venue,
      city: v.city,
      summary: v.summary,
      body: v.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      imageUrl,
      registrationOpen: v.registrationOpen,
      capacity: v.capacity,
      isDemo: v.isDemo,
      published: v.published,
      gallery: [],
    });
    refreshPublic("/events", `/events/${v.slug}`, "/admin/events");
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save the event." };
  }
  redirect("/admin/events?saved=1");
}

export async function removeEvent(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    await deleteEvent(id);
    refreshPublic("/events", "/admin/events");
    return { ok: true, message: "Event deleted." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

/* ---------------- Achievements ---------------- */
export async function saveAchievement(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  const id = (fd.get("id") as string) || null;
  const parsed = achievementSchema.safeParse(formToObject(fd));
  const portrait = fileFrom(fd, "portrait");
  const pErr = validateImageFile(portrait);
  const errors = parsed.success ? {} : fieldErrors(parsed.error);
  if (pErr) errors.portrait = [pErr];
  if (!parsed.success || Object.keys(errors).length) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: errors };
  }
  const v = parsed.data;
  try {
    let portraitUrl = v.portraitUrl;
    if (portrait) portraitUrl = (await storeImage(portrait, { bucket: "gallery", folder: "portraits", maxSize: 900, client: await storageClient() })).url;
    await upsertAchievement(id, {
      slug: v.slug,
      name: v.name,
      designation: v.designation,
      organisation: v.organisation,
      category: v.category,
      summary: v.summary,
      biography: v.biography.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      portraitUrl,
      graduationYear: v.graduationYear,
      department: null,
      verified: v.verified,
      isSample: v.isSample,
      published: v.published,
    });
    refreshPublic("/achievements", `/achievements/${v.slug}`, "/admin/achievements");
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save." };
  }
  redirect("/admin/achievements?saved=1");
}

export async function removeAchievement(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    await deleteAchievement(id);
    refreshPublic("/achievements", "/admin/achievements");
    return { ok: true, message: "Profile deleted." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function approveAchievement(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    await setAchievementApproval(id, { verified: true, published: true });
    refreshPublic("/achievements", "/admin/achievements");
    return { ok: true, message: "Achievement verified and published." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

/* ---------------- Gallery ---------------- */
export async function saveGalleryItem(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  const parsed = galleryItemSchema.safeParse(formToObject(fd));
  const file = fileFrom(fd, "file");
  const fileErr = validateImageFile(file);
  const errors = parsed.success ? {} : fieldErrors(parsed.error);
  if (fileErr) errors.file = [fileErr];
  if (parsed.success && !file && !parsed.data.imageUrl) errors.file = ["Upload a photograph or provide an image path."];
  if (!parsed.success || Object.keys(errors).length) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: errors };
  }
  const v = parsed.data;
  try {
    let { imageUrl, width, height } = v;
    if (file) {
      const stored = await storeImage(file, { bucket: "gallery", folder: v.categorySlug, maxSize: 2400, client: await storageClient() });
      imageUrl = stored.url;
      width = stored.width;
      height = stored.height;
    }
    await addGalleryItem({
      title: v.title,
      caption: v.caption,
      alt: v.alt,
      categorySlug: v.categorySlug,
      imageUrl,
      width,
      height,
      year: v.year,
      published: v.published,
    });
    refreshPublic("/memories", "/admin/gallery");
    return { ok: true, message: "Photograph added to the gallery." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not add the photograph." };
  }
}

export async function toggleGalleryItem(id: string, published: boolean): Promise<ActionResult> {
  try {
    await assertAdmin();
    await setGalleryPublished(id, published);
    refreshPublic("/memories", "/admin/gallery");
    return { ok: true, message: published ? "Photograph published." : "Photograph hidden." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function removeGalleryItem(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    await deleteGalleryItem(id);
    refreshPublic("/memories", "/admin/gallery");
    return { ok: true, message: "Photograph removed." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

/* ---------------- Announcements ---------------- */
export async function saveAnnouncement(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  try {
    await assertAdmin();
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  const parsed = announcementSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  try {
    await createAnnouncement(parsed.data);
    refreshPublic("/admin/announcements", "/events");
    return { ok: true, message: parsed.data.published ? "Announcement published." : "Announcement saved as draft." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save." };
  }
}

export async function toggleAnnouncement(id: string, published: boolean): Promise<ActionResult> {
  try {
    await assertAdmin();
    await setAnnouncementPublished(id, published);
    refreshPublic("/admin/announcements", "/events");
    return { ok: true, message: published ? "Announcement published." : "Announcement unpublished." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function removeAnnouncement(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    await deleteAnnouncement(id);
    refreshPublic("/admin/announcements", "/events");
    return { ok: true, message: "Announcement deleted." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

/* ---------------- Inbox ---------------- */
export async function unsubscribe(id: string): Promise<ActionResult> {
  try {
    await assertAdmin();
    await removeSubscriber(id);
    revalidatePath("/admin/subscribers");
    return { ok: true, message: "Subscriber removed." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}

export async function markMessage(id: string, handled: boolean): Promise<ActionResult> {
  try {
    await assertAdmin();
    await setMessageHandled(id, handled);
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
    return { ok: true, message: handled ? "Marked as handled." : "Marked as open." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Action failed." };
  }
}
