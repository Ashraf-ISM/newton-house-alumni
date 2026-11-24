import sharp from "sharp";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { uid } from "@/lib/utils";
import type { SupabaseClient } from "@supabase/supabase-js";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

export function validateImageFile(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Upload a JPEG, PNG, WebP or AVIF image.";
  if (file.size > MAX_UPLOAD_BYTES) return "Images must be 3 MB or smaller.";
  return null;
}

export function fileFrom(fd: FormData, key: string): File | null {
  const v = fd.get(key);
  return v instanceof File && v.size > 0 ? v : null;
}

/**
 * Normalise an uploaded photograph: auto-rotate from EXIF, strip metadata
 * (including GPS), resize and encode as WebP.
 */
export async function processImage(file: File, maxSize: number) {
  const input = Buffer.from(await file.arrayBuffer());
  const pipeline = sharp(input).rotate().resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true });
  const { data, info } = await pipeline.webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}

/**
 * Store an image and return a public URL.
 * - Supabase: uploads to the given Storage bucket (policies decide who may write).
 * - Demo mode: returns an inline data URL kept in server memory.
 */
export async function storeImage(
  file: File,
  opts: { bucket: "avatars" | "gallery" | "events"; folder: string; maxSize: number; client?: SupabaseClient },
) {
  const { buffer, width, height } = await processImage(file, isSupabaseConfigured() ? opts.maxSize : Math.min(opts.maxSize, 1200));

  if (!isSupabaseConfigured() || !opts.client) {
    return { url: `data:image/webp;base64,${buffer.toString("base64")}`, width, height };
  }

  const path = `${opts.folder}/${uid()}.webp`;
  const { error } = await opts.client.storage
    .from(opts.bucket)
    .upload(path, buffer, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = opts.client.storage.from(opts.bucket).getPublicUrl(path);
  return { url: data.publicUrl, width, height };
}
