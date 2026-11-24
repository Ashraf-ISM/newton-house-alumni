-- =====================================================================
--  NEWTON HOUSE — PATNA SCIENCE COLLEGE ALUMNI ASSOCIATION
--  Initial schema: tables, enums, triggers, RLS policies, storage.
--  Apply with:  supabase db push   (or paste into the SQL editor)
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type public.alumni_status      as enum ('pending', 'approved', 'rejected');
create type public.profile_visibility as enum ('public', 'members', 'private');
create type public.admin_role         as enum ('admin', 'editor');
create type public.event_category     as enum ('reunion', 'networking', 'lecture', 'gathering', 'cultural');
create type public.achievement_category as enum (
  'academics-research', 'government-public-service', 'science-technology',
  'corporate-leadership', 'entrepreneurship', 'other'
);

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create or replace function public.slugify(txt text) returns text
language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(unaccent(coalesce(txt, ''))), '[^a-z0-9]+', '-', 'g'));
$$;

-- ---------------------------------------------------------------------
-- Admin users (role-based access control)
-- ---------------------------------------------------------------------
create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       public.admin_role not null default 'editor',
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER so policies can call it without recursive RLS checks.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------
-- Alumni (identity + private contact) and profiles (public-facing)
-- ---------------------------------------------------------------------
create table public.alumni (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid unique references auth.users (id) on delete set null,
  slug            text not null unique,
  full_name       text not null check (char_length(full_name) between 2 and 120),
  email           text not null,                       -- PRIVATE
  phone           text,                                -- PRIVATE
  graduation_year int  not null check (graduation_year between 1920 and 2100),
  department      text not null,
  status          public.alumni_status not null default 'pending',
  is_sample       boolean not null default false,
  review_note     text,
  reviewed_at     timestamptz,
  reviewed_by     uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create unique index alumni_email_key on public.alumni (lower(email));
create index alumni_status_idx on public.alumni (status);
create index alumni_year_idx on public.alumni (graduation_year);
create trigger alumni_updated_at before update on public.alumni
  for each row execute function public.set_updated_at();

create table public.alumni_profiles (
  alumni_id     uuid primary key references public.alumni (id) on delete cascade,
  designation   text,
  organisation  text,
  city          text,
  country       text default 'India',
  profession    text,
  linkedin_url  text check (linkedin_url is null or linkedin_url ~* '^https://([a-z]{2,3}\.)?linkedin\.com/'),
  photo_url     text,
  bio           text check (bio is null or char_length(bio) <= 600),
  visibility    public.profile_visibility not null default 'members',
  show_email    boolean not null default false,     -- explicit consent to display email
  updated_at    timestamptz not null default now()
);
create trigger alumni_profiles_updated_at before update on public.alumni_profiles
  for each row execute function public.set_updated_at();

-- True when the current user is an approved alumnus (or an admin).
create or replace function public.is_approved_member() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.alumni where user_id = auth.uid() and status = 'approved'
  );
$$;

-- Members may not change their own moderation status, identity or sample flag.
create or replace function public.guard_alumni_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if new.status is distinct from old.status
       or new.is_sample is distinct from old.is_sample
       or new.user_id is distinct from old.user_id
       or new.reviewed_by is distinct from old.reviewed_by
       or new.reviewed_at is distinct from old.reviewed_at then
      raise exception 'Only administrators can change moderation fields.';
    end if;
  end if;
  return new;
end $$;
create trigger alumni_guard before update on public.alumni
  for each row execute function public.guard_alumni_update();

-- On sign-up, create a PENDING alumni record + profile from user metadata
-- supplied by the /join form (see src/app/actions/auth.ts).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m        jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  base     text;
  candidate text;
  n        int := 1;
  new_id   uuid;
