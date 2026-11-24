import { getEvent } from "@/lib/data/events";
import { absoluteUrl } from "@/lib/utils";

/** Downloadable iCalendar (.ics) file for an event. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEvent(slug);
  if (!e) return new Response("Not found", { status: 404 });

  const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = e.endsAt ?? new Date(new Date(e.startsAt).getTime() + 2 * 3600_000).toISOString();
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Newton House Alumni Association//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}@newton-house`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(e.startsAt)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(`${e.summary}\n\n${absoluteUrl(`/events/${e.slug}`)}`)}`,
    `LOCATION:${esc(`${e.venue}, ${e.city}`)}`,
    `URL:${absoluteUrl(`/events/${e.slug}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.slug}.ics"`,
    },
  });
}
