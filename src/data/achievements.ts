import type { Achievement, AchievementCategory } from "@/types";

export const achievementCategories: { slug: AchievementCategory; name: string; description: string }[] = [
  { slug: "academics-research", name: "Academics & Research", description: "Scholarship, discovery and teaching" },
  { slug: "government-public-service", name: "Government & Public Service", description: "Service to the nation and society" },
  { slug: "science-technology", name: "Science & Technology", description: "Building and applying science" },
  { slug: "corporate-leadership", name: "Corporate Leadership", description: "Leading organisations and teams" },
  { slug: "entrepreneurship", name: "Entrepreneurship", description: "Founding ventures and creating value" },
  { slug: "other", name: "Other Professional Achievements", description: "Medicine, law, arts and beyond" },
];

export function categoryName(slug: AchievementCategory) {
  return achievementCategories.find((c) => c.slug === slug)?.name ?? slug;
}

/**
 * SAMPLE ACHIEVEMENT PROFILES — DEMONSTRATION ONLY.
 * No real person, honour or affiliation is represented here. Each entry
 * illustrates how a verified achievement will be presented once the
 * Association publishes it through the admin dashboard.
 */
export const sampleAchievements: Achievement[] = achievementCategories.map((c, i) => ({
  id: `sample-achievement-${i + 1}`,
  slug: `sample-${c.slug}`,
  name: `Sample Profile — ${c.name}`,
  designation: "Designation appears here",
  organisation: "Organisation appears here",
  category: c.slug,
  summary: `A placeholder showing how a verified ${c.name.toLowerCase()} achievement will be presented: a concise one-line citation.`,
  biography: [
    "This is a demonstration profile. It does not describe a real person, award or affiliation.",
    "When a Newton House alumnus is nominated, the Association verifies the details with the member before publishing. The published profile carries a portrait, the member's current role, a short citation and a fuller biography written or approved by the member.",
    "To nominate an alumnus, or to submit your own achievement for verification, use the contact form and choose “Achievement nomination”.",
  ],
  portraitUrl: null,
  graduationYear: null,
  department: null,
  verified: false,
  isSample: true,
  published: true,
}));
