import { z } from "zod";
import { departments, professions } from "@/data/alumni";

const currentYear = new Date().getFullYear();

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Please keep this under ${max} characters.`)
    .transform((v) => (v.length ? v : null))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const email = z.string().trim().toLowerCase().pipe(z.email("Please enter a valid email address."));

const linkedin = z
  .string()
  .trim()
  .transform((v) => (v.length ? v : null))
  .nullable()
  .optional()
  .transform((v) => v ?? null)
  .refine(
    (v) => v === null || /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/(in|pub)\/[A-Za-z0-9\-_%]+\/?$/.test(v),
    "Use your public LinkedIn profile URL, e.g. https://www.linkedin.com/in/your-name",
  );

const gradYear = z.coerce
  .number({ error: "Enter your graduation year." })
  .int("Enter a four-digit year.")
  .min(1920, "Enter a year after 1920.")
  .max(currentYear + 6, `Enter a year up to ${currentYear + 6}.`);

export const departmentSchema = z.enum(departments as [string, ...string[]], {
  error: "Choose your department.",
});
export const professionSchema = z.enum(professions as [string, ...string[]]).nullable();
export const visibilitySchema = z.enum(["public", "members", "private"], { error: "Choose a visibility option." });

const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal(""), z.null(), z.undefined()])
  .optional()
  .transform((v) => v === "on" || v === "true");

/* ---------------- Alumni registration ---------------- */
export const registrationSchema = z
  .object({
    fullName: z.string().trim().min(3, "Enter your full name.").max(100),
    email,
    password: z.string().min(8, "Use at least 8 characters.").max(72).optional(),
    graduationYear: gradYear,
    department: departmentSchema,
    organisation: optionalText(120),
    designation: optionalText(120),
    city: optionalText(80),
    profession: z
      .string()
      .optional()
      .transform((v) => (v && v.length ? v : null))
      .pipe(professionSchema),
    linkedinUrl: linkedin,
    bio: optionalText(600),
    visibility: visibilitySchema,
    showEmail: checkbox,
    consent: checkbox.refine((v) => v, "Please confirm that the information is accurate and may be reviewed."),
  });

export type RegistrationValues = z.infer<typeof registrationSchema>;

/* ---------------- Profile update (portal) ---------------- */
export const profileSchema = z.object({
  designation: optionalText(120),
  organisation: optionalText(120),
  city: optionalText(80),
  country: optionalText(80),
  profession: z
    .string()
    .optional()
    .transform((v) => (v && v.length ? v : null))
    .pipe(professionSchema),
  linkedinUrl: linkedin,
  bio: optionalText(600),
  visibility: visibilitySchema,
  showEmail: checkbox,
});

/* ---------------- Contact ---------------- */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email,
  subject: z.string().trim().min(3, "Choose or enter a subject.").max(140),
  message: z.string().trim().min(20, "Please write at least 20 characters.").max(4000),
  website: z.string().max(0).optional(), // honeypot
});

/* ---------------- Newsletter ---------------- */
export const newsletterSchema = z.object({ email, website: z.string().max(0).optional() });

/* ---------------- Event registration ---------------- */
export const eventRegistrationSchema = z.object({
  eventId: z.string().min(1),
  fullName: z.string().trim().min(3, "Enter your full name.").max(100),
  email,
  graduationYear: z
    .string()
    .optional()
    .transform((v) => (v && v.length ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1920 && v <= currentYear + 6), "Enter a valid year."),
  guests: z.coerce.number().int().min(0, "Cannot be negative.").max(5, "Up to 5 guests per registration."),
  note: optionalText(500),
});

/* ---------------- Auth ---------------- */
export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

/* ---------------- Admin: events ---------------- */
export const eventSchema = z.object({
  title: z.string().trim().min(3, "Enter a title.").max(140),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only."),
  category: z.enum(["reunion", "networking", "lecture", "gathering", "cultural"]),
  startsAt: z.string().min(1, "Choose a start date and time."),
  endsAt: z.string().optional().transform((v) => (v && v.length ? v : null)),
  venue: z.string().trim().min(2, "Enter the venue.").max(160),
  city: z.string().trim().min(2, "Enter the city.").max(80),
  summary: z.string().trim().min(10, "Write a short summary.").max(280),
  body: z.string().trim().max(8000).optional().default(""),
  imageUrl: optionalText(500),
  capacity: z
    .string()
    .optional()
    .transform((v) => (v && v.length ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v > 0), "Capacity must be a positive whole number."),
  registrationOpen: checkbox,
  published: checkbox,
  isDemo: checkbox,
});

/* ---------------- Admin: achievements ---------------- */
export const achievementSchema = z.object({
  name: z.string().trim().min(3).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only."),
  designation: z.string().trim().min(2).max(140),
  organisation: z.string().trim().min(2).max(140),
  category: z.enum([
    "academics-research",
    "government-public-service",
    "science-technology",
    "corporate-leadership",
    "entrepreneurship",
    "other",
  ]),
  summary: z.string().trim().min(10).max(280),
  biography: z.string().trim().max(8000).optional().default(""),
  portraitUrl: optionalText(500),
  graduationYear: z
    .string()
    .optional()
    .transform((v) => (v && v.length ? Number(v) : null)),
  verified: checkbox,
  published: checkbox,
  isSample: checkbox,
});

/* ---------------- Admin: gallery & announcements ---------------- */
export const galleryItemSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(120),
  caption: z.string().trim().max(280).optional().default(""),
  alt: z.string().trim().min(8, "Describe the photograph for screen-reader users.").max(240),
  categorySlug: z.string().min(1, "Choose a category."),
  imageUrl: z.string().trim().optional().default(""),
  width: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().positive().default(1200)),
  height: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().positive().default(800)),
  year: optionalText(20),
  published: checkbox,
});

export const announcementSchema = z.object({
  title: z.string().trim().min(3, "Enter a title.").max(160),
  body: z.string().trim().min(10, "Write the announcement.").max(4000),
  published: checkbox,
});

/** Convert FormData into a plain object (last value wins). */
export function formToObject(fd: FormData) {
  const obj: Record<string, string> = {};
  fd.forEach((v, k) => {
    if (typeof v === "string") obj[k] = v;
  });
  return obj;
}

export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}
