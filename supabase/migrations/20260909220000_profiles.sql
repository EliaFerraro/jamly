-- Jamly — profiles
--
-- The first table. It arrives with the feature that needs it (D28): sign-in
-- (ADR-0008) produces an authenticated user, and this is the row the app reads
-- back to prove that user is really who Postgres thinks they are.
--
-- Implements the `profiles` table of docs/tech/32-data-model.md. When this file
-- and that document disagree, THIS FILE is the truth.
--
-- Forward-only: never edited once applied, and never changed in the dashboard.
-- Untracked drift is how a solo project loses the ability to reason about its
-- own database.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Everyone in Phase 1 is 'free_unlimited'. The other values exist now so that
-- switching on an individual Pro tier later is configuration rather than a
-- migration of live data (ADR-0005).
create type public.user_plan as enum ('free_unlimited', 'free', 'pro');

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
-- An empty search_path means every name below must be schema-qualified, so a
-- table planted in a schema earlier on someone's path cannot be hit instead.
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

-- Mirrors auth.users with the app-level fields. Supabase owns auth.users and we
-- never write to it directly.
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text        not null,
  display_name          text,
  avatar_url            text,
  plan                  public.user_plan not null default 'free_unlimited',
  -- Enforces the migration rule in the schema rather than in good intentions:
  -- nothing a user already has ever becomes paid.
  plan_grandfathered_at timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Authorization
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

-- Supabase grants anon and authenticated broad access to new public tables by
-- default. Take it all back and hand out only what the app needs.
revoke all on table public.profiles from anon, authenticated;

grant select on table public.profiles to authenticated;

-- Column-level, so that a client holding a perfectly valid session still cannot
-- write `plan` and promote itself to Pro. The policy decides which ROW; this
-- decides which COLUMNS, and the difference matters the moment money is
-- involved (ADR-0005).
grant update (display_name, avatar_url) on table public.profiles to authenticated;

-- auth.uid() is wrapped in a select so Postgres evaluates it once per query
-- instead of once per row — the standard Supabase RLS performance shape.
create policy "own profile is readable"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "own profile is editable"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No insert and no delete policy, deliberately: a profile appears with its auth
-- user (the trigger below) and disappears with it (on delete cascade). A client
-- has no business creating or destroying identities.

-- ---------------------------------------------------------------------------
-- Keeping profiles in step with auth.users
-- ---------------------------------------------------------------------------

-- Without this, a user created in the dashboard is signed in but invisible to
-- the app, which is a confusing half-state to debug.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
-- security definer because the inserting role is GoTrue's, which has no rights
-- on public.profiles — by design.
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- A changed address must not leave the app showing the old one forever.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
     set email = new.email
   where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (new.email is distinct from old.email)
  execute function public.handle_user_email_change();

-- ---------------------------------------------------------------------------
-- Backfill
-- ---------------------------------------------------------------------------

-- Any account that already exists — the first one is created by hand before
-- this migration runs — gets its profile here rather than needing a re-signup.
insert into public.profiles (id, email)
select id, email
  from auth.users
 where email is not null
    on conflict (id) do nothing;
