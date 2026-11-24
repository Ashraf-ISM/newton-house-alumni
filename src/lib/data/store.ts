import { sampleAlumni } from "@/data/alumni";
import { sampleAchievements } from "@/data/achievements";
import {
  defaultSiteSettings,
  sampleArchiveItems,
  sampleAuditLogs,
  sampleBatchContributions,
  sampleBatches,
  sampleConnections,
  sampleMentors,
  sampleMentorshipRequests,
  sampleNotifications,
  sampleStories,
} from "@/data/community";
import { sampleEvents } from "@/data/events";
import { galleryCategories, galleryItems, sampleAnnouncements } from "@/data/gallery";
import type {
  Achievement,
  AlumniConnection,
  AlumniRecord,
  AlumniStory,
  Announcement,
  ArchiveItem,
  AuditLogEntry,
  BatchContribution,
  BatchRecord,
  ContactMessage,
  EventRegistration,
  GalleryCategory,
  GalleryItem,
  MemberNotification,
  MentorProfile,
  MentorshipRequest,
  NewsletterSubscriber,
  NHEvent,
  SiteSettings,
} from "@/types";

export interface LocalAuthUser {
  id: string;
  email: string;
  passwordHash: string;
  role: "admin" | "editor" | null;
  alumniId: string | null;
}

/**
 * IN-MEMORY DATA STORE (active when Supabase env vars are not configured
 * or when operating in local hybrid mode).
 */
export interface DemoStore {
  users: LocalAuthUser[];
  alumni: AlumniRecord[];
  achievements: Achievement[];
  events: NHEvent[];
  registrations: EventRegistration[];
  galleryCategories: GalleryCategory[];
  gallery: GalleryItem[];
  announcements: Announcement[];
  messages: ContactMessage[];
  subscribers: NewsletterSubscriber[];
  batches: BatchRecord[];
  batchContributions: BatchContribution[];
  archiveItems: ArchiveItem[];
  stories: AlumniStory[];
  mentors: MentorProfile[];
  mentorshipRequests: MentorshipRequest[];
  connections: AlumniConnection[];
  notifications: MemberNotification[];
  auditLogs: AuditLogEntry[];
  settings: SiteSettings;
}

export const DEMO_ADMIN_USER_ID = "user-admin-1";
export const DEMO_MEMBER_USER_ID = "user-member-1";
export const DEMO_MEMBER_ID = "demo-member";

// Precomputed PBKDF2-SHA256 (100k iterations) hashes for default local accounts:
// - admin@newtonhouse.org  / NewtonAdmin@2026
// - member@newtonhouse.org / NewtonMember@2026
const DEFAULT_ADMIN_HASH =
  "pbkdf2$bmgtYWRtaW4tc2FsdC0yNg$Fz_qck3zQ-GVuIdKFVZzFc-NTw0uimbKthdaEv187AY";
const DEFAULT_MEMBER_HASH =
  "pbkdf2$bmgtbWVtYnItc2FsdC0yNg$8Gy5Vv40L9_Y4YOKW3b5P5MJS0y_6iDnaMBtVd4vEMw";

function createStore(): DemoStore {
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@newtonhouse.org").trim().toLowerCase();
  const memberEmail = (process.env.MEMBER_EMAIL ?? "member@newtonhouse.org").trim().toLowerCase();

  const approvedMemberRecord: AlumniRecord = {
    id: DEMO_MEMBER_ID,
    slug: "verified-member-2014",
    fullName: "Verified Alumnus (Sample)",
    graduationYear: 2014,
    residenceStartYear: 2011,
    department: "Physics",
    designation: "Senior Research Scientist",
    organisation: "National Research Laboratory",
    city: "Patna",
    country: "India",
    profession: "Science & Technology",
    linkedinUrl: "https://www.linkedin.com/in/newton-house-sample",
    photoUrl: null,
    bio: "Sample approved member account used to test the Advanced Member Portal, batch connections, stories and privacy controls.",
    visibility: "members",
    publicEmail: null,
    showLocation: true,
    showProfessional: true,
    status: "approved",
    isSample: true,
    createdAt: new Date().toISOString(),
    email: memberEmail,
    phone: null,
    showEmail: false,
    userId: DEMO_MEMBER_USER_ID,
    reviewedBy: adminEmail,
    reviewedAt: "2026-11-20T09:00:00.000Z",
  };

  const users: LocalAuthUser[] = [
    {
      id: DEMO_ADMIN_USER_ID,
      email: adminEmail,
      passwordHash: DEFAULT_ADMIN_HASH,
      role: "admin",
      alumniId: null,
    },
    {
      id: DEMO_MEMBER_USER_ID,
      email: memberEmail,
      passwordHash: DEFAULT_MEMBER_HASH,
      role: null,
      alumniId: DEMO_MEMBER_ID,
    },
  ];

  const seededAlumni = structuredClone(sampleAlumni).map((a) => ({
    ...a,
    residenceStartYear: a.graduationYear - 3,
    showLocation: true,
    showProfessional: true,
  }));

  return {
    users,
    alumni: [approvedMemberRecord, ...seededAlumni],
    achievements: structuredClone(sampleAchievements),
    events: structuredClone(sampleEvents),
    registrations: [],
    galleryCategories: structuredClone(galleryCategories),
    gallery: structuredClone(galleryItems),
    announcements: structuredClone(sampleAnnouncements),
    messages: [],
    subscribers: [],
    batches: structuredClone(sampleBatches),
    batchContributions: structuredClone(sampleBatchContributions),
    archiveItems: structuredClone(sampleArchiveItems),
    stories: structuredClone(sampleStories),
    mentors: structuredClone(sampleMentors),
    mentorshipRequests: structuredClone(sampleMentorshipRequests),
    connections: structuredClone(sampleConnections),
    notifications: structuredClone(sampleNotifications),
    auditLogs: structuredClone(sampleAuditLogs),
    settings: structuredClone(defaultSiteSettings),
  };
}

const g = globalThis as unknown as { __newtonHouseStore?: DemoStore };

export function store(): DemoStore {
  const s = g.__newtonHouseStore;
  if (!s || !s.archiveItems || !s.stories || !s.mentors) {
    g.__newtonHouseStore = createStore();
  }
  return g.__newtonHouseStore!;
}
