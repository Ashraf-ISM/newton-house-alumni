import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, createPublicClient } from "@/lib/supabase/server";
import { uid } from "@/lib/utils";
import type { EventCategory, EventRegistration, NHEvent } from "@/types";
import { store } from "./store";

type EventRow = {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  starts_at: string;
  ends_at: string | null;
  venue: string;
  city: string;
  summary: string;
  body: string | null;
  image_url: string | null;
  registration_open: boolean;
  capacity: number | null;
  is_demo: boolean;
  published: boolean;
  gallery: string[] | null;
};

const splitBody = (b: string | null) => (b ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

function fromRow(r: EventRow): NHEvent {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    venue: r.venue,
    city: r.city,
    summary: r.summary,
    body: splitBody(r.body),
    imageUrl: r.image_url,
    registrationOpen: r.registration_open,
    capacity: r.capacity,
    isDemo: r.is_demo,
    published: r.published,
    gallery: r.gallery ?? [],
  };
}

function toRow(e: Omit<NHEvent, "id">) {
  return {
    slug: e.slug,
    title: e.title,
    category: e.category,
    starts_at: e.startsAt,
    ends_at: e.endsAt,
    venue: e.venue,
    city: e.city,
    summary: e.summary,
    body: e.body.join("\n\n"),
    image_url: e.imageUrl,
    registration_open: e.registrationOpen,
    capacity: e.capacity,
    is_demo: e.isDemo,
    published: e.published,
    gallery: e.gallery,
  };
}

export async function listEvents(opts: { includeUnpublished?: boolean } = {}): Promise<NHEvent[]> {
  if (isSupabaseConfigured()) {
    const supabase = opts.includeUnpublished ? await createClient() : createPublicClient();
    let q = supabase.from("events").select("*").order("starts_at", { ascending: true });
    if (!opts.includeUnpublished) q = q.eq("published", true);
    const { data, error } = await q;
    if (error) {
      console.error("[events] list", error.message);
      return [];
    }
    return (data as EventRow[]).map(fromRow);
  }
  return store()
    .events.filter((e) => opts.includeUnpublished || e.published)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function splitEvents(now = new Date()) {
  const all = await listEvents();
  const t = now.getTime();
  return {
    upcoming: all.filter((e) => new Date(e.startsAt).getTime() >= t),
    past: all.filter((e) => new Date(e.startsAt).getTime() < t).reverse(),
  };
}

export async function getEvent(slug: string, opts: { includeUnpublished?: boolean } = {}) {
  const all = await listEvents(opts);
  return all.find((e) => e.slug === slug) ?? null;
}

export async function getEventById(id: string) {
  const all = await listEvents({ includeUnpublished: true });
  return all.find((e) => e.id === id) ?? null;
}

export async function upsertEvent(id: string | null, e: Omit<NHEvent, "id">) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const row: Partial<ReturnType<typeof toRow>> = toRow(e);
    // Preserve an existing gallery when the editor didn't supply one.
    if (id && e.gallery.length === 0) delete row.gallery;
    const { error } = id
      ? await supabase.from("events").update(row).eq("id", id)
      : await supabase.from("events").insert(row);
    if (error) throw new Error(error.message);
    return;
  }
  const s = store();
  if (s.events.some((x) => x.slug === e.slug && x.id !== id)) throw new Error("Another event already uses this URL slug.");
  if (id) {
    const existing = s.events.find((x) => x.id === id);
    if (!existing) throw new Error("Event not found.");
    Object.assign(existing, { ...e, gallery: e.gallery.length ? e.gallery : existing.gallery });
  } else {
    s.events.push({ ...e, id: uid() });
  }
}

export async function deleteEvent(id: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const s = store();
  s.events = s.events.filter((e) => e.id !== id);
  s.registrations = s.registrations.filter((r) => r.eventId !== id);
}

/* ---------------- Registrations ---------------- */

export async function createRegistration(r: Omit<EventRegistration, "id" | "createdAt">, userId: string | null) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("event_registrations").insert({
      event_id: r.eventId,
      user_id: userId,
      full_name: r.fullName,
      email: r.email,
      graduation_year: r.graduationYear,
      guests: r.guests,
      note: r.note,
    });
    if (error) {
      if (error.code === "23505") throw new Error("This email is already registered for the event.");
      throw new Error(error.message);
    }
    return;
  }
  const s = store();
  if (s.registrations.some((x) => x.eventId === r.eventId && x.email.toLowerCase() === r.email.toLowerCase())) {
    throw new Error("This email is already registered for the event.");
  }
  s.registrations.push({ ...r, id: uid(), createdAt: new Date().toISOString() });
}

export async function listRegistrations(eventId?: string): Promise<EventRegistration[]> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    let q = supabase.from("event_registrations").select("*").order("created_at", { ascending: false });
    if (eventId) q = q.eq("event_id", eventId);
    const { data, error } = await q;
    if (error) {
      console.error("[events] registrations", error.message);
      return [];
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      eventId: r.event_id,
      fullName: r.full_name,
      email: r.email,
      graduationYear: r.graduation_year,
      guests: r.guests,
      note: r.note,
      createdAt: r.created_at,
    }));
  }
  return store().registrations.filter((r) => !eventId || r.eventId === eventId);
}
