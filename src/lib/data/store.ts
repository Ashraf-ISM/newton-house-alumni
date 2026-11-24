import { sampleAlumni } from "@/data/alumni";
import { sampleAchievements } from "@/data/achievements";
import { sampleEvents } from "@/data/events";
import { galleryCategories, galleryItems, sampleAnnouncements } from "@/data/gallery";
import type {
  Achievement,
  AlumniRecord,
  Announcement,
  ContactMessage,
  EventRegistration,
  GalleryCategory,
  GalleryItem,
  NewsletterSubscriber,
  NHEvent,
} from "@/types";

/**
 * DEMO-MODE DATA STORE
 * --------------------------------------------------------------
 * Used only when Supabase credentials are absent. Holds structured
 * sample data in server memory so every form, approval and admin
 * action is fully functional during development. Data resets when
 * the server restarts. In production, configure Supabase and every
 * repository function transparently switches to PostgreSQL.
 */
export interface DemoStore {
  alumni: AlumniRecord[];
  achievements: Achievement[];
  events: NHEvent[];
  registrations: EventRegistration[];
  galleryCategories: GalleryCategory[];
  gallery: GalleryItem[];
  announcements: Announcement[];
  messages: ContactMessage[];
  subscribers: NewsletterSubscriber[];
}

export const DEMO_MEMBER_ID = "demo-member";

function createStore(): DemoStore {
  const demoMember: AlumniRecord = {
    id: DEMO_MEMBER_ID,
    slug: "demo-member-2014",
    fullName: "Demo Member",
    graduationYear: 2014,
    department: "Physics",
    designation: "Your designation",
    organisation: "Your organisation",
    city: "Patna",
    country: "India",
    profession: "Science & Technology",
    linkedinUrl: null,
    photoUrl: null,
    bio: "This is the demo member account used to preview the alumni portal. Edit any field to see how profile management works.",
    visibility: "members",
    publicEmail: null,
    status: "approved",
    isSample: true,
    createdAt: new Date().toISOString(),
    email: "demo.member@example.invalid",
    phone: null,
    showEmail: false,
    userId: "demo-user",
  };

  return {
    alumni: [demoMember, ...structuredClone(sampleAlumni)],
    achievements: structuredClone(sampleAchievements),
    events: structuredClone(sampleEvents),
    registrations: [],
    galleryCategories: structuredClone(galleryCategories),
    gallery: structuredClone(galleryItems),
    announcements: structuredClone(sampleAnnouncements),
    messages: [],
    subscribers: [],
  };
}

const g = globalThis as unknown as { __newtonHouseStore?: DemoStore };

export function store(): DemoStore {
  if (!g.__newtonHouseStore) g.__newtonHouseStore = createStore();
  return g.__newtonHouseStore;
}