begin
  if m ->> 'full_name' is null or m ->> 'graduation_year' is null then
    return new; -- not an alumni registration (e.g. an admin invite)
  end if;

  base := public.slugify((m ->> 'full_name') || '-' || (m ->> 'graduation_year'));
  candidate := base;
  while exists (select 1 from public.alumni where slug = candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;

  insert into public.alumni (user_id, slug, full_name, email, graduation_year, department, status)
  values (
    new.id, candidate, m ->> 'full_name', new.email,
    (m ->> 'graduation_year')::int, coalesce(m ->> 'department', 'Other'), 'pending'
  )
  returning id into new_id;

  insert into public.alumni_profiles (alumni_id, designation, organisation, city, profession, linkedin_url, bio, visibility, show_email)
  values (
    new_id,
    nullif(m ->> 'designation', ''), nullif(m ->> 'organisation', ''), nullif(m ->> 'city', ''),
    nullif(m ->> 'profession', ''), nullif(m ->> 'linkedin_url', ''), nullif(m ->> 'bio', ''),
    coalesce((m ->> 'visibility')::public.profile_visibility, 'members'),
    coalesce((m ->> 'show_email')::boolean, false)
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Public directory view — the ONLY way non-admins read other alumni.
-- Exposes safe columns, approved records, and respects visibility:
--   public  → everyone;  members → approved members;  private → never.
-- Email is included only when the member opted in (show_email).
-- Runs with owner privileges (intentional), filtering by auth.uid().
-- ---------------------------------------------------------------------
create or replace view public.alumni_directory
with (security_barrier = true) as
select
  a.id, a.slug, a.full_name, a.graduation_year, a.department,
  p.designation, p.organisation, p.city, p.country, p.profession,
  case when public.is_approved_member() then p.linkedin_url else null end as linkedin_url,
  p.photo_url, p.bio, p.visibility,
  case when p.show_email and public.is_approved_member() then a.email else null end as public_email,
  a.is_sample, a.created_at
from public.alumni a
join public.alumni_profiles p on p.alumni_id = a.id
where a.status = 'approved'
  and (p.visibility = 'public' or (p.visibility = 'members' and public.is_approved_member()));

revoke all on public.alumni_directory from public;
grant select on public.alumni_directory to anon, authenticated;

-- ---------------------------------------------------------------------
-- Achievements
-- ---------------------------------------------------------------------
create table public.achievements (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  alumni_id       uuid references public.alumni (id) on delete set null,
  name            text not null,
  designation     text not null,
  organisation    text not null,
  category        public.achievement_category not null,
  summary         text not null,
  biography       text,
  portrait_url    text,
  graduation_year int,
  department      text,
  verified        boolean not null default false,
  is_sample       boolean not null default false,
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger achievements_updated_at before update on public.achievements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Events & registrations
-- ---------------------------------------------------------------------
create table public.events (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  category          public.event_category not null default 'reunion',
  starts_at         timestamptz not null,
  ends_at           timestamptz,
  venue             text not null,
  city              text not null,
  summary           text not null,
  body              text,
  image_url         text,
  registration_open boolean not null default true,
  capacity          int check (capacity is null or capacity > 0),
  is_demo           boolean not null default false,
  published         boolean not null default false,
  gallery           text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index events_starts_idx on public.events (starts_at);
create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

create table public.event_registrations (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events (id) on delete cascade,
  user_id         uuid references auth.users (id) on delete set null,
  full_name       text not null check (char_length(full_name) between 2 and 120),
  email           text not null,
  graduation_year int,
  guests          int not null default 0 check (guests between 0 and 5),
  note            text check (note is null or char_length(note) <= 500),
  created_at      timestamptz not null default now()
);
create unique index event_registrations_unique on public.event_registrations (event_id, lower(email));

-- ---------------------------------------------------------------------
-- Gallery
-- ---------------------------------------------------------------------
create table public.gallery_categories (
  slug        text primary key,
  name        text not null,
  description text,
  sort_order  int not null default 0
);

create table public.gallery (
  id            uuid primary key default gen_random_uuid(),
  category_slug text not null references public.gallery_categories (slug) on update cascade,
  title         text not null,
  caption       text,
  image_url     text not null,
  width         int not null default 1200,
  height        int not null default 800,
  alt           text not null check (char_length(alt) >= 8),
  year          text,
  published     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Announcements, contact messages, newsletter
-- ---------------------------------------------------------------------
create table public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now()
);

create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 100),
  email      text not null,
  subject    text not null check (char_length(subject) <= 140),
  message    text not null check (char_length(message) between 20 and 4000),
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  created_at      timestamptz not null default now(),
  unsubscribed_at timestamptz
);
create unique index newsletter_email_key on public.newsletter_subscribers (lower(email));

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.admin_users            enable row level security;
alter table public.alumni                 enable row level security;
alter table public.alumni_profiles        enable row level security;
alter table public.achievements           enable row level security;
alter table public.events                 enable row level security;
alter table public.event_registrations    enable row level security;
alter table public.gallery_categories     enable row level security;
alter table public.gallery                enable row level security;
alter table public.announcements          enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- admin_users: users can see their own role; super-admins manage roles.
create policy "admin_users: read own"     on public.admin_users for select using (user_id = auth.uid() or public.is_admin());
create policy "admin_users: super manage" on public.admin_users for all    using (public.is_super_admin()) with check (public.is_super_admin());

-- alumni: NO public select (directory goes through the view).
create policy "alumni: owner read"   on public.alumni for select using (user_id = auth.uid() or public.is_admin());
create policy "alumni: owner update" on public.alumni for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "alumni: admin insert" on public.alumni for insert with check (public.is_admin());
create policy "alumni: admin delete" on public.alumni for delete using (public.is_admin());

-- alumni_profiles: owner + admin only.
create policy "profiles: owner read" on public.alumni_profiles for select
  using (public.is_admin() or exists (select 1 from public.alumni a where a.id = alumni_id and a.user_id = auth.uid()));
create policy "profiles: owner update" on public.alumni_profiles for update
  using (public.is_admin() or exists (select 1 from public.alumni a where a.id = alumni_id and a.user_id = auth.uid()))
  with check (public.is_admin() or exists (select 1 from public.alumni a where a.id = alumni_id and a.user_id = auth.uid()));
create policy "profiles: admin insert" on public.alumni_profiles for insert with check (public.is_admin());
create policy "profiles: admin delete" on public.alumni_profiles for delete using (public.is_admin());

-- Published content is public; public users may submit draft achievements for admin review; admins/editors manage everything.
create policy "achievements: public read"   on public.achievements for select using (published or public.is_admin());
create policy "achievements: public submit" on public.achievements for insert with check (not published and not verified and not is_sample);
create policy "achievements: admin write"   on public.achievements for all using (public.is_admin()) with check (public.is_admin());

create policy "events: public read" on public.events for select using (published or public.is_admin());
create policy "events: admin write" on public.events for all using (public.is_admin()) with check (public.is_admin());

create policy "gallery_categories: public read" on public.gallery_categories for select using (true);
create policy "gallery_categories: admin write" on public.gallery_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "gallery: public read" on public.gallery for select using (published or public.is_admin());
create policy "gallery: admin write" on public.gallery for all using (public.is_admin()) with check (public.is_admin());

create policy "announcements: public read" on public.announcements for select using (published or public.is_admin());
create policy "announcements: admin write" on public.announcements for all using (public.is_admin()) with check (public.is_admin());

-- Registrations: anyone may register for an open, published, upcoming event.
create policy "registrations: create" on public.event_registrations for insert
  with check (
    (user_id is null or user_id = auth.uid())
    and exists (
      select 1 from public.events e
      where e.id = event_id and e.published and e.registration_open and e.starts_at > now()
    )
  );
create policy "registrations: read own or admin" on public.event_registrations for select
  using (public.is_admin() or (user_id is not null and user_id = auth.uid()));
create policy "registrations: admin manage" on public.event_registrations for delete using (public.is_admin());

-- Contact + newsletter: write-only for the public; readable by admins.
create policy "contact: create"     on public.contact_messages for insert with check (true);
create policy "contact: admin read" on public.contact_messages for select using (public.is_admin());
create policy "contact: admin upd"  on public.contact_messages for update using (public.is_admin()) with check (public.is_admin());

create policy "newsletter: create"     on public.newsletter_subscribers for insert with check (unsubscribed_at is null);
create policy "newsletter: admin read" on public.newsletter_subscribers for select using (public.is_admin());
create policy "newsletter: admin upd"  on public.newsletter_subscribers for update using (public.is_admin()) with check (public.is_admin());
create policy "newsletter: admin del"  on public.newsletter_subscribers for delete using (public.is_admin());

-- =====================================================================
-- STORAGE
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 3145728, array['image/webp','image/jpeg','image/png','image/avif']),
  ('gallery', 'gallery', true, 5242880, array['image/webp','image/jpeg','image/png','image/avif']),
  ('events',  'events',  true, 5242880, array['image/webp','image/jpeg','image/png','image/avif'])
on conflict (id) do nothing;

-- Members upload only into a folder named after their user id.
create policy "avatars: owner upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- Admins manage gallery and event imagery.
create policy "gallery+events: admin write" on storage.objects for all to authenticated
  using (bucket_id in ('gallery', 'events') and public.is_admin())
  with check (bucket_id in ('gallery', 'events') and public.is_admin());
