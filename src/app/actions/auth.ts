"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { demoCreateRegistration, getMyAlumniRecord, updateProfile } from "@/lib/data/alumni";
import { DEMO_ADMIN_USER_ID, DEMO_MEMBER_USER_ID, store } from "@/lib/data/store";
import { createSessionToken, hashPassword, SESSION_COOKIE, verifyPassword } from "@/lib/session";
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
  if (parsed.success && (!parsed.data.password || parsed.data.password.length < 8)) {
    errors.password = ["Create a password (at least 8 characters)."];
  }
  if (!parsed.success || Object.keys(errors).length) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: errors };
  }
  const v = parsed.data;

  /* ---------- Built-in local auth store ---------- */
  if (!isSupabaseConfigured()) {
    try {
      let photoUrl: string | null = null;
      if (photo) photoUrl = (await storeImage(photo, { bucket: "avatars", folder: "demo", maxSize: 640 })).url;
      const passwordHash = await hashPassword(v.password!);
      demoCreateRegistration({
        fullName: v.fullName,
        email: v.email,
        passwordHash,
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
          "Your registration has been submitted and is awaiting administrator approval. Once an administrator verifies and approves your membership, you can sign in with your email and password.",
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
        photoNote = " Your photograph could not be uploaded — you can add it from the member portal after approval.";
      }
    } else {
      photoNote = " You can add your photograph from the member portal after your account is approved.";
    }
  }

  // Ensure unapproved sign-ups are not left signed in
  await supabase.auth.signOut();

  return {
    ok: true,
    message: `Registration received for ${v.email}. Please verify your email link — once an administrator approves your registration, you will be able to sign in.${photoNote}`,
  };
}

/* ------------------------------------------------------------------
   Sign in / out (Authorised accounts only)
   ------------------------------------------------------------------ */
export async function signIn(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(formToObject(fd));
  if (!parsed.success) {
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  }
  const { email, password } = parsed.data;
  const rawNext = String(fd.get("next") ?? "");

  /* ---------- 1. Check built-in authorised accounts & local registrations ---------- */
  const s = store();
  const localUser = s.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (localUser) {
    let passwordValid = false;
    if (localUser.id === DEMO_ADMIN_USER_ID && process.env.ADMIN_PASSWORD) {
      passwordValid = password === process.env.ADMIN_PASSWORD;
    } else if (localUser.id === DEMO_MEMBER_USER_ID && process.env.MEMBER_PASSWORD) {
      passwordValid = password === process.env.MEMBER_PASSWORD;
    } else {
      passwordValid = await verifyPassword(password, localUser.passwordHash);
    }

    if (!passwordValid) {
      return { ok: false, message: "Incorrect email or password." };
    }

    const alumni =
      (localUser.alumniId ? s.alumni.find((a) => a.id === localUser.alumniId) : null) ??
      s.alumni.find((a) => a.userId === localUser.id || a.email.toLowerCase() === localUser.email.toLowerCase()) ??
      null;

    if (!localUser.role) {
      if (!alumni || alumni.status === "pending") {
        return {
          ok: false,
          message:
            "Your alumni registration is awaiting verification and approval by an administrator. You will be able to sign in once your membership is approved.",
        };
      }
      if (alumni.status === "rejected") {
        return {
          ok: false,
          message:
            "Your registration could not be verified by the Association. Please contact us if you believe this is an error.",
        };
      }
    }

    const token = await createSessionToken({
      userId: localUser.id,
      email: localUser.email,
      role: localUser.role,
      alumniId: alumni?.id ?? null,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    revalidatePath("/", "layout");
    const defaultDest = localUser.role ? "/admin" : "/portal";
    const dest = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : defaultDest;
    redirect(dest);
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Incorrect email or password." };
  }

  /* ---------- Supabase ---------- */
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return {
      ok: false,
      message: /confirm/i.test(error?.message ?? "")
        ? "Please verify your email address first — check your inbox for the verification link."
        : "Incorrect email or password.",
    };
  }

  const [{ data: adminRow }, alumni] = await Promise.all([
    supabase.from("admin_users").select("role").eq("user_id", data.user.id).maybeSingle(),
    getMyAlumniRecord(data.user.id),
  ]);

  const role = adminRow?.role ?? null;
  if (!role) {
    if (!alumni || alumni.status === "pending") {
      await supabase.auth.signOut();
      return {
        ok: false,
        message:
          "Your alumni registration is awaiting verification and approval by an administrator. You will be able to sign in once your membership is approved.",
      };
    }
    if (alumni.status === "rejected") {
      await supabase.auth.signOut();
      return {
        ok: false,
        message:
          "Your registration could not be verified by the Association. Please contact us if you believe this is an error.",
      };
    }
  }

  revalidatePath("/", "layout");
  const defaultDest = role ? "/admin" : "/portal";
  const dest = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : defaultDest;
  redirect(dest);
}

export async function sendPasswordReset(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const email = String(fd.get("email") ?? "").trim();
  if (!email) {
    return { ok: false, message: "Enter your email address first.", fieldErrors: { email: ["Enter your email address."] } };
  }
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: absoluteUrl("/auth/callback?next=/portal/password") });
  }
  return { ok: true, message: "If an authorised account exists for that address, password reset instructions have been sent." };
}

export async function updatePassword(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId) return { ok: false, message: "Please sign in to change your password." };

  const password = String(fd.get("password") ?? "");
  if (password.length < 8) {
    return { ok: false, message: "Use at least 8 characters.", fieldErrors: { password: ["Use at least 8 characters."] } };
  }

  if (!isSupabaseConfigured()) {
    const user = store().users.find((u) => u.id === viewer.userId);
    if (!user) return { ok: false, message: "Account not found." };
    user.passwordHash = await hashPassword(password);
    return { ok: true, demo: true, message: "Your password has been updated." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Your password has been updated." };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

/* ------------------------------------------------------------------
   Portal — manage own profile
   ------------------------------------------------------------------ */
export async function updateMyProfile(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer.userId || !viewer.alumni) return { ok: false, message: "Please sign in as an approved member to edit your profile." };

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
    return { ok: true, demo: viewer.demo, message: "Your profile and privacy settings have been saved." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not save your profile." };
  }
}
