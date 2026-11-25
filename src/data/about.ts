import { images } from "./images";
import type {
  AlumniTestimonial,
  AssociationLeader,
  AssociationLeadershipRole,
  HeritageMilestone,
  HeritageTimelineCategory,
  SuperintendentRecord,
} from "@/types";

export const heritageTimelineCategories: HeritageTimelineCategory[] = [
  "The Early Years",
  "Growing Together",
  "New Generations",
  "A Changing Era",
  "Today & Beyond",
];

export const associationLeadershipRoles: {
  role: AssociationLeadershipRole;
  description: string;
}[] = [
  {
    role: "President",
    description: "Presides over the General Body and Executive Committee of the Newton House Alumni Association.",
  },
  {
    role: "Vice President",
    description: "Supports institutional outreach, annual reunions, and cross-generational initiatives.",
  },
  {
    role: "General Secretary",
    description: "Coordinates day-to-day administration, member verification, and official correspondence.",
  },
  {
    role: "Joint Secretary",
    description: "Assists with chapter coordination, student mentorship, and archival documentation.",
  },
  {
    role: "Treasurer",
    description: "Maintains transparent stewardship of association funds and community initiatives.",
  },
  {
    role: "Executive Committee Member",
    description: "Steers programmes across mentorship, heritage preservation, and campus engagement.",
  },
  {
    role: "Batch Representative",
    description: "Connects individual residence cohorts with the central Alumni Association.",
  },
  {
    role: "Faculty Advisor",
    description: "Bridges the alumni community with Patna Science College and hostel administration.",
  },
];

/**
 * Initial Heritage Timeline Milestones across the 5 required chapters.
 * No historical dates are invented — dates remain `null` (`verified: false`)
 * until confirmed from official Patna Science College records via `/admin/about`.
 */
export const initialHeritageMilestones: HeritageMilestone[] = [
  {
    id: "milestone-early-years",
    category: "The Early Years",
    periodLabel: null,
    verified: false,
    title: "The Red-Brick Sanctuary Rises on Campus",
    description:
      "Constructed on the historic grounds of Patna Science College along Ashok Rajpath, Newton House opened its arched entrance and three storeys of green-shuttered rooms to science scholars arriving from across Bihar and eastern India.",
    importantDevelopment:
      "Establishment of Newton House as a dedicated residential community for undergraduate and postgraduate science students.",
    imageUrl: images.archiveEntrance.src,
    imageAlt: images.archiveEntrance.alt,
    displayOrder: 1,
    isPublished: true,
    isPlaceholder: false,
    createdAt: "2026-11-01T09:00:00.000Z",
    updatedAt: "2026-11-01T09:00:00.000Z",
  },
  {
    id: "milestone-growing-together",
    category: "Growing Together",
    periodLabel: null,
    verified: false,
    title: "Traditions of Study, Discipline & Brotherhood",
    description:
      "Within the long verandas and shared study rooms, a distinctive hostel culture took root — seniors mentoring incoming freshers, late-night problem-solving sessions before university examinations, and lifelong bonds forged over evening tea.",
    importantDevelopment:
      "Formation of enduring house customs: fresher welcomes, study circles, and inter-hostel academic camaraderie.",
    imageUrl: images.archiveExterior.src,
    imageAlt: images.archiveExterior.alt,
    displayOrder: 2,
    isPublished: true,
    isPlaceholder: false,
    createdAt: "2026-11-02T09:00:00.000Z",
    updatedAt: "2026-11-02T09:00:00.000Z",
  },
  {
    id: "milestone-new-generations",
    category: "New Generations",
    periodLabel: null,
    verified: false,
    title: "Carrying Newton House Into Laboratories & Public Service",
    description:
      "Successive cohorts carried the scientific rigor of Patna Science College into national research laboratories, universities, civil services, industry, and medicine — creating an informal network of Newton House seniors across the country.",
    importantDevelopment:
      "Expansion of the Newton House alumni footprint across academic research, public administration, and scientific institutions.",
    imageUrl: images.facadeWestWing.src,
    imageAlt: images.facadeWestWing.alt,
    displayOrder: 3,
    isPublished: true,
    isPlaceholder: false,
    createdAt: "2026-11-03T09:00:00.000Z",
    updatedAt: "2026-11-03T09:00:00.000Z",
  },
  {
    id: "milestone-changing-era",
    category: "A Changing Era",
    periodLabel: null,
    verified: false,
    title: "Illumination Nights & Homecoming Gatherings",
    description:
      "Even as generations changed, the red-brick facade and iron railings remained an anchor of identity. Festival illuminations, farewell ceremonies, and alumni homecomings brought former residents back through the arched gateway.",
    importantDevelopment:
      "Organised alumni reunions and collective efforts to document the photographic and oral history of the house.",
    imageUrl: images.illuminated.src,
    imageAlt: images.illuminated.alt,
    displayOrder: 4,
    isPublished: true,
    isPlaceholder: false,
    createdAt: "2026-11-04T09:00:00.000Z",
    updatedAt: "2026-11-04T09:00:00.000Z",
  },
  {
    id: "milestone-today-beyond",
    category: "Today & Beyond",
    periodLabel: "Present Era",
    verified: true,
    title: "The Newton House Alumni Association & Digital Heritage Platform",
    description:
      "Today, the Newton House Alumni Association unites past and present generations through a verified directory, batch cohorts, a digital heritage archive, structured student mentorship, and annual gatherings.",
    importantDevelopment:
      "Launch of the digital heritage archive, batch directory, and mentorship network connecting alumni with current residents.",
    imageUrl: images.alumniGathering.src,
    imageAlt: images.alumniGathering.alt,
    displayOrder: 5,
    isPublished: true,
    isPlaceholder: false,
    createdAt: "2026-11-05T09:00:00.000Z",
    updatedAt: "2026-11-05T09:00:00.000Z",
  },
];

