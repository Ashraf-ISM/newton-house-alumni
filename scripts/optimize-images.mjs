#!/usr/bin/env node
/**
 * Newton House — Image Optimization Utility
 *
 * Usage:
 *   npm run images
 *   node scripts/optimize-images.mjs [directory]
 *
 * Scans public/images (or a provided directory) for .jpg, .jpeg, and .png
 * files, strips EXIF/GPS metadata, auto-orients, and writes alongside an
 * optimized .webp version plus prints intrinsic dimensions for src/data/images.ts.
 */
import { readdir, stat } from "node:fs/promises";
import { extname, join, parse } from "node:path";
import sharp from "sharp";

const ROOT = process.argv[2] ?? join(process.cwd(), "public/images");
const SOURCE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (SOURCE_EXTS.has(extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

const files = await walk(ROOT);
console.log(`Inspecting ${files.length} image(s) in ${ROOT}...\n`);

for (const file of files) {
  const ext = extname(file).toLowerCase();
  const meta = await sharp(file).metadata();
  const info = await stat(file);
  const kb = (info.size / 1024).toFixed(1);
  console.log(`  ${file.replace(process.cwd() + "/", "")} — ${meta.width}×${meta.height} (${kb} KB)`);

  // Convert non-WebP sources (except og-exterior.jpg which social crawlers expect as JPEG)
  if (ext !== ".webp" && !file.endsWith("og-exterior.jpg")) {
    const { dir, name } = parse(file);
    const out = join(dir, `${name}.webp`);
    const res = await sharp(file)
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(out);
    console.log(`    → wrote ${out.replace(process.cwd() + "/", "")} (${res.width}×${res.height}, ${(res.size / 1024).toFixed(1)} KB)`);
  }
}
