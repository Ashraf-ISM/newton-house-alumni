-- =====================================================================
--  NEWTON HOUSE — PATNA SCIENCE COLLEGE ALUMNI ASSOCIATION
--  Additive migration: About Page, Superintendents, Heritage Timeline,
--  Alumni Testimonials & Association Leadership
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Superintendents of Newton House (Current & Former)
-- ---------------------------------------------------------------------
create table if not exists public.superintendents (
  id                  uuid primary key default gen_random_uuid(),
  full_name           text not null,
  designation         text not null default 'Former Superintendent, Newton House',
  profile_image       text,
  tenure_start        text,
  tenure_end          text,
  tenure_period_label text not null,
  is_current          boolean not null default false,
  biography           text not null,
  academic_background text,
  contributions       text not null,
  personal_message    text,
  display_order       int  not null default 10,
  is_published        boolean not null default true,
  is_placeholder      boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists superintendents_order_idx
  on public.superintendents (is_current desc, display_order asc);

drop trigger if exists superintendents_updated_at on public.superintendents;
create trigger superintendents_updated_at before update on public.superintendents
  for each row execute function public.set_updated_at();

-- Automatically transition any previous current superintendent to former
-- when a new superintendent is marked `is_current = true`, preserving all historical records.
create or replace function public.preserve_former_superintendent_on_current_change()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.is_current = true then
    update public.superintendents
       set is_current = false,
           designation = case
             when lower(designation) like '%current superintendent%' then 'Former Superintendent, Newton House'
             else designation
           end,
           tenure_end = case
             when tenure_end is null or lower(tenure_end) = 'present' then coalesce(new.tenure_start, tenure_end)
             else tenure_end
           end,
           updated_at = now()
     where id <> new.id and is_current = true;
  end if;
  return new;
end $$;

drop trigger if exists superintendents_single_current on public.superintendents;
create trigger superintendents_single_current
  before insert or update of is_current on public.superintendents
  for each row when (new.is_current = true)
  execute function public.preserve_former_superintendent_on_current_change();

-- ---------------------------------------------------------------------
-- 2. Heritage Timeline Milestones
-- ---------------------------------------------------------------------
create table if not exists public.heritage_milestones (
  id                    uuid primary key default gen_random_uuid(),
  category              text not null check (
    category in (
      'The Early Years',
      'Growing Together',
      'New Generations',
      'A Changing Era',
      'Today & Beyond'
    )
  ),
  period_label          text,
  verified              boolean not null default false,
  title                 text not null,
  description           text not null,
  important_development text,
  image_url             text,
  image_alt             text,
  display_order         int  not null default 10,
  is_published          boolean not null default true,
  is_placeholder        boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists heritage_milestones_order_idx
  on public.heritage_milestones (display_order asc, category);

drop trigger if exists heritage_milestones_updated_at on public.heritage_milestones;
create trigger heritage_milestones_updated_at before update on public.heritage_milestones
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. Alumni Testimonials (Voices of Newton House)
-- ---------------------------------------------------------------------
create table if not exists public.alumni_testimonials (
  id                  uuid primary key default gen_random_uuid(),
  alumni_id           uuid references public.alumni (id) on delete set null,
  alumni_name         text not null,
  batch_year          text not null,
  department          text,
  designation         text,
  photo_url           text,
  quote               text not null check (char_length(quote) between 15 and 600),
  status              public.moderation_status not null default 'pending',
  is_published        boolean not null default false,
  is_sample           boolean not null default false,
  submitted_by_user   uuid references auth.users (id) on delete set null,
  submitted_by        text not null,
  submitted_at        timestamptz not null default now(),
  reviewed_by         uuid references auth.users (id) on delete set null,
  reviewed_at         timestamptz
);

create index if not exists alumni_testimonials_status_idx
  on public.alumni_testimonials (status, is_published, submitted_at desc);

-- ---------------------------------------------------------------------
-- 4. Association Leadership
-- ---------------------------------------------------------------------
create table if not exists public.association_leaders (
  id            uuid primary key default gen_random_uuid(),
  alumni_id     uuid references public.alumni (id) on delete set null,
  full_name     text not null,
  role          text not null check (
    role in (
      'President',
      'Vice President',
      'General Secretary',
      'Joint Secretary',
      'Treasurer',
      'Executive Committee Member',
      'Batch Representative',
      'Faculty Advisor'
    )
  ),
  batch_year    int,
  department    text,
  designation   text,
  photo_url     text,
  bio           text,
  display_order int  not null default 10,
  is_confirmed  boolean not null default false,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists association_leaders_order_idx
  on public.association_leaders (is_confirmed, is_published, display_order asc);

drop trigger if exists association_leaders_updated_at on public.association_leaders;
create trigger association_leaders_updated_at before update on public.association_leaders
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =====================================================================
alter table public.superintendents     enable row level security;
alter table public.heritage_milestones enable row level security;
alter table public.alumni_testimonials enable row level security;
alter table public.association_leaders enable row level security;

-- Superintendents: public reads published only; only authorised admins can write.
create policy "superintendents: public read published"
  on public.superintendents for select
  using (is_published = true or public.is_admin());

create policy "superintendents: admin write"
  on public.superintendents for all
  using (public.is_admin())
  with check (public.is_admin());

-- Heritage Milestones: public reads published only; only authorised admins can write.
create policy "heritage_milestones: public read published"
  on public.heritage_milestones for select
  using (is_published = true or public.is_admin());

create policy "heritage_milestones: admin write"
  on public.heritage_milestones for all
  using (public.is_admin())
  with check (public.is_admin());

-- Alumni Testimonials: public reads approved + published only; approved members can submit pending; admins manage all.
create policy "alumni_testimonials: public read approved"
  on public.alumni_testimonials for select
  using ((status = 'approved' and is_published = true) or public.is_admin() or submitted_by_user = auth.uid());

create policy "alumni_testimonials: member submit"
  on public.alumni_testimonials for insert
  with check (public.is_approved_member() and status = 'pending' and is_published = false);

create policy "alumni_testimonials: admin write"
  on public.alumni_testimonials for all
  using (public.is_admin())
  with check (public.is_admin());

-- Association Leaders: public reads confirmed + published only; only authorised admins can write.
create policy "association_leaders: public read confirmed"
  on public.association_leaders for select
  using ((is_confirmed = true and is_published = true) or public.is_admin());

create policy "association_leaders: admin write"
  on public.association_leaders for all
  using (public.is_admin())
  with check (public.is_admin());
