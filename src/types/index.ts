/* ------------------------------------------------------------------
   Domain types — mirror the Supabase schema in supabase/migrations.
   ------------------------------------------------------------------ */

export type AlumniStatus = "pending" | "approved" | "rejected";
export type ProfileVisibility = "public" | "members" | "private";

export type Department =
  | "Physics"
  | "Chemistry"
  | "Mathematics"
  | "Botany"
  | "Zoology"
  | "Geology"
  | "Statistics"
  | "Computer Science"
  | "Other";

export type Profession =
  | "Academia & Research"
  | "Civil Services"
  | "Science & Technology"
  | "Engineering"
  | "Medicine & Healthcare"
  | "Corporate"
  | "Entrepreneurship"
  | "Law & Policy"
  | "Education"
  | "Other";

/** Public-safe alumni record. Never contains private contact data unless the member consented. */
export interface AlumniProfile {
  id: string;
  slug: string;
  fullName: string;
  graduationYear: number;
  department: Department;
  designation: string | null;
  organisation: string | null;
  city: string | null;
  country: string | null;
  profession: Profession | null;
  linkedinUrl: string | null;
  photoUrl: string | null;
  bio: string | null;
  visibility: ProfileVisibility;
  /** Only populated when the member has opted in to show their email. */
  publicEmail: string | null;
  status: AlumniStatus;
  /** Clearly-labelled demonstration record (not a real person). */
  isSample: boolean;
  createdAt: string;
}

/** Full record — admin / owner only. */
export interface AlumniRecord extends AlumniProfile {
  email: string;
  phone: string | null;
  showEmail: boolean;
  userId: string | null;
}

export type AchievementCategory =
  | "academics-research"
  | "government-public-service"
  | "science-technology"
  | "corporate-leadership"
  | "entrepreneurship"
  | "other";

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  designation: string;
  organisation: string;
  category: AchievementCategory;
  summary: string;
  biography: string[];
  portraitUrl: string | null;
  graduationYear: number | null;
  department: Department | null;
  verified: boolean;
  isSample: boolean;
  published: boolean;
}

export type EventCategory =
  | "reunion"
  | "networking"
  | "lecture"
  | "gathering"
  | "cultural";

export interface NHEvent {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  startsAt: string; // ISO
  endsAt: string | null;
  venue: string;
  city: string;
  summary: string;
  body: string[];
  imageUrl: string | null;
  registrationOpen: boolean;
  capacity: number | null;
  isDemo: boolean;
  published: boolean;
  gallery: string[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  fullName: string;
  email: string;
  graduationYear: number | null;
  guests: number;
  note: string | null;
  createdAt: string;
}

export interface GalleryCategory {
  slug: string;
  name: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  categorySlug: string;
  imageUrl: string;
  width: number;
  height: number;
  /** Alt text describing the photograph for assistive technology. */
  alt: string;
  year: string | null;
  published: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface TimelineEntry {
  id: string;
  era: string;
  title: string;
  body: string;
  /** Date label is shown only when verified by the Association. */
  dateLabel: string | null;
  verified: boolean;
  image?: { src: string; alt: string };
}

export interface StatMetric {
  key: string;
  label: string;
  /** null = awaiting a verified figure; never display an invented number. */
  value: number | null;
  suffix?: string;
  caption: string;
}

/** Uniform result for server actions consumed by forms. */
export type ActionResult<T = undefined> =
  | { ok: true; message: string; data?: T; demo?: boolean }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };
