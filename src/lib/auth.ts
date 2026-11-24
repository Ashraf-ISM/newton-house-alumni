import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMyAlumniRecord } from "@/lib/data/alumni";
import { store } from "@/lib/data/store";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AlumniRecord } from "@/types";

export interface Viewer {
  /** True when authenticated via the built-in local session store. */
  demo: boolean;
  userId: string | null;
  email: string | null;
  role: "admin" | "editor" | null;
  alumni: AlumniRecord | null;
  /** True when the signed-in user is an approved alumnus. */
  isApprovedMember: boolean;
}

const ANONYMOUS_VIEWER = (demo: boolean): Viewer => ({
  demo,
  userId: null,
  email: null,
  role: null,
  alumni: null,
  isApprovedMember: false,
});

/**
 * Resolve the current authenticated viewer.
 * Unauthenticated visitors are ALWAYS anonymous (`userId: null, role: null`).
 * Only authorised users (Administrators or Approved Alumni Members) receive an
 * active viewer session.
 */
export async function getViewer(): Promise<Viewer> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  const localSession = await verifySessionToken(rawToken);

  if (localSession) {
    const s = store();
    const user = s.users.find((u) => u.id === localSession.userId);
    if (user) {
      const alumni =
        (user.alumniId ? s.alumni.find((a) => a.id === user.alumniId) : null) ??
        s.alumni.find((a) => a.userId === user.id || a.email.toLowerCase() === user.email.toLowerCase()) ??
        null;
      const isApprovedMember = alumni?.status === "approved";
      if (user.role || isApprovedMember) {
        return {
          demo: true,
          userId: user.id,
          email: user.email,
          role: user.role,
          alumni,
          isApprovedMember,
        };
      }
    }
  }

  if (!isSupabaseConfigured()) {
    return ANONYMOUS_VIEWER(true);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return ANONYMOUS_VIEWER(false);

    const [{ data: adminRow }, alumni] = await Promise.all([
      supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle(),
      getMyAlumniRecord(user.id),
    ]);

    const role = (adminRow?.role as Viewer["role"]) ?? null;
    const isApprovedMember = alumni?.status === "approved";

    if (!role && !isApprovedMember) {
      return ANONYMOUS_VIEWER(false);
    }

    return {
      demo: false,
      userId: user.id,
      email: user.email ?? null,
      role,
      alumni,
      isApprovedMember,
    };
  } catch {
    return ANONYMOUS_VIEWER(false);
  }
}

/** True when the current viewer is a signed-in approved alumnus or administrator. */
export async function viewerIsMember(): Promise<boolean> {
  const v = await getViewer();
  return v.isApprovedMember || v.role !== null;
}

/** Guards member-only routes (/portal). Redirects unauthenticated or unapproved users to /login. */
export async function requireUser(next = "/portal") {
  const v = await getViewer();
  if (!v.userId || (!v.isApprovedMember && !v.role)) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return v;
}

/** Guards administrator routes (/admin). Redirects unauthenticated users to /login and non-admins to /portal. */
export async function requireAdmin() {
  const v = await getViewer();
  if (!v.userId) redirect("/login?next=/admin");
  if (!v.role) redirect("/portal?error=not-admin");
  return v;
}

/** For server actions: throws if the caller is not an authenticated administrator. */
export async function assertAdmin() {
  const v = await getViewer();
  if (!v.userId || !v.role) {
    throw new Error("Authorisation required: only administrators can perform this action.");
  }
  return v;
}
