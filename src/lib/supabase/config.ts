/** True when the public Supabase credentials are present. Otherwise the site runs in demo mode. */
export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasServiceRole() {
  return isSupabaseConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase is not configured. See .env.example.");
  return { url, anonKey };
}
