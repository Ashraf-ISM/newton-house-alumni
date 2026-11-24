import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { isSupabaseConfigured } from "./config";

/**
 * Enforces authentication & role-based route protection on /portal and /admin.
 * Supports both signed HTTP-only session cookies (`nh_session`) and Supabase Auth sessions.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const isPortal = path.startsWith("/portal");
  const isAdmin = path.startsWith("/admin");
  const isProtected = isPortal || isAdmin;

  // 1. Check signed HTTP-only session cookie first
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const localSession = await verifySessionToken(token);

  if (localSession) {
    if (isAdmin && !localSession.role) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      url.searchParams.set("error", "not-admin");
      return NextResponse.redirect(url);
    }
    return response;
  }

  // 2. If no local session cookie and Supabase is not configured, block protected routes
  if (!isSupabaseConfigured()) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // 3. Otherwise verify Supabase Auth session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}
