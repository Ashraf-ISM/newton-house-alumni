import { redirect } from "next/navigation";
import { getMyAlumniRecord } from "@/lib/data/alumni";
import { DEMO_MEMBER_ID, store } from "@/lib/data/store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AlumniRecord } from "@/types";

export interface Viewer {
  /** True when running without Supabase (sample data, no real auth). */
  demo: boolean;
  userId: string | null;
  email: string | null;
  role: "admin" | "editor" | null;
  alumni: AlumniRecord | null;
  /** Signed-in alumnus whose registration is approved. */
  isApprovedMember: boolean;
}

/**
 * Resolve the current viewer. In demo mode the viewer is a demonstration
 * member with admin rights so the full portal and dashboard can be explored.
 */
export async function getViewer(): Promise<Viewer> {
  if (!isSupabaseConfigured()) {
    const alumni = store().alumni.find((a) => a.id === DEMO_MEMBER_ID) ?? null;
    return {
      demo: true,
      userId: "demo-user",
      email: alumni?.email ?? null,
      role: "admin",
      alumni,
      isApprovedMember: alumni?.status === "approved",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { demo: false, userId: null, email: null, role: null, alumni: null, isApprovedMember: false };

  const [{ data: adminRow }, alumni] = await Promise.all([
    supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle(),
    getMyAlumniRecord(user.id),
  ]);

  return {
    demo: false,
    userId: user.id,
    email: user.email ?? null,
    role: (adminRow?.role as Viewer["role"]) ?? null,
    alumni,
    isApprovedMember: alumni?.status === "approved",
  };
}

/** Public pages only need to know whether members-only profiles may be shown. */
export async function viewerIsMember(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false; // demo directory shows the public view
  const v = await getViewer();
  return v.isApprovedMember || v.role !== null;
}

export async function requireUser(next = "/portal") {
  const v = await getViewer();
  if (!v.userId) redirect(`/login?next=${encodeURIComponent(next)}`);
  return v;
}

export async function requireAdmin() {
  const v = await getViewer();
  if (!v.userId) redirect("/login?next=/admin");
  if (!v.role) redirect("/portal?error=not-admin");
  return v;
}

/** For server actions: throws instead of redirecting. */
export async function assertAdmin() {
  const v = await getViewer();
  if (!v.role) throw new Error("You do not have permission to perform this action.");
  return v;
}
