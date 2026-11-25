/* ------------------------------------------------------------------
   Domain types — mirror the Supabase schema in supabase/migrations.
   ------------------------------------------------------------------ */

export type AlumniStatus = "pending" | "approved" | "rejected" | "info_required";
export type ProfileVisibility = "public" | "members" | "private";
export type ModerationStatus = "pending" | "approved" | "rejected";

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
  residenceStartYear?: number | null;
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
  showLocation?: boolean;
  showProfessional?: boolean;
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
  showLocation?: boolean;
  showProfessional?: boolean;
  userId: string | null;
  reviewNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
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
  submittedBy?: string | null;
  submittedAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
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

/* ==================================================================
   FEATURE 1: MEMBER PORTAL — CONNECTIONS & NOTIFICATIONS
   ================================================================== */
export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface AlumniConnection {
  id: string;
  requesterId: string; // alumniId
  recipientId: string; // alumniId
  status: ConnectionStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | "registration_approval"
  | "connection_request"
  | "upcoming_event"
  | "achievement_approval"
  | "published_story"
  | "announcement";

export interface MemberNotification {
  id: string;
  alumniId: string | null; // null = broadcast to all approved members
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
}

/* ==================================================================
   FEATURE 2: NEWTON HOUSE BATCH DIRECTORY
   ================================================================== */
export interface BatchRecord {
  id: string;
  slug: string;
  year: number;
  residencePeriod: string;
  title: string;
  description: string;
  photoUrl: string | null;
  isSample: boolean;
}

export type BatchContributionType =
  | "photograph"
  | "memory"
  | "historical_info"
  | "reunion_detail";

export interface BatchContribution {
  id: string;
  batchSlug: string;
  batchYear: number;
  type: BatchContributionType;
  title: string;
  content: string;
  imageUrl: string | null;
  submittedBy: string;
  submitterAlumniId: string | null;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  status: ModerationStatus;
  isSample: boolean;
}

/* ==================================================================
   FEATURE 3: DIGITAL HERITAGE ARCHIVE
   ================================================================== */
export type ArchiveCategorySlug =
  | "historical-building"
  | "hostel-life"
  | "cultural-celebrations"
  | "sports-activities"
  | "hostel-administration"
  | "previous-superintendents"
  | "batch-photographs"
  | "festivals-celebrations"
  | "important-documents"
  | "newspaper-features";

export interface ArchiveCategory {
  slug: ArchiveCategorySlug;
  name: string;
  description: string;
}

export type ArchiveMediaType = "photograph" | "document";
export type ArchiveFileFormat = "webp" | "jpeg" | "png" | "pdf";

export interface ArchiveItem {
  id: string;
  title: string;
  categorySlug: ArchiveCategorySlug;
  mediaType: ArchiveMediaType;
  fileFormat: ArchiveFileFormat;
  fileUrl: string;
  previewUrl: string | null;
  width: number;
  height: number;
  approximateYear: string;
  yearVerified: boolean;
  description: string;
  contributorName: string;
  showContributor: boolean;
  permissionConfirmed: boolean;
  status: ModerationStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  isSample: boolean;
}

/* ==================================================================
   FEATURE 4: ALUMNI STORIES
   ================================================================== */
export type StoryCategorySlug =
  | "professional-journeys"
  | "academic-research"
  | "entrepreneurship"
  | "public-service"
  | "personal-memories"
  | "life-at-newton-house"
  | "inspirational-journeys";

export interface StoryCategory {
  slug: StoryCategorySlug;
  name: string;
  description: string;
}

export type StoryStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "published"
  | "rejected";

export interface AlumniStory {
  id: string;
  slug: string;
  title: string;
  categorySlug: StoryCategorySlug;
  summary: string;
  content: string[];
  coverImageUrl: string | null;
  supportingImages: string[];
  authorAlumniId: string | null;
  authorSlug: string | null;
  authorName: string;
  authorPhotoUrl: string | null;
  authorDepartment: Department;
  authorGraduationYear: number;
  authorResidenceYears: string | null;
  authorDesignation: string | null;
  authorOrganisation: string | null;
  featured: boolean;
  status: StoryStatus;
  publishedAt: string | null;
  submittedBy: string;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  isSample: boolean;
}

/* ==================================================================
   FEATURE 5: MENTORSHIP NETWORK
   ================================================================== */
export type MentorCategorySlug =
  | "civil-services-government"
  | "higher-education"
  | "research-academia"
  | "engineering-technology"
  | "corporate-careers"
  | "geoscience-earth-sciences"
  | "entrepreneurship"
  | "finance-management"
  | "medicine-healthcare"
  | "other-professional-fields";

export interface MentorCategory {
  slug: MentorCategorySlug;
  name: string;
  description: string;
}

export type CommunicationMethod =
  | "Platform Message"
  | "Email Introduction"
  | "Video Session"
  | "In-Person at Reunion";

export type MentorAvailability =
  | "Open for Mentorship"
  | "Limited Availability"
  | "Currently Unavailable";

export interface MentorProfile {
  id: string;
  alumniId: string | null;
  slug: string;
  name: string;
  photoUrl: string | null;
  graduationYear: number;
  department: Department;
  designation: string;
  organisation: string;
  city: string;
  industry: string;
  experienceYears: number;
  expertise: string[];
  categories: MentorCategorySlug[];
  preferredCommunication: CommunicationMethod;
  availability: MentorAvailability;
  bio: string;
  status: ModerationStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  isSample: boolean;
}

export type MentorshipRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "info_requested";

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeAlumniId: string | null;
  menteeName: string;
  menteeEmail: string;
  menteeBatch: string;
  title: string;
  areaOfGuidance: string;
  introduction: string;
  question: string;
  preferredCommunication: CommunicationMethod;
  status: MentorshipRequestStatus;
  mentorResponseNote: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ==================================================================
   ADMIN AUDIT LOGS & SITE SETTINGS
   ================================================================== */
export interface AuditLogEntry {
  id: string;
  entityType:
    | "alumni"
    | "batch_contribution"
    | "archive"
    | "story"
    | "achievement"
    | "event"
    | "mentor"
    | "mentorship_request"
    | "superintendent"
    | "timeline"
    | "testimonial"
    | "leadership"
    | "role"
    | "settings";
  entityId: string;
  entityTitle: string;
  action: string;
  actorEmail: string;
  previousStatus: string | null;
  newStatus: string | null;
  createdAt: string;
}

export interface SiteSettings {
  requireRegistrationApproval: boolean;
  requireStoryModeration: boolean;
  requireArchiveModeration: boolean;
  requireMentorApproval: boolean;
  allowMemberConnections: boolean;
  updatedAt: string;
  updatedBy: string;
}

/* ==================================================================
   ABOUT PAGE: SUPERINTENDENTS, HERITAGE TIMELINE, TESTIMONIALS & LEADERSHIP
   ================================================================== */
export interface SuperintendentRecord {
  id: string;
  fullName: string;
  designation: string;
  profileImage: string | null;
  tenureStart: string | null;
  tenureEnd: string | null;
  tenurePeriodLabel: string;
  isCurrent: boolean;
  biography: string;
  academicBackground: string | null;
  contributions: string;
  personalMessage: string | null;
  displayOrder: number;
  isPublished: boolean;
  /** True when the entry is a clearly labelled institutional placeholder awaiting verified details. */
  isPlaceholder: boolean;
  createdAt: string;
  updatedAt: string;
}

export type HeritageTimelineCategory =
  | "The Early Years"
  | "Growing Together"
  | "New Generations"
  | "A Changing Era"
  | "Today & Beyond";

export interface HeritageMilestone {
  id: string;
  category: HeritageTimelineCategory;
  periodLabel: string | null;
  verified: boolean;
  title: string;
  description: string;
  importantDevelopment: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  displayOrder: number;
  isPublished: boolean;
  isPlaceholder: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlumniTestimonial {
  id: string;
  alumniName: string;
  batchYear: string;
  department: Department | null;
  designation: string | null;
  photoUrl: string | null;
  quote: string;
  status: ModerationStatus;
  isPublished: boolean;
  isSample: boolean;
  submittedBy: string;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

export type AssociationLeadershipRole =
  | "President"
  | "Vice President"
  | "General Secretary"
  | "Joint Secretary"
  | "Treasurer"
  | "Executive Committee Member"
  | "Batch Representative"
  | "Faculty Advisor";

export interface AssociationLeader {
  id: string;
  fullName: string;
  role: AssociationLeadershipRole;
  batchYear: number | null;
  department: Department | null;
  designation: string | null;
  photoUrl: string | null;
  bio: string | null;
  displayOrder: number;
  isConfirmed: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Uniform result for server actions consumed by forms. */
export type ActionResult<T = undefined> =
  | { ok: true; message: string; data?: T; demo?: boolean }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };
