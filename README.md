# Newton House — Patna Science College Alumni Association

> **Bound by Memories. United by Legacy.**
> *The Home. The Memories. The Brotherhood.*

The official digital home of the Newton House Alumni Association: a premium, accessible, production-ready
Next.js platform combining the heritage of the red-brick hostel with a verified alumni network, an open
memories archive, events and reunions, a member portal and an admin dashboard.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | **Next.js 16** (App Router, React 19, Server Actions, Turbopack) · TypeScript |
| Styling | **Tailwind CSS v4** with design tokens in `src/styles/globals.css` |
| UI primitives | shadcn/ui-pattern components (CVA + `tailwind-merge`) in `src/components/ui` · **Lucide** icons |
| Animation | **Motion for React** (reveals, hero, gallery, page transitions) · **GSAP ScrollTrigger** (timeline) |
| Backend | **Supabase** — PostgreSQL, Auth, Storage, Row Level Security |
| Validation | **Zod** (shared between forms and server actions) |
| Images | `next/image` (AVIF/WebP), uploads normalised with **sharp** (EXIF/GPS stripped) |
| Deployment | **Vercel** |

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint && npm run typecheck
```

### Demo mode (no credentials needed)

Without Supabase environment variables the site runs in **demo mode**:

- All pages, filters, the gallery, lightbox and memories reel work with structured sample data.
- Every form is functional — registrations, event sign-ups, contact messages, newsletter, profile edits
  and all admin actions are stored **in server memory** (reset on restart).
- `/portal` and `/admin` open as a demonstration admin so the full approval workflow can be tested:
  register at `/join` → approve at `/admin/alumni` → see the profile appear in `/alumni`.

Every sample record is flagged (`isSample` / `isDemo`), visibly labelled in the UI, excluded from the
sitemap and marked `noindex`.

### Connecting Supabase (production)

1. Create a Supabase project, then copy `.env.example` to `.env.local` and fill in:
   `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   and (server-only) `SUPABASE_SERVICE_ROLE_KEY`.
2. Apply the schema: `supabase db push` — or paste `supabase/migrations/20261124000000_init.sql`
   into the SQL editor. Optionally run `supabase/seed.sql` for clearly-labelled sample content.
3. **Auth → URL configuration:** set the Site URL and add `https://<your-domain>/auth/callback`
   as a redirect URL. Keep "Confirm email" enabled.
4. Sign up once through `/join`, then grant yourself admin rights:
   ```sql
   insert into public.admin_users (user_id, role)
   select id, 'admin' from auth.users where email = 'you@example.com';
   ```
5. Restart the app. Repository functions switch from memory to PostgreSQL automatically.

---

## Project structure

```
src/
  app/
    (site)/            public site — layout with navbar/footer + page transitions
      page.tsx         homepage (sections A–J)
      about/ legacy/ alumni/ alumni/[slug]/ achievements/ achievements/[slug]/
      memories/ events/ events/[slug]/ (+ /calendar .ics) join/ contact/
      login/ portal/ portal/password/
    admin/             protected dashboard (overview, alumni, events, achievements,
                       gallery, announcements, newsletter, messages, CSV exports)
    actions/           server actions: public.ts · auth.ts · admin.ts
    auth/callback/     Supabase email-link handler (PKCE + token-hash)
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx apple-icon.tsx icon.svg
  components/
    animations/ brand/ navigation/ hero/ sections/ layout/ alumni/
    achievements/ gallery/ events/ forms/ admin/ ui/
  data/                site config, image registry, sample content (clearly flagged)
  lib/
    supabase/          browser, server, public and service-role clients + proxy session refresh
    data/              repository layer — Supabase when configured, memory store otherwise
    validations/       Zod schemas
    auth.ts storage.ts utils/
  hooks/ types/ styles/
  proxy.ts             Next 16 proxy (formerly middleware): session refresh + route guard
supabase/
  migrations/          schema, triggers, RLS, storage buckets & policies
  seed.sql             demonstration content
public/
  images/{hero,hostel,memories,alumni,events,branding}/
  fonts/               self-hosted Cormorant Garamond, Manrope, Inter (woff2)
docs/
  PHOTOGRAPHY.md       how to replace photographs with high-resolution originals
  design-reference.jpg the approved visual direction
```

