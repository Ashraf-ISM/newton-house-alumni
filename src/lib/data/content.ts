import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, createPublicClient } from "@/lib/supabase/server";
import { slugify, uid } from "@/lib/utils";
import type { Achievement, AchievementCategory, Announcement, Department, GalleryCategory, GalleryItem } from "@/types";
import { store } from "./store";

/* ==================================================================
   ACHIEVEMENTS
   ================================================================== */
type AchievementRow = {
  id: string;
  slug: string;
  name: string;
  designation: string;
  organisation: string;
  category: AchievementCategory;
  summary: string;
  biography: string | null;
  portrait_url: string | null;
  graduation_year: number | null;
  department: Department | null;
  verified: boolean;
  is_sample: boolean;
  published: boolean;
};

function achievementFromRow(r: AchievementRow): Achievement {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    designation: r.designation,
    organisation: r.organisation,
    category: r.category,
    summary: r.summary,
    biography: (r.biography ?? "").split(/\n{2,}/).filter(Boolean),
    portraitUrl: r.portrait_url,
    graduationYear: r.graduation_year,
    department: r.department,
    verified: r.verified,
    isSample: r.is_sample,
    published: r.published,
  };
}

export async function listAchievements(opts: { includeUnpublished?: boolean } = {}): Promise<Achievement[]> {
  if (isSupabaseConfigured()) {
    const supabase = opts.includeUnpublished ? await createClient() : createPublicClient();
    let q = supabase.from("achievements").select("*").order("created_at", { ascending: true });
    if (!opts.includeUnpublished) q = q.eq("published", true);
    const { data, error } = await q;
    if (error) {
      console.error("[achievements] list", error.message);
      return [];
    }
    return (data as AchievementRow[]).map(achievementFromRow);
  }
  return store().achievements.filter((a) => opts.includeUnpublished || a.published);
}

export async function getAchievement(slug: string) {
  return (await listAchievements()).find((a) => a.slug === slug) ?? null;
}

export async function upsertAchievement(id: string | null, a: Omit<Achievement, "id">) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const row = {
      slug: a.slug,
      name: a.name,
      designation: a.designation,
      organisation: a.organisation,
      category: a.category,
      summary: a.summary,
      biography: a.biography.join("\n\n"),
      portrait_url: a.portraitUrl,
      graduation_year: a.graduationYear,
      department: a.department,
      verified: a.verified,
      is_sample: a.isSample,
      published: a.published,
    };
    const { error } = id
      ? await supabase.from("achievements").update(row).eq("id", id)
      : await supabase.from("achievements").insert(row);
    if (error) throw new Error(error.message);
    return;
  }
  const s = store();
  if (s.achievements.some((x) => x.slug === a.slug && x.id !== id)) throw new Error("Another profile already uses this URL slug.");
  if (id) {
    const ex = s.achievements.find((x) => x.id === id);
    if (!ex) throw new Error("Achievement not found.");
    Object.assign(ex, a);
  } else s.achievements.push({ ...a, id: uid() });
}

export async function deleteAchievement(id: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const s = store();
  s.achievements = s.achievements.filter((a) => a.id !== id);
}

/**
 * Public achievement submission — always created as an unpublished, unverified
 * draft awaiting admin review and member verification before publication.
 */
export async function createAchievementSubmission(
  input: Omit<Achievement, "id" | "slug" | "verified" | "isSample" | "published">,
) {
  const baseSlug = slugify(input.graduationYear ? `${input.name}-${input.graduationYear}` : input.name) || `achievement-${Date.now()}`;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const slug = `${baseSlug}-${uid().slice(0, 6)}`;
    const { error } = await supabase.from("achievements").insert({
      slug,
      name: input.name,
      designation: input.designation,
      organisation: input.organisation,
      category: input.category,
      summary: input.summary,
      biography: input.biography.join("\n\n"),
      portrait_url: input.portraitUrl,
      graduation_year: input.graduationYear,
      department: input.department,
      verified: false,
      is_sample: false,
      published: false,
    });
    if (error) throw new Error(error.message);
    return slug;
  }

  const s = store();
  let slug = baseSlug;
  let n = 2;
  while (s.achievements.some((x) => x.slug === slug)) slug = `${baseSlug}-${n++}`;
  s.achievements.unshift({
    ...input,
    id: uid(),
    slug,
    verified: false,
    isSample: false,
    published: false,
  });
  return slug;
}

