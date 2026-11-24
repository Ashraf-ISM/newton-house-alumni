-- =====================================================================
--  NEWTON HOUSE — PATNA SCIENCE COLLEGE ALUMNI ASSOCIATION
--  Additive migration: Advanced Alumni Community & Digital Heritage Platform
--  Features:
--    1. Advanced Alumni Member Portal (connections, notifications, privacy flags)
--    2. Newton House Batch Directory (batches, batch_members, batch_contributions)
--    3. Digital Heritage Archive (archive_categories, archive_items)
--    4. Alumni Stories (story_categories, stories)
--    5. Mentorship Network (mentors, mentorship_requests)
--    6. Extended Admin & Moderation (admin_audit_logs, site_settings)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Extend existing enums & profile columns additively
-- ---------------------------------------------------------------------
alter type public.alumni_status add value if not exists 'info_required';

alter table public.alumni
  add column if not exists residence_start_year int check (
    residence_start_year is null or residence_start_year between 1920 and 2100
  );

alter table public.alumni_profiles
  add column if not exists show_location     boolean not null default true,
  add column if not exists show_professional boolean not null default true;

-- Update public directory view to enforce granular location/professional privacy
create or replace view public.alumni_directory
with (security_barrier = true) as
select
  a.id,
  a.slug,
  a.full_name,
  a.graduation_year,
  a.residence_start_year,
  a.department,
  case when p.show_professional then p.designation else null end as designation,
  case when p.show_professional then p.organisation else null end as organisation,
  case when p.show_location then p.city else null end as city,
  case when p.show_location then p.country else null end as country,
  case when p.show_professional then p.profession else null end as profession,
  case when public.is_approved_member() and p.show_professional then p.linkedin_url else null end as linkedin_url,
  p.photo_url,
  p.bio,
  p.visibility,
  p.show_location,
  p.show_professional,
  case when p.show_email and public.is_approved_member() then a.email else null end as public_email,
  a.is_sample,
  a.created_at
from public.alumni a
join public.alumni_profiles p on p.alumni_id = a.id
where a.status = 'approved'
  and (p.visibility = 'public' or (p.visibility = 'members' and public.is_approved_member()));

