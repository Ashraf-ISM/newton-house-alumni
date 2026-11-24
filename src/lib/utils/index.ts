import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function initials(name: string) {
  const parts = name
    .replace(/^(dr|mr|ms|mrs|prof)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const TZ = "Asia/Kolkata";

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
    ...opts,
  }).format(new Date(iso));
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TZ,
  }).format(new Date(iso));
}

export function dateParts(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-IN", { day: "2-digit", timeZone: TZ }).format(d);
  const month = new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: TZ }).format(d);
  const year = new Intl.DateTimeFormat("en-IN", { year: "numeric", timeZone: TZ }).format(d);
  return { day, month: month.toUpperCase(), year };
}

export function isUpcoming(iso: string, now = new Date()) {
  return new Date(iso).getTime() >= now.getTime();
}

export function absoluteUrl(path = "/") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

export function uid() {
  return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function paramValue(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}