export async function setAchievementApproval(id: string, opts: { verified: boolean; published: boolean }) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("achievements")
      .update({ verified: opts.verified, published: opts.published })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const ex = store().achievements.find((x) => x.id === id);
  if (!ex) throw new Error("Achievement not found.");
  ex.verified = opts.verified;
  ex.published = opts.published;
}

/* ==================================================================
   GALLERY
   ================================================================== */
type GalleryRow = {
  id: string;
  title: string;
  caption: string | null;
  category_slug: string;
  image_url: string;
  width: number;
  height: number;
  alt: string;
  year: string | null;
  published: boolean;
};

export async function listGalleryCategories(): Promise<GalleryCategory[]> {
  if (isSupabaseConfigured()) {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("gallery_categories").select("*").order("sort_order");
    if (error) {
      console.error("[gallery] categories", error.message);
      return [];
    }
    return (data ?? []).map((c) => ({ slug: c.slug, name: c.name, description: c.description ?? "" }));
  }
  return store().galleryCategories;
}

export async function listGallery(opts: { includeUnpublished?: boolean } = {}): Promise<GalleryItem[]> {
  if (isSupabaseConfigured()) {
    const supabase = opts.includeUnpublished ? await createClient() : createPublicClient();
    let q = supabase.from("gallery").select("*").order("sort_order").order("created_at", { ascending: false });
    if (!opts.includeUnpublished) q = q.eq("published", true);
    const { data, error } = await q;
    if (error) {
      console.error("[gallery] list", error.message);
      return [];
    }
    return (data as GalleryRow[]).map((r) => ({
      id: r.id,
      title: r.title,
      caption: r.caption ?? "",
      categorySlug: r.category_slug,
      imageUrl: r.image_url,
      width: r.width,
      height: r.height,
      alt: r.alt,
      year: r.year,
      published: r.published,
    }));
  }
  return store().gallery.filter((g) => opts.includeUnpublished || g.published);
}

export async function addGalleryItem(item: Omit<GalleryItem, "id">) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("gallery").insert({
      title: item.title,
      caption: item.caption,
      category_slug: item.categorySlug,
      image_url: item.imageUrl,
      width: item.width,
      height: item.height,
      alt: item.alt,
      year: item.year,
      published: item.published,
    });
    if (error) throw new Error(error.message);
    return;
  }
  store().gallery.unshift({ ...item, id: uid() });
}

export async function setGalleryPublished(id: string, published: boolean) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("gallery").update({ published }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const it = store().gallery.find((g) => g.id === id);
  if (it) it.published = published;
}

export async function deleteGalleryItem(id: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const s = store();
  s.gallery = s.gallery.filter((g) => g.id !== id);
}

/* ==================================================================
   ANNOUNCEMENTS
   ================================================================== */
export async function listAnnouncements(opts: { includeUnpublished?: boolean } = {}): Promise<Announcement[]> {
  if (isSupabaseConfigured()) {
    const supabase = opts.includeUnpublished ? await createClient() : createPublicClient();
    let q = supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (!opts.includeUnpublished) q = q.eq("published", true);
    const { data, error } = await q;
    if (error) {
      console.error("[announcements] list", error.message);
      return [];
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      published: r.published,
      publishedAt: r.published_at,
      createdAt: r.created_at,
    }));
  }
  return store()
    .announcements.filter((a) => opts.includeUnpublished || a.published)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createAnnouncement(a: { title: string; body: string; published: boolean }) {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("announcements")
      .insert({ ...a, published_at: a.published ? now : null });
    if (error) throw new Error(error.message);
    return;
  }
  store().announcements.unshift({ ...a, id: uid(), createdAt: now, publishedAt: a.published ? now : null });
}

export async function setAnnouncementPublished(id: string, published: boolean) {
  const now = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("announcements")
      .update({ published, published_at: published ? now : null })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const a = store().announcements.find((x) => x.id === id);
  if (a) {
    a.published = published;
    a.publishedAt = published ? now : null;
  }
}

export async function deleteAnnouncement(id: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const s = store();
  s.announcements = s.announcements.filter((a) => a.id !== id);
}
