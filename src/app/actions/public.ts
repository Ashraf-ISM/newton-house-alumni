"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { createAchievementSubmission } from "@/lib/data/content";
import { createRegistration, getEventById } from "@/lib/data/events";
import { createContactMessage, subscribe } from "@/lib/data/inbox";
import { fileFrom, storeImage, validateImageFile } from "@/lib/storage";
import { hasServiceRole, isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/server";
import {
  achievementSubmissionSchema,
  contactSchema,
  eventRegistrationSchema,
  fieldErrors,
  formToObject,
  newsletterSchema,
} from "@/lib/validations";
import type { ActionResult, Department } from "@/types";

const demo = () => !isSupabaseConfigured();

export async function subscribeNewsletter(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, message: "Please enter a valid email address.", fieldErrors: fieldErrors(parsed.error) };
  try {
    const added = await subscribe(parsed.data.email);
    revalidatePath("/admin/subscribers");
    return {
      ok: true,
      demo: demo(),
      message: added ? "Thank you — you're on the list." : "You're already subscribed. Thank you!",
    };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "We couldn't subscribe you just now. Please try again." };
  }
}

export async function sendContactMessage(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(formToObject(fd));
  if (!parsed.success) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  const { website: _hp, ...msg } = parsed.data;
  void _hp;
  try {
    await createContactMessage(msg);
    revalidatePath("/admin");
    return {
      ok: true,
      demo: demo(),
      message: "Your message has been received. A member of the Association will reply by email.",
    };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "We couldn't send your message. Please try again shortly." };
  }
}

export async function registerForEvent(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const parsed = eventRegistrationSchema.safeParse(formToObject(fd));
  if (!parsed.success) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  const event = await getEventById(parsed.data.eventId);
  if (!event || !event.published) return { ok: false, message: "This event could not be found." };
  if (!event.registrationOpen) return { ok: false, message: "Registration for this event is closed." };
  if (new Date(event.startsAt).getTime() < Date.now()) return { ok: false, message: "This event has already taken place." };

  try {
    const viewer = await getViewer();
    await createRegistration(
      {
        eventId: event.id,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        graduationYear: parsed.data.graduationYear,
        guests: parsed.data.guests,
        note: parsed.data.note,
      },
      viewer.demo ? null : viewer.userId,
    );
    revalidatePath("/admin/events");
    return {
      ok: true,
      demo: demo(),
      message: `You're registered for ${event.title}. We'll be in touch at ${parsed.data.email} with final details.`,
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Registration failed. Please try again." };
  }
}

export async function submitAchievementNomination(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const parsed = achievementSubmissionSchema.safeParse(formToObject(fd));
  const portrait = fileFrom(fd, "portrait");
  const portraitErr = validateImageFile(portrait);
  const errors = parsed.success ? {} : fieldErrors(parsed.error);
  if (portraitErr) errors.portrait = [portraitErr];
  if (!parsed.success || Object.keys(errors).length) {
    return { ok: false, message: "Please review and complete the highlighted fields.", fieldErrors: errors };
  }

  const v = parsed.data;
  try {
    let portraitUrl: string | null = null;
    if (portrait) {
      const client = hasServiceRole() ? createAdminClient() : undefined;
      if (!isSupabaseConfigured() || client) {
        portraitUrl = (await storeImage(portrait, { bucket: "gallery", folder: "portraits", maxSize: 900, client })).url;
      }
    }

    const paragraphs = v.biography
      ? v.biography
          .split(/\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean)
      : [v.summary];

    await createAchievementSubmission({
      name: v.name,
      designation: v.designation,
      organisation: v.organisation,
      category: v.category,
      summary: v.summary,
      biography: paragraphs,
      portraitUrl,
      graduationYear: v.graduationYear,
      department: (v.department as Department | null) ?? null,
    });

    // Also record a notification in the Association inbox with submitter contact details
    await createContactMessage({
      name: v.name,
      email: v.submitterEmail,
      subject: `Achievement submission — ${v.name}`,
      message: `${v.designation} at ${v.organisation}${v.graduationYear ? ` (Class of ${v.graduationYear})` : ""}.\n\nCitation: ${v.summary}${v.biography ? `\n\nBiography:\n${v.biography}` : ""}`,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/achievements");
    revalidatePath("/admin/messages");

    return {
      ok: true,
      demo: demo(),
      message: `Thank you. The achievement submission for ${v.name} has been queued for verification by the Association and will appear in the directory once approved.`,
    };
  } catch (e) {
    console.error("[achievements] submitAchievementNomination", e);
    return { ok: false, message: "We couldn't submit your achievement right now. Please try again shortly." };
  }
}