---

## Design system

**Midnight Navy × Warm Ivory × Champagne Gold.** Tokens live in `src/styles/globals.css` (`@theme`).

| Token | Value | Use |
| --- | --- | --- |
| `navy` / `navy-deep` / `navy-2` | `#0B1F38` `#102B49` `#173957` | hero, stats, memories, footer |
| `ivory` / `ivory-2` / `card` | `#F5F1E9` `#EAE4D9` `#FFFFFF` | legacy, directory, events |
| `gold` / `gold-dark` | `#D6AD68` `#A77C3D` | accents, CTAs, eyebrows |
| `ink` / `muted` | `#14263D` `#687586` | text |
| `brick` / `line` | `#A94F38` `#DDD5C8` | architectural accent, borders |
| `gold-deep`, `muted-strong` | `#85612C` `#56637A` | **added** AA-contrast variants for small text on ivory |

Typography: **Cormorant Garamond** (headings), **Manrope** (body & navigation), **Inter** (tracked labels),
self-hosted through `next/font/local` with size-adjusted fallbacks for zero layout shift.

---

## Content integrity

The brief requires that nothing be invented. Accordingly:

- **Statistics** (`src/data/site.ts → impactStats`) are `null` and render as *"Figure being verified"*.
  Set a number and it animates automatically.
- **Timeline dates** (`src/data/legacy.ts`) are unset and show *"archive verification pending"*.
  Set `dateLabel` + `verified: true` to publish.
- **Alumni, achievements and events** shipped with the project are fictional demonstrations with
  generic organisations, clearly badged *Sample* / *Demonstration*.
- **Contact email and social links** are `null` in `siteConfig`; only verified entries render, so no
  link points nowhere. The contact form works regardless.
- **Committee members** are not listed until confirmed.

---

## Security & privacy

- Row Level Security on every table. The `alumni` table is **never** publicly readable; the directory
  is served through the `alumni_directory` view which exposes only safe columns of *approved* members
  and enforces `public` / `members` / `private` visibility. Email is included only with `show_email`.
- A trigger prevents members from changing their own moderation status.
- `handle_new_user` creates a **pending** record on sign-up; admins approve or reject.
- Storage: members may write only to `avatars/<their-user-id>/`; gallery/events buckets are admin-only.
- The service-role key is used server-side only (registration photo upload).
- Uploads are validated (type, 3 MB), re-encoded to WebP and stripped of EXIF/GPS metadata.
- Honeypot fields on public forms; CSV exports guard against formula injection; security headers set
  in `next.config.ts`.

---

## SEO, accessibility & performance

- Per-page metadata, canonical URLs, Open Graph/Twitter cards and a generated OG image.
- `sitemap.xml` (sample records excluded), `robots.txt`, web manifest, JSON-LD (Organization,
  BreadcrumbList, Event, Person).
- Semantic landmarks, skip link, visible focus rings, labelled controls with `aria-describedby` errors,
  keyboard-operable menus, lightbox and reel (Esc / arrows / space), `prefers-reduced-motion` honoured by
  CSS, Motion (`reducedMotion="user"`) and GSAP (`matchMedia`).
- Static generation + ISR (5-minute revalidation) for public content, on-demand revalidation after edits,
  AVIF/WebP via `next/image`, lazy-loaded imagery, LazyMotion feature bundle.

---

## Deployment (Vercel)

1. Push to a Git repository and import it in Vercel.
2. Add the environment variables from `.env.example` (Production + Preview).
3. Deploy. Update the Supabase Auth Site URL / redirect URL to the production domain.

---

© Newton House Alumni Association | Patna Science College.
