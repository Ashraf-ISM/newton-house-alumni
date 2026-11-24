"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { demoCreateRegistration, updateProfile } from "@/lib/data/alumni";
import { fileFrom, storeImage, validateImageFile } from "@/lib/storage";
import { hasServiceRole, isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/utils";
import { fieldErrors, formToObject, profileSchema, registrationSchema, signInSchema } from "@/lib/validations";
import type { ActionResult, Department, Profession } from "@/types";

/* ------------------------------------------------------------------
   Alumni registration (/join)
   ------------------------------------------------------------------ */
export async function registerAlumni(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const parsed = registrationSchema.safeParse(formToObject(fd));
  const photo = fileFrom(fd, "photo");
  const photoError = validateImageFile(photo);

  const errors = parsed.success ? {} : fieldErrors(parsed.error);
  if (photoError) errors.photo = [photoError];
  if (isSupabaseConfigured() && parsed.success && !parsed.data.password) {
    errors.password = ["Create a password (at least 8 characters)."];
  }
  if (!parsed.success || Object.keys(errors).length) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: errors };
  }
  const v = parsed.data;

  /* ---------- Demo mode ---------- */
  if (!isSupabaseConfigured()) {
    try {
      let photoUrl: string | null = null;
      if (photo) photoUrl = (await storeImage(photo, { bucket: "avatars", folder: "demo", maxSize: 640 })).url;
      demoCreateRegistration({
        fullName: v.fullName,
        email: v.email,
        graduationYear: v.graduationYear,
        department: v.department as Department,
        organisation: v.organisation,
        designation: v.designation,
        city: v.city,
        profession: v.profession as Profession | null,
        linkedinUrl: v.linkedinUrl,
        bio: v.bio,
        visibility: v.visibility,
        showEmail: v.showEmail,
        photoUrl,
      });
      revalidatePath("/admin");
      revalidatePath("/admin/alumni");
      return {
        ok: true,
        demo: true,
        message:
          "Registration received. In demo mode no verification email is sent — your entry now awaits approval in the admin dashboard.",
      };
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "Registration failed." };
    }
  }

  /* ---------- Supabase ---------- */
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: v.email,
    password: v.password!,
    options: {
      emailRedirectTo: absoluteUrl("/auth/callback?next=/portal"),
      // Picked up by the `handle_new_user` trigger, which creates the
      // pending alumni + profile rows (see supabase/migrations).
      data: {
        full_name: v.fullName,
        graduation_year: v.graduationYear,
        department: v.department,
        organisation: v.organisation,
        designation: v.designation,
        city: v.city,
        profession: v.profession,
        linkedin_url: v.linkedinUrl,
        bio: v.bio,
        visibility: v.visibility,
        show_email: v.showEmail,
      },
    },
  });

  if (error) {
    const msg = /registered|exists/i.test(error.message)
      ? "An account with this email already exists. Please sign in instead."
      : error.message;
    return { ok: false, message: msg };
  }

  let photoNote = "";
  if (photo && data.user) {
    if (hasServiceRole()) {
      try {
        const admin = createAdminClient();
        const { url } = await storeImage(photo, { bucket: "avatars", folder: data.user.id, maxSize: 640, client: admin });
        const { data: alum } = await admin.from("alumni").select("id").eq("user_id", data.user.id).maybeSingle();
        if (alum) await admin.from("alumni_profiles").update({ photo_url: url }).eq("alumni_id", alum.id);
      } catch (e) {
        console.error("[join] photo upload", e);
        photoNote = " Your photograph could not be uploaded — you can add it from the member portal.";
      }
    } else {
      photoNote = " You can add your photograph from the member portal after verifying your email.";
    }
  }

  return {
    ok: true,
    message: `Almost there — we've sent a verification link to ${v.email}. Once verified, the Association will review and approve your profile.${photoNote}`,
  };
}

/* ------------------------------------------------------------------
   Sign in / out
   ------------------------------------------------------------------ */
export async function signIn(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Authentication is unavailable in demo mode. Open the Member Portal directly to preview it." };
  }
  const parsed = signInSchema.safeParse(formToObject(fd));
  if (!parsed.success) return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      ok: false,
      message: /confirm/i.test(error.message)
        ? "Please verify your email address first — check your inbox for the link."
        : "Incorrect email or password.",
    };
  }
  const next = String(fd.get("next") ?? "/portal");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/portal");
}

export async function sendPasswordReset(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Password reset is unavailable in demo mode." };
  const email = String(fd.get("email") ?? "").trim();
  if (!email) return { ok: false, message: "Enter your email address first.", fieldErrors: { email: ["Enter your email address."] } };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: absoluteUrl("/auth/callback?next=/portal/password") });
  // Always respond the same way so the form cannot be used to discover accounts.
  return { ok: true, message: "If an account exists for that address, a reset link is on its way." };
}

export async function updatePassword(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Unavailable in demo mode." };
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { ok: false, message: "Use at least 8 characters.", fieldErrors: { password: ["Use at least 8 characters."] } };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Your password has been updated." };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

/* ------------------------------------------------------------------
   Portal — manage own profile
   ------------------------------------------------------------------ */
export async function updateMyProfile(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || !viewer.alumni) return { ok: false, message: "Please sign in to edit your profile." };

  const parsed = profileSchema.safeParse(formToObject(fd));
  const photo = fileFrom(fd, "photo");
  const photoError = validateImageFile(photo);
  const errors = parsed.success ? {} : fieldErrors(parsed.error);
  if (photoError) errors.photo = [photoError];
  if (!parsed.success || Object.keys(errors).length) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: errors };
  }

  try {
    let photoUrl: string | undefined;
    if (photo) {
      const client = isSupabaseConfigured() ? await createClient() : undefined;
      photoUrl = (await storeImage(photo, { bucket: "avatars", folder: viewer.userId, maxSize: 640, client })).url;
    }
    if (fd.get("removePhoto") === "on") photoUrl = undefined;
    await updateProfile(viewer.alumni.id, {
      ...parsed.data,
      profession: parsed.data.profession as Profession | null,
      ...(fd.get("removePhoto") === "on" ? { photoUrl: null } : photoUrl ? { photoUrl } : {}),
    });
    revalidatePath("/portal");
    revalidatePath("/alumni");
    revalidatePath(`/alumni/${viewer.alumni.slug}`);
    return { ok: true, demo: viewer.demo, message: "Your profile has been saved." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save your profile." };
  }
}
