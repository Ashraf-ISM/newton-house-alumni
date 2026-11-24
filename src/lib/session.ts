/**
 * Signed HTTP-only session token & password hashing utilities.
 * Uses the standard Web Crypto API (`crypto.subtle`) so it works in both
 * Next.js Proxy (Edge/Node) and Server Components / Server Actions.
 */

export const SESSION_COOKIE = "nh_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  email: string;
  role: "admin" | "editor" | null;
  alumniId: string | null;
  exp: number;
}

function getSecret(): string {
  return (
    process.env.AUTH_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "newton-house-patna-science-college-hmac-secret-2026"
  );
}

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(
  data: Omit<SessionPayload, "exp">,
  ttlSeconds = SESSION_TTL_SECONDS,
): Promise<string> {
  const payload: SessionPayload = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await getHmacKey();
  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const sig = toBase64Url(new Uint8Array(sigBuffer));
  return `${body}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const key = await getHmacKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sig) as BufferSource,
      encoder.encode(body),
    );
    if (!valid) return null;
    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    if (typeof decoded.exp !== "number" || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------
   Password hashing (PBKDF2-SHA256)
   ------------------------------------------------------------------ */

const PBKDF2_ITERATIONS = 100_000;

export async function hashPassword(password: string, customSalt?: Uint8Array): Promise<string> {
  const salt = customSalt ?? crypto.getRandomValues(new Uint8Array(16));
  const baseKey = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey,
    256,
  );
  return `pbkdf2$${toBase64Url(salt)}$${toBase64Url(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith("pbkdf2$")) return false;
  const parts = stored.split("$");
  if (parts.length !== 3) return false;
  const salt = fromBase64Url(parts[1]);
  const candidate = await hashPassword(password, salt);
  // Constant-time string comparison
  if (candidate.length !== stored.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i++) {
    diff |= candidate.charCodeAt(i) ^ stored.charCodeAt(i);
  }
  return diff === 0;
}