/**
 * Initial Superintendent Records.
 * Important Data Integrity Rule: Never invent names, photographs, biographies, titles, or tenure dates.
 * These entries are clearly marked `isPlaceholder: true` until verified records are entered by
 * an authorised administrator in `/admin/about`.
 */
export const initialSuperintendents: SuperintendentRecord[] = [
  {
    id: "supt-current-placeholder",
    fullName: "Current Superintendent (Official Profile Pending Verification)",
    designation: "Current Superintendent, Newton House",
    profileImage: null,
    tenureStart: null,
    tenureEnd: "Present",
    tenurePeriodLabel: "Current Tenure · Official Appointment Date Pending Verification",
    isCurrent: true,
    biography:
      "This featured leadership slot is reserved for the serving Superintendent of Newton House, Patna Science College. In keeping with our data-integrity commitment, no name, photograph, or biography is fabricated prior to official verification.",
    academicBackground:
      "Faculty Member, Patna Science College, Patna University (Department & academic credentials published upon official confirmation).",
    contributions:
      "Oversees residential life, academic discipline, student welfare, and institutional coordination between Newton House residents, college administration, and the Alumni Association.",
    personalMessage:
      "An official message from the Current Superintendent to residents and alumni will appear here once verified via the Administration Dashboard.",
    displayOrder: 1,
    isPublished: true,
    isPlaceholder: true,
    createdAt: "2026-11-10T09:00:00.000Z",
    updatedAt: "2026-11-10T09:00:00.000Z",
  },
  {
    id: "supt-former-1",
    fullName: "Former Superintendent — Recent Generations Roster (Verification Pending)",
    designation: "Former Superintendent, Newton House",
    profileImage: null,
    tenureStart: null,
    tenureEnd: null,
    tenurePeriodLabel: "Recent Generations · Tenure Dates Awaiting Archival Verification",
    isCurrent: false,
    biography:
      "Placeholder record representing former faculty superintendents who guided Newton House in recent decades. Alumni and administrators may submit verified names, service periods, and photographs for archival publication.",
    academicBackground: "Faculty of Science, Patna Science College (Archival record pending)",
    contributions:
      "Guided hostel administration, academic discipline, and student mentorship across recent graduating cohorts.",
    personalMessage: null,
    displayOrder: 2,
    isPublished: true,
    isPlaceholder: true,
    createdAt: "2026-11-09T09:00:00.000Z",
    updatedAt: "2026-11-09T09:00:00.000Z",
  },
  {
    id: "supt-former-2",
    fullName: "Former Superintendent — Middle Generations Roster (Verification Pending)",
    designation: "Former Superintendent, Newton House",
    profileImage: null,
    tenureStart: null,
    tenureEnd: null,
    tenurePeriodLabel: "Middle Generations · Tenure Dates Awaiting Archival Verification",
    isCurrent: false,
    biography:
      "Placeholder record honouring the educators who stewarded Newton House through its middle decades, fostering its reputation for academic excellence and brotherhood.",
    academicBackground: "Faculty of Science, Patna Science College (Archival record pending)",
    contributions:
      "Sustained hostel traditions, library and study culture, and annual cultural celebrations.",
    personalMessage: null,
    displayOrder: 3,
    isPublished: true,
    isPlaceholder: true,
    createdAt: "2026-11-08T09:00:00.000Z",
    updatedAt: "2026-11-08T09:00:00.000Z",
  },
  {
    id: "supt-former-3",
    fullName: "Former Superintendent — Founding & Early Era Roster (Verification Pending)",
    designation: "Former Superintendent, Newton House",
    profileImage: null,
    tenureStart: null,
    tenureEnd: null,
    tenurePeriodLabel: "Early Years · Tenure Dates Awaiting Archival Verification",
    isCurrent: false,
    biography:
      "Placeholder record dedicated to the earliest superintendents of Newton House whose stewardship established the foundational ethos of the hostel at Patna Science College.",
    academicBackground: "Faculty of Science, Patna Science College (Archival record pending)",
    contributions:
      "Laid the institutional foundations of residential discipline, scholarly community, and mutual support.",
    personalMessage: null,
    displayOrder: 4,
    isPublished: true,
    isPlaceholder: true,
    createdAt: "2026-11-07T09:00:00.000Z",
    updatedAt: "2026-11-07T09:00:00.000Z",
  },
];