revoke all on public.alumni_directory from public;
grant select on public.alumni_directory to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Additional Enums for Community Platform
-- ---------------------------------------------------------------------
do $$ begin
  create type public.moderation_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.story_status as enum ('draft', 'submitted', 'under_review', 'approved', 'published', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.connection_status as enum ('pending', 'accepted', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.mentorship_request_status as enum ('pending', 'accepted', 'declined', 'more_info');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 3. Batches, Batch Members & Batch Contributions
-- ---------------------------------------------------------------------
create table if not exists public.batches (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  year             int  not null unique check (year between 1920 and 2100),
  residence_period text not null,
  title            text not null,
  description      text not null,
  photo_url        text,
  is_sample        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists batches_year_idx on public.batches (year desc);
drop trigger if exists batches_updated_at on public.batches;
create trigger batches_updated_at before update on public.batches
  for each row execute function public.set_updated_at();

create table if not exists public.batch_members (
  batch_id   uuid not null references public.batches (id) on delete cascade,
  alumni_id  uuid not null references public.alumni (id) on delete cascade,
  role_title text,
  created_at timestamptz not null default now(),
  primary key (batch_id, alumni_id)
);
create index if not exists batch_members_alumni_idx on public.batch_members (alumni_id);

create table if not exists public.batch_contributions (
  id                  uuid primary key default gen_random_uuid(),
  batch_id            uuid references public.batches (id) on delete cascade,
  batch_slug          text not null,
  batch_year          int  not null check (batch_year between 1920 and 2100),
  contribution_type   text not null check (contribution_type in ('memory', 'photograph', 'milestone')),
  title               text not null,
  content             text not null,
  image_url           text,
  submitter_alumni_id uuid references public.alumni (id) on delete set null,
  submitted_by        text not null,
  submitted_at        timestamptz not null default now(),
  reviewed_by         uuid references auth.users (id) on delete set null,
  reviewed_at         timestamptz,
  status              public.moderation_status not null default 'pending',
  is_sample           boolean not null default false
);
create index if not exists batch_contributions_batch_idx on public.batch_contributions (batch_slug, status);

-- ---------------------------------------------------------------------
-- 4. Alumni Connections & Notifications
-- ---------------------------------------------------------------------
create table if not exists public.connections (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.alumni (id) on delete cascade,
  recipient_id uuid not null references public.alumni (id) on delete cascade,
  status       public.connection_status not null default 'pending',
  note         text check (note is null or char_length(note) <= 500),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint connections_no_self check (requester_id <> recipient_id)
);
create unique index if not exists connections_pair_idx
  on public.connections (least(requester_id, recipient_id), greatest(requester_id, recipient_id));
create index if not exists connections_requester_idx on public.connections (requester_id, status);
create index if not exists connections_recipient_idx on public.connections (recipient_id, status);
drop trigger if exists connections_updated_at on public.connections;
create trigger connections_updated_at before update on public.connections
  for each row execute function public.set_updated_at();

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  alumni_id  uuid references public.alumni (id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null,
  href       text not null default '/member/dashboard',
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_alumni_idx on public.notifications (alumni_id, is_read, created_at desc);

-- ---------------------------------------------------------------------
-- 5. Digital Heritage Archive
-- ---------------------------------------------------------------------
create table if not exists public.archive_categories (
  slug        text primary key,
  label       text not null,
  description text not null,
  sort_order  int  not null default 0
);

create table if not exists public.archive_items (
  id                   uuid primary key default gen_random_uuid(),
  category_slug        text not null references public.archive_categories (slug) on update cascade,
  title                text not null,
  media_type           text not null check (media_type in ('photograph', 'document')),
  file_format          text not null check (file_format in ('jpeg', 'png', 'webp', 'pdf')),
  file_url             text not null,
  preview_url          text,
  width                int  not null default 1200,
  height               int  not null default 850,
  approximate_year     text not null,
  year_verified        boolean not null default false,
  description          text not null,
  contributor_name     text not null,
  show_contributor     boolean not null default true,
  permission_confirmed boolean not null default true,
  submitted_by_user_id uuid references auth.users (id) on delete set null,
  submitted_by         text not null,
  submitted_at         timestamptz not null default now(),
  reviewed_by          uuid references auth.users (id) on delete set null,
  reviewed_at          timestamptz,
  status               public.moderation_status not null default 'pending',
  is_sample            boolean not null default false
);
create index if not exists archive_items_cat_status_idx on public.archive_items (category_slug, status);

-- ---------------------------------------------------------------------
-- 6. Alumni Stories
-- ---------------------------------------------------------------------
create table if not exists public.story_categories (
  slug        text primary key,
  label       text not null,
  description text not null,
  sort_order  int  not null default 0
);

create table if not exists public.stories (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  category_slug          text not null references public.story_categories (slug) on update cascade,
  title                  text not null,
  summary                text not null,
  content                text[] not null default '{}',
  cover_image_url        text,
  supporting_images      text[] not null default '{}',
  author_alumni_id       uuid references public.alumni (id) on delete set null,
  author_slug            text,
  author_name            text not null,
  author_photo_url       text,
  author_department      text not null,
  author_graduation_year int  not null,
  author_residence_years text,
  author_designation     text,
  author_organisation    text,
  featured               boolean not null default false,
  status                 public.story_status not null default 'submitted',
  published_at           timestamptz,
  submitted_by_user_id   uuid references auth.users (id) on delete set null,
  submitted_by           text not null,
  submitted_at           timestamptz not null default now(),
  reviewed_by            uuid references auth.users (id) on delete set null,
  reviewed_at            timestamptz,
  is_sample              boolean not null default false,
  updated_at             timestamptz not null default now()
);
create index if not exists stories_status_cat_idx on public.stories (status, category_slug, published_at desc);
drop trigger if exists stories_updated_at on public.stories;
create trigger stories_updated_at before update on public.stories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 7. Mentorship Network
-- ---------------------------------------------------------------------
create table if not exists public.mentors (
  id                      uuid primary key default gen_random_uuid(),
  alumni_id               uuid unique references public.alumni (id) on delete cascade,
  slug                    text not null unique,
  name                    text not null,
  photo_url               text,
  graduation_year         int  not null,
  department              text not null,
  designation             text not null,
  organisation            text not null,
  city                    text,
  industry                text not null,
  experience_years        int  not null check (experience_years between 1 and 70),
  expertise               text[] not null default '{}',
  categories              text[] not null default '{}',
  preferred_communication text not null default 'Platform Message',
  availability            text not null default 'Open for Mentorship',
  bio                     text not null,
  submitted_by_user_id    uuid references auth.users (id) on delete set null,
  submitted_by            text not null,
  submitted_at            timestamptz not null default now(),
  reviewed_by             uuid references auth.users (id) on delete set null,
  reviewed_at             timestamptz,
  status                  public.moderation_status not null default 'pending',
  is_sample               boolean not null default false,
  updated_at              timestamptz not null default now()
);
create index if not exists mentors_status_idx on public.mentors (status, industry);
drop trigger if exists mentors_updated_at on public.mentors;
create trigger mentors_updated_at before update on public.mentors
  for each row execute function public.set_updated_at();

create table if not exists public.mentorship_requests (
  id                      uuid primary key default gen_random_uuid(),
  mentor_id               uuid not null references public.mentors (id) on delete cascade,
  mentee_alumni_id        uuid references public.alumni (id) on delete set null,
  mentee_user_id          uuid references auth.users (id) on delete set null,
  mentee_name             text not null,
  mentee_email            text not null, -- PRIVATE: only exposed to mentor upon acceptance or admin
  mentee_batch            text not null,
  title                   text not null,
  area_of_guidance        text not null,
  introduction            text not null,
  question                text not null,
  preferred_communication text not null default 'Platform Message',
  status                  public.mentorship_request_status not null default 'pending',
  mentor_response_note    text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index if not exists mentorship_requests_mentor_idx on public.mentorship_requests (mentor_id, status);
create index if not exists mentorship_requests_mentee_idx on public.mentorship_requests (mentee_alumni_id, status);
drop trigger if exists mentorship_requests_updated_at on public.mentorship_requests;
create trigger mentorship_requests_updated_at before update on public.mentorship_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 8. Admin Audit Logs & Site Settings
-- ---------------------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id              uuid primary key default gen_random_uuid(),
  entity_type     text not null,
  entity_id       text not null,
  entity_title    text not null,
  action          text not null,
  actor_user_id   uuid references auth.users (id) on delete set null,
  actor_email     text not null,
  previous_status text,
  new_status      text,
  created_at      timestamptz not null default now()
);
create index if not exists admin_audit_logs_created_idx on public.admin_audit_logs (created_at desc);

create table if not exists public.site_settings (
  id                            text primary key default 'default',
  require_registration_approval boolean not null default true,
  require_story_moderation      boolean not null default true,
  require_archive_moderation    boolean not null default true,
  require_mentor_approval       boolean not null default true,
  allow_member_connections      boolean not null default true,
  updated_by                    text not null default 'admin@newtonhouse.org',
  updated_at                    timestamptz not null default now()
);

-- =====================================================================
-- 9. ROW LEVEL SECURITY POLICIES
-- =====================================================================
alter table public.batches             enable row level security;
alter table public.batch_members       enable row level security;
alter table public.batch_contributions enable row level security;
alter table public.connections         enable row level security;
alter table public.notifications       enable row level security;
alter table public.archive_categories  enable row level security;
alter table public.archive_items       enable row level security;
alter table public.story_categories    enable row level security;
alter table public.stories             enable row level security;
alter table public.mentors             enable row level security;
alter table public.mentorship_requests enable row level security;
alter table public.admin_audit_logs    enable row level security;
alter table public.site_settings       enable row level security;

-- Batches & Batch Members: public read; admin write.
create policy "batches: public read" on public.batches for select using (true);
create policy "batches: admin write" on public.batches for all using (public.is_admin()) with check (public.is_admin());

create policy "batch_members: public read" on public.batch_members for select using (true);
create policy "batch_members: admin write" on public.batch_members for all using (public.is_admin()) with check (public.is_admin());

-- Batch Contributions: public reads ONLY approved; approved members may submit pending; admins manage all.
create policy "batch_contributions: approved read" on public.batch_contributions
  for select using (status = 'approved' or public.is_admin());
create policy "batch_contributions: member insert" on public.batch_contributions
  for insert with check (public.is_approved_member() and status = 'pending');
create policy "batch_contributions: admin write" on public.batch_contributions
  for all using (public.is_admin()) with check (public.is_admin());

-- Connections: private between requester & recipient (or admin).
create policy "connections: participant read" on public.connections
  for select using (
    public.is_admin() or exists (
      select 1 from public.alumni a
      where a.user_id = auth.uid() and (a.id = requester_id or a.id = recipient_id)
    )
  );
create policy "connections: member request" on public.connections
  for insert with check (
    public.is_approved_member() and status = 'pending' and exists (
      select 1 from public.alumni a where a.user_id = auth.uid() and a.id = requester_id
    )
  );
create policy "connections: participant update" on public.connections
  for update using (
    public.is_admin() or exists (
      select 1 from public.alumni a
      where a.user_id = auth.uid() and (a.id = requester_id or a.id = recipient_id)
    )
  );
create policy "connections: participant delete" on public.connections
  for delete using (
    public.is_admin() or exists (
      select 1 from public.alumni a
      where a.user_id = auth.uid() and (a.id = requester_id or a.id = recipient_id)
    )
  );

-- Notifications: recipient member or broadcast (alumni_id is null for approved members).
create policy "notifications: owner read" on public.notifications
  for select using (
    public.is_admin()
    or (alumni_id is null and public.is_approved_member())
    or exists (select 1 from public.alumni a where a.id = alumni_id and a.user_id = auth.uid())
  );
create policy "notifications: owner update" on public.notifications
  for update using (
    public.is_admin()
    or exists (select 1 from public.alumni a where a.id = alumni_id and a.user_id = auth.uid())
  );
create policy "notifications: admin write" on public.notifications
  for all using (public.is_admin()) with check (public.is_admin());

-- Archive Categories & Archive Items: public NEVER sees unapproved archive items.
create policy "archive_categories: public read" on public.archive_categories for select using (true);
create policy "archive_categories: admin write" on public.archive_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "archive_items: public read approved only" on public.archive_items
  for select using (status = 'approved' or public.is_admin() or submitted_by_user_id = auth.uid());
create policy "archive_items: member submit" on public.archive_items
  for insert with check (public.is_approved_member() and status = 'pending' and permission_confirmed = true);
create policy "archive_items: admin write" on public.archive_items
  for all using (public.is_admin()) with check (public.is_admin());

-- Story Categories & Stories: public NEVER sees unapproved/unpublished stories.
create policy "story_categories: public read" on public.story_categories for select using (true);
create policy "story_categories: admin write" on public.story_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "stories: public read published only" on public.stories
  for select using (status = 'published' or public.is_admin() or submitted_by_user_id = auth.uid());
create policy "stories: member submit" on public.stories
  for insert with check (public.is_approved_member() and status in ('draft', 'submitted'));
create policy "stories: admin write" on public.stories
  for all using (public.is_admin()) with check (public.is_admin());

-- Mentors & Mentorship Requests: public reads ONLY approved mentors; requests are strictly private.
create policy "mentors: public read approved only" on public.mentors
  for select using (status = 'approved' or public.is_admin() or submitted_by_user_id = auth.uid());
create policy "mentors: member register" on public.mentors
  for insert with check (public.is_approved_member() and status = 'pending');
create policy "mentors: admin write" on public.mentors
  for all using (public.is_admin()) with check (public.is_admin());

create policy "mentorship_requests: participant or admin read" on public.mentorship_requests
  for select using (
    public.is_admin()
    or mentee_user_id = auth.uid()
    or exists (
      select 1 from public.mentors m
      join public.alumni a on a.id = m.alumni_id
      where m.id = mentor_id and a.user_id = auth.uid()
    )
  );
create policy "mentorship_requests: member create" on public.mentorship_requests
  for insert with check (public.is_approved_member() and status = 'pending');
create policy "mentorship_requests: mentor or admin respond" on public.mentorship_requests
  for update using (
    public.is_admin()
    or exists (
      select 1 from public.mentors m
      join public.alumni a on a.id = m.alumni_id
      where m.id = mentor_id and a.user_id = auth.uid()
    )
  );

-- Admin Audit Logs & Site Settings: strictly admin only.
create policy "admin_audit_logs: admin read" on public.admin_audit_logs for select using (public.is_admin());
create policy "admin_audit_logs: admin insert" on public.admin_audit_logs for insert with check (public.is_admin());

create policy "site_settings: public read" on public.site_settings for select using (true);
create policy "site_settings: admin write" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
