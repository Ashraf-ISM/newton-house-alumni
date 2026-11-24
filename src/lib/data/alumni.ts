import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { slugify, uid } from "@/lib/utils";
import type { AlumniProfile, AlumniRecord, AlumniStatus, Department, Profession, ProfileVisibility } from "@/types";
import { store } from "./store";

/* ------------------------------------------------------------------
   Mapping helpers (Supabase rows → domain types)
   ------------------------------------------------------------------ */
type DirectoryRow = {
  id: string;
  slug: string;
  full_name: string;
  graduation_year: number;
  department: Department;
  designation: string | null;
  organisation: string | null;
  city: string | null;
  country: string | null;
  profession: Profession | null;
  linkedin_url: string | null;
  photo_url: string | null;
  bio: string | null;
  visibility: ProfileVisibility;
  public_email: string | null;
  is_sample: boolean;
  created_at: string;
};

type AlumniRow = {
  id: string;
  user_id: string | null;
  slug: string;
  full_name: string;
  email: string;
  phone: string | null;
  graduation_year: number;
  department: Department;
  status: AlumniStatus;
  is_sample: boolean;
  created_at: string;
  alumni_profiles:
    | {
        designation: string | null;
        organisation: string | null;
        city: string | null;
        country: string | null;
        profession: Profession | null;
        linkedin_url: string | null;
        photo_url: string | null;
        bio: string | null;
        visibility: ProfileVisibility;
        show_email: boolean;
      }
    | null;
};

function fromDirectoryRow(r: DirectoryRow): AlumniProfile {
  return {
    id: r.id,
    slug: r.slug,
    fullName: r.full_name,
    graduationYear: r.graduation_year,
    department: r.department,
    designation: r.designation,
    organisation: r.organisation,
    city: r.city,
    country: r.country,
    profession: r.profession,
    linkedinUrl: r.linkedin_url,
    photoUrl: r.photo_url,
    bio: r.bio,
    visibility: r.visibility,
    publicEmail: r.public_email,
    status: "approved",
    isSample: r.is_sample,
    createdAt: r.created_at,
  };
}

function fromAlumniRow(r: AlumniRow): AlumniRecord {
  const p = r.alumni_profiles;
  return {
    id: r.id,
    userId: r.user_id,
    slug: r.slug,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    graduationYear: r.graduation_year,
    department: r.department,
    status: r.status,
    isSample: r.is_sample,
    createdAt: r.created_at,
    designation: p?.designation ?? null,
    organisation: p?.organisation ?? null,
    city: p?.city ?? null,
    country: p?.country ?? null,
    profession: p?.profession ?? null,
    linkedinUrl: p?.linkedin_url ?? null,
    photoUrl: p?.photo_url ?? null,
    bio: p?.bio ?? null,
    visibility: p?.visibility ?? "members",
    showEmail: p?.show_email ?? false,
    publicEmail: p?.show_email ? r.email : null,
  };
}

/**
 * Strip private fields so a full record can be safely sent to the browser.
 * Contact & social links (`publicEmail`, `linkedinUrl`) are only exposed to
 * signed-in approved members (and `publicEmail` additionally requires `showEmail` consent).
 */
export function toPublicProfile(r: AlumniRecord, viewerIsMember = false): AlumniProfile {
  return {
    id: r.id,
    slug: r.slug,
    fullName: r.fullName,
    graduationYear: r.graduationYear,
    department: r.department,
    designation: r.designation,
    organisation: r.organisation,
    city: r.city,
    country: r.country,
    profession: r.profession,
    linkedinUrl: viewerIsMember ? r.linkedinUrl : null,
    photoUrl: r.photoUrl,
    bio: r.bio,
    visibility: r.visibility,
    publicEmail: viewerIsMember && r.showEmail ? r.email : null,
    status: r.status,
    isSample: r.isSample,
    createdAt: r.createdAt,
  };
}

/* ------------------------------------------------------------------
   Public directory
   ------------------------------------------------------------------ */

/**
 * Approved alumni visible to the current viewer.
 * - Public visitors: `public` profiles only.
 * - Signed-in approved members: `public` + `members` profiles.
 * Private profiles are never listed. Enforced by RLS + the
 * `alumni_directory` view in Supabase, and mirrored here for demo mode.
 */
export async function listDirectory(opts: { viewerIsMember: boolean }): Promise<AlumniProfile[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("alumni_directory")
      .select("*")
      .order("full_name", { ascending: true });
    if (error) {
      console.error("[alumni] listDirectory", error.message);
      return [];
    }
    return (data as DirectoryRow[]).map(fromDirectoryRow);
  }

  return store()
    .alumni.filter(
      (a) =>
        a.status === "approved" &&
        (a.visibility === "public" || (opts.viewerIsMember && a.visibility === "members")),
    )
    .map((a) => toPublicProfile(a, opts.viewerIsMember))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function getDirectoryProfile(slug: string, opts: { viewerIsMember: boolean }) {
  const all = await listDirectory(opts);
  return all.find((a) => a.slug === slug) ?? null;
}

/** Slugs for static generation of public profiles. */
export async function listPublicSlugs(): Promise<string[]> {
  if (isSupabaseConfigured()) return []; // rendered on demand
  return store()
    .alumni.filter((a) => a.status === "approved" && a.visibility === "public")
    .map((a) => a.slug);
}