/**
 * Initial Approved Testimonials (Voices of Newton House).
 * Clearly marked `isSample: true` to distinguish demonstration reflections
 * from verified member submissions.
 */
export const initialTestimonials: AlumniTestimonial[] = [
  {
    id: "test-1",
    alumniName: "Aarav Sinha (Sample Alumnus)",
    batchYear: "Class of 2012",
    department: "Physics",
    designation: "Research Fellow, National Research Institute",
    photoUrl: null,
    quote:
      "Newton House gave us more than a room near the laboratories — it gave us seniors who lent us their books on day one and friends who still feel like brothers years after graduation.",
    status: "approved",
    isPublished: true,
    isSample: true,
    submittedBy: "sample1@example.invalid",
    submittedAt: "2026-11-12T09:00:00.000Z",
    reviewedBy: "admin@newtonhouse.org",
    reviewedAt: "2026-11-12T10:00:00.000Z",
  },
  {
    id: "test-2",
    alumniName: "Prashant Verma (Sample Alumnus)",
    batchYear: "Class of 2010",
    department: "Mathematics",
    designation: "Joint Director, Public Administration",
    photoUrl: null,
    quote:
      "The discipline of morning lectures and the quiet solidarity of evening study hours inside those red-brick walls prepared me for every examination and public responsibility that followed.",
    status: "approved",
    isPublished: true,
    isSample: true,
    submittedBy: "sample2@example.invalid",
    submittedAt: "2026-11-13T09:00:00.000Z",
    reviewedBy: "admin@newtonhouse.org",
    reviewedAt: "2026-11-13T10:00:00.000Z",
  },
  {
    id: "test-3",
    alumniName: "Raghavendra Mishra (Sample Alumnus)",
    batchYear: "Class of 2015",
    department: "Chemistry",
    designation: "Principal Scientist",
    photoUrl: null,
    quote:
      "Whenever you walk back through the arched entrance of Newton House on an illumination night, time folds in on itself — you are immediately home again.",
    status: "approved",
    isPublished: true,
    isSample: true,
    submittedBy: "sample3@example.invalid",
    submittedAt: "2026-11-14T09:00:00.000Z",
    reviewedBy: "admin@newtonhouse.org",
    reviewedAt: "2026-11-14T10:00:00.000Z",
  },
];

/**
 * Initial Association Leadership records.
 * Empty by default until official office-bearers are confirmed by the committee
 * in `/admin/about` — never fabricates office-bearer identities.
 */
export const initialAssociationLeaders: AssociationLeader[] = [];
