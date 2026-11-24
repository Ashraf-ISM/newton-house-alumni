import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles Supabase email links: sign-up verification, magic links and
 * password recovery. Supports both PKCE (`code`) and token-hash flows.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const rawNext = url.searchParams.get("next") ?? "/portal";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/portal";
  const fail = NextResponse.redirect(new URL("/login?error=auth", url.origin));
  if (!isSupabaseConfigured()) return fail;

  const supabase = await createClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(type === "recovery" ? "/portal/password" : next, url.origin));
  }
  return fail;
}
