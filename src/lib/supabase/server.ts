import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { supabaseEnv } from "./config";

/** Request-scoped client that acts as the signed-in user (RLS applies). */
export async function createClient() {
  const { url, anonKey } = supabaseEnv();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — the proxy refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Service-role client. SERVER ONLY — bypasses RLS. Used solely for
 * registration photo uploads and storage housekeeping, never for reads
 * that are returned to the browser unfiltered.
 */
export function createAdminClient() {
  const { url } = supabaseEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  return createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/**
 * Cookie-less anonymous client for public, cacheable reads
 * (published events, gallery, achievements). Lets those pages be
 * statically generated and revalidated instead of rendered per request.
 */
export function createPublicClient() {
  const { url, anonKey } = supabaseEnv();
  return createSupabaseClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
