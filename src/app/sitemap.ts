import type { MetadataRoute } from "next";
import { listDirectory } from "@/lib/data/alumni";
import { listBatchesWithMembers, listStories } from "@/lib/data/community";
import { listAchievements } from "@/lib/data/content";
import { listEvents } from "@/lib/data/events";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    "/",
    "/about",
    "/legacy",
    "/alumni",
    "/alumni/batches",
    "/alumni/stories",
    "/archive",
    "/mentorship",
    "/achievements",
    "/memories",
    "/events",
    "/join",
    "/contact",
  ].map((p) => ({
    url: absoluteUrl(p),
    lastModified: now,
    changeFrequency: p === "/" || p === "/events" ? ("weekly" as const) : ("monthly" as const),
    priority: p === "/" ? 1 : 0.7,
  }));

  // Sample / demonstration records are excluded so they are never indexed as real.
  const [alumni, achievements, events, batches] = await Promise.all([
    listDirectory({ viewerIsMember: false }),
    listAchievements(),
    listEvents(),
    listBatchesWithMembers({ viewerIsMember: false }),
  ]);
  const stories = listStories();
  return [
    ...staticRoutes,
    ...alumni.filter((a) => !a.isSample).map((a) => ({ url: absoluteUrl(`/alumni/${a.slug}`), lastModified: now, priority: 0.5 })),
    ...batches.filter((b) => !b.isSample).map((b) => ({ url: absoluteUrl(`/alumni/batches/${b.slug}`), lastModified: now, priority: 0.55 })),
    ...stories.filter((s) => !s.isSample).map((s) => ({ url: absoluteUrl(`/alumni/stories/${s.slug}`), lastModified: now, priority: 0.6 })),
    ...achievements.filter((a) => !a.isSample).map((a) => ({ url: absoluteUrl(`/achievements/${a.slug}`), lastModified: now, priority: 0.6 })),
    ...events.filter((e) => !e.isDemo).map((e) => ({ url: absoluteUrl(`/events/${e.slug}`), lastModified: now, priority: 0.6 })),
  ];
}