/* ------------------------------------------------------------------
   Registration & profile management
   ------------------------------------------------------------------ */

export interface RegistrationInput {
  fullName: string;
  email: string;
  passwordHash?: string;
  graduationYear: number;
  department: Department;
  organisation: string | null;
  designation: string | null;
  city: string | null;
  profession: Profession | null;
  linkedinUrl: string | null;
  bio: string | null;
  visibility: ProfileVisibility;
  showEmail: boolean;
  photoUrl: string | null;
}

/** Local-mode registration. (In Supabase mode a database trigger creates the rows on sign-up.) */
export function demoCreateRegistration(input: RegistrationInput): AlumniRecord {
  const s = store();
  const normEmail = input.email.trim().toLowerCase();
  if (
    s.alumni.some((a) => a.email.toLowerCase() === normEmail) ||
    s.users.some((u) => u.email.toLowerCase() === normEmail)
  ) {
    throw new Error("An alumni registration with this email already exists.");
  }
  const base = slugify(`${input.fullName}-${input.graduationYear}`);
  let slug = base;
  let n = 2;
  while (s.alumni.some((a) => a.slug === slug)) slug = `${base}-${n++}`;

  const alumniId = uid();
  const userId = input.passwordHash ? uid() : null;

  const record: AlumniRecord = {
    id: alumniId,
    userId,
    slug,
    fullName: input.fullName,
    email: normEmail,
    phone: null,
    graduationYear: input.graduationYear,
    department: input.department,
    designation: input.designation,
    organisation: input.organisation,
    city: input.city,
    country: "India",
    profession: input.profession,
    linkedinUrl: input.linkedinUrl,
    photoUrl: input.photoUrl,
    bio: input.bio,
    visibility: input.visibility,
    showEmail: input.showEmail,
    publicEmail: null,
    status: "pending",
    isSample: false,
    createdAt: new Date().toISOString(),
  };
  s.alumni.unshift(record);

  if (userId && input.passwordHash) {
    s.users.push({
      id: userId,
      email: normEmail,
      passwordHash: input.passwordHash,
      role: null,
      alumniId,
    });
  }
  return record;
}

export async function getMyAlumniRecord(userId: string): Promise<AlumniRecord | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("alumni")
      .select("*, alumni_profiles(*)")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.error("[alumni] getMyAlumniRecord", error.message);
      return null;
    }
    return data ? fromAlumniRow(data as AlumniRow) : null;
  }
  return store().alumni.find((a) => a.userId === userId) ?? null;
}

export interface ProfileUpdate {
  designation: string | null;
  organisation: string | null;
  city: string | null;
  country: string | null;
  profession: Profession | null;
  linkedinUrl: string | null;
  bio: string | null;
  visibility: ProfileVisibility;
  showEmail: boolean;
  photoUrl?: string | null;
}

/** Owner or admin update of profile fields. RLS restricts owners to their own row. */
export async function updateProfile(alumniId: string, patch: ProfileUpdate) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const row: Record<string, unknown> = {
      designation: patch.designation,
      organisation: patch.organisation,
      city: patch.city,
      country: patch.country,
      profession: patch.profession,
      linkedin_url: patch.linkedinUrl,
      bio: patch.bio,
      visibility: patch.visibility,
      show_email: patch.showEmail,
    };
    if (patch.photoUrl !== undefined) row.photo_url = patch.photoUrl;
    const { error } = await supabase.from("alumni_profiles").update(row).eq("alumni_id", alumniId);
    if (error) throw new Error(error.message);
    return;
  }
  const rec = store().alumni.find((a) => a.id === alumniId);
  if (!rec) throw new Error("Profile not found.");
  Object.assign(rec, patch);
}

/* ------------------------------------------------------------------
   Admin
   ------------------------------------------------------------------ */

export async function adminListAlumni(): Promise<AlumniRecord[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("alumni")
      .select("*, alumni_profiles(*)")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[alumni] adminListAlumni", error.message);
      return [];
    }
    return (data as AlumniRow[]).map(fromAlumniRow);
  }
  return [...store().alumni];
}

export async function adminGetAlumni(id: string): Promise<AlumniRecord | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("alumni").select("*, alumni_profiles(*)").eq("id", id).maybeSingle();
    return data ? fromAlumniRow(data as AlumniRow) : null;
  }
  return store().alumni.find((a) => a.id === id) ?? null;
}

export async function adminSetStatus(id: string, status: AlumniStatus, reviewerId: string | null) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("alumni")
      .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: reviewerId })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const rec = store().alumni.find((a) => a.id === id);
  if (!rec) throw new Error("Record not found.");
  rec.status = status;
}

export async function adminUpdateIdentity(
  id: string,
  patch: { fullName: string; graduationYear: number; department: Department },
) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase
      .from("alumni")
      .update({ full_name: patch.fullName, graduation_year: patch.graduationYear, department: patch.department })
      .eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const rec = store().alumni.find((a) => a.id === id);
  if (!rec) throw new Error("Record not found.");
  Object.assign(rec, patch);
}

export async function adminDeleteAlumni(id: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("alumni").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const s = store();
  s.alumni = s.alumni.filter((a) => a.id !== id);
  s.users = s.users.filter((u) => u.alumniId !== id);
}
