# Photography guide

The real Newton House building is the visual identity of this site. Every photograph is declared once in
[`src/data/images.ts`](../src/data/images.ts) with its dimensions and alt text.

## ⚠️ Current state of the photographs

Only one image was supplied with the brief — the approved design mock-up (`docs/design-reference.jpg`).
The photographs currently on the site were **cropped directly from the real photographs inside that
mock-up** (no generated or substitute architecture), then gently upscaled. They are authentic but
low-resolution. Please replace them with the original high-resolution files as soon as possible.

| File | Shows | Used in |
| --- | --- | --- |
| `public/images/hero/newton-house-exterior.webp` | Red-brick facade, green windows, railings | Hero, gallery, events, OG image |
| `public/images/hero/og-exterior.jpg` | 780×630 crop of the above | Social share image |
| `public/images/hostel/facade-corner.webp` | Corner of the building | About, gallery, events |
| `public/images/hostel/facade-west-wing.webp` | Long wing | CTA background, alumni header |
| `public/images/hostel/main-entrance.webp` | Arched main entrance | About, memories, reel |
| `public/images/hostel/exterior-vintage.webp` | Sepia treatment of the facade | Legacy |
| `public/images/hostel/archive-exterior-sepia.webp` | Archival print of the building | Legacy collage |
| `public/images/hostel/archive-entrance-sepia.webp` | Archival print of the entrance | Legacy, timeline |
| `public/images/memories/illuminated-facade.webp` | Hostel lit with decorative lights | Memories, traditions |
| `public/images/memories/alumni-gathering.webp` | Group photograph before the house | Memories, alumni meets |

## Replacing a photograph

1. Export the original at **at least 2400 px** on the long edge (hero: 2800 px+), sRGB, JPEG/WebP.
2. Save it over the existing file (keep the name) — or add a new file and update the path.
3. Update `width` and `height` in `src/data/images.ts` to the new intrinsic size.
4. Regenerate the social image if you replaced the hero:
   `python3 -c "from PIL import Image; …"` or simply export a 780×630 crop to `og-exterior.jpg`.

`next/image` produces AVIF/WebP at every breakpoint automatically.

## Recommended shot list

- **Hero:** facade in warm late-afternoon light, landscape, building on the right two-thirds.
- **Entrance:** straight-on, symmetrical arch.
- **Illuminations:** tripod, blue hour, lights on.
- **Gallery categories still empty:** Cultural Events, Freshers, Farewell.
- **Archive:** scans of historical prints at 600 dpi.

Gallery photographs can also be uploaded through **Admin → Gallery** (resized, WebP-encoded and
stripped of location metadata automatically).

## Folder structure

```
public/images/
  hero/      hero & social
  hostel/    architecture, archive prints
  memories/  hostel life, celebrations, gatherings
  alumni/    (member portraits are uploaded to Supabase Storage)
  events/    event covers
  branding/  logos & marks
```
