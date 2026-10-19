-- Jamly — bands and membership
--
-- The tables behind story A2 (create a band, get an invite link immediately)
-- and the join half of A3. They arrive with the feature that needs them (D28).
--
-- Implements the `bands` and `band_members` tables of docs/tech/32-data-model.md.
-- Where this file and that document disagree, THIS FILE is the truth. Two
-- deliberate divergences, both noted at the point they happen:
--   * the invite code is URL-safe by construction (the document's base64 emits
--     '+' and '/', which do not survive being pasted into a link)
--   * invite codes expire, because a link pasted into a group chat is a bearer
--     credential and a screenshot of one lasts forever otherwise
--
-- `band_members` is the most important table in the schema: every band-scoped
-- row-level-security policy from here on resolves through it.
--
-- Forward-only: never edited once applied, and never changed in the dashboard.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- Leaders drive live sync and are the only ones who may delete shared rows.
-- Role lives on the MEMBERSHIP, not the band: a band may have several leaders,
-- and a musician may be a leader in one band and a member of another.
create type public.member_role as enum ('leader', 'member');

-- ---------------------------------------------------------------------------
-- Invite codes
-- ---------------------------------------------------------------------------

-- Derived from gen_random_uuid() rather than pgcrypto's gen_random_bytes():
-- it needs no extension, and hex is URL-safe, case-insensitive to read aloud
-- and free of the +/= that make base64 painful in a link and in a QR code.
--
-- 12 hex characters is 48 bits. Each guess costs a network round trip against
-- a rate-limited endpoint, and a code both expires and can be rotated, so the
-- guessing attack this needs to survive is not a realistic one. The reason a
-- code leaks is a forwarded screenshot, which no amount of entropy prevents —
-- that is what the expiry below is for.
create or replace function private.new_invite_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  candidate text;
begin
  for i in 1..10 loop
    candidate := substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
    exit when not exists (
      select 1 from public.bands where invite_code = candidate
    );
    candidate := null;
  end loop;

  if candidate is null then
    raise exception 'Could not generate a unique invite code.';
  end if;

  return candidate;
end;
$$;

-- Clients never mint codes: no grant to anon or authenticated, here or below.

-- ---------------------------------------------------------------------------
-- bands
-- ---------------------------------------------------------------------------

create table public.bands (
  id                uuid primary key default gen_random_uuid(),
  -- The only field required for a band to exist. Every other attribute (genre,
  -- logo, description) is a field a musician must fill before getting any
  -- value, and is deliberately absent (R2).
  name              text not null check (length(btrim(name)) between 1 and 80),
  -- Unique already builds the index the join lookup needs; the separate index
  -- in 32-data-model.md would be a duplicate.
  invite_code       text not null unique default private.new_invite_code(),
  -- A link in a group chat is a bearer credential: whoever holds it is in.
  -- Expiry is what stops a screenshot from six months ago still working.
  invite_expires_at timestamptz not null default (now() + interval '7 days'),
  created_by        uuid not null references public.profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create trigger bands_updated_at
  before update on public.bands
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- band_members
-- ---------------------------------------------------------------------------

create table public.band_members (
  id          uuid primary key default gen_random_uuid(),
  band_id     uuid not null references public.bands(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        public.member_role not null default 'member',
  -- text[], not an enum: musicians play things we did not anticipate, and
  -- "vox + rhythm guitar + occasional harmonica" has to be expressible.
  instruments text[] not null default '{}',
  joined_at   timestamptz not null default now(),
  unique (band_id, user_id)
);

-- Both directions are hot: "which bands am I in" on every cold start, and
-- "who is in this band" inside every policy.
create index band_members_user_id_idx on public.band_members (user_id);
create index band_members_band_id_idx on public.band_members (band_id);

-- ---------------------------------------------------------------------------
-- The core predicate
-- ---------------------------------------------------------------------------

-- security definer is not a convenience here, it is the whole point: a policy
-- on band_members that selected from band_members would recurse forever. The
-- definer runs as the owner, for whom row-level security does not apply, which
-- breaks the cycle.
create or replace function private.is_band_member(b uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
      from public.band_members
     where band_id = b
       and user_id = (select auth.uid())
  );
$$;

create or replace function private.is_band_leader(b uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
      from public.band_members
     where band_id = b
       and user_id = (select auth.uid())
       and role = 'leader'
  );
$$;

-- A function called inside a policy is executed by the querying role, so
-- `authenticated` needs to reach these two. This does NOT undo D40: PostgREST
-- exposes only the `public` schema, so nothing in `private` is an endpoint —
-- it just stops being invisible to the policy evaluator.
grant usage on schema private to authenticated;
grant execute on function private.is_band_member(uuid) to authenticated;
grant execute on function private.is_band_leader(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Authorization
-- ---------------------------------------------------------------------------

alter table public.bands enable row level security;
alter table public.band_members enable row level security;

revoke all on table public.bands from anon, authenticated;
revoke all on table public.band_members from anon, authenticated;

grant select on table public.bands to authenticated;
grant select on table public.band_members to authenticated;

-- Column-level, the same reasoning as `profiles.plan` (D38): the policy says
-- which ROW may be written, the grant says which COLUMNS. Without this a
-- member could write their own invite_code, or hand themselves 'leader'.
grant update (name) on table public.bands to authenticated;
grant update (instruments) on table public.band_members to authenticated;
grant delete on table public.band_members to authenticated;

create policy "members read their bands"
  on public.bands for select
  to authenticated
  using (private.is_band_member(id));

create policy "leaders rename their band"
  on public.bands for update
  to authenticated
  using (private.is_band_leader(id))
  with check (private.is_band_leader(id));

-- No insert policy: a band is only ever born through create_band() below, so
-- that it cannot exist for a moment without the leader who owns it. No delete
-- policy: deleting a band is not in v0.1 (see docs/design/21-information-
-- architecture.md — BandSettings is name, invite link, leave).

create policy "members read the roster"
  on public.band_members for select
  to authenticated
  using (private.is_band_member(band_id));

-- A4: what I play is mine to say. Role is not writable from the client at all.
create policy "members edit their own instruments"
  on public.band_members for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Leaving, and the other half of the invite-link threat model: a leader who
-- sees someone they did not invite can remove them.
create policy "leave, or be removed by a leader"
  on public.band_members for delete
  to authenticated
  using (user_id = (select auth.uid()) or private.is_band_leader(band_id));

-- ---------------------------------------------------------------------------
-- Invariant 6 — every band keeps at least one leader
-- ---------------------------------------------------------------------------

-- Scoped to deletions the APP asks for. A cascade — the band itself going, or
-- an account being deleted in the dashboard — must not be blocked by this, or
-- cleaning up a test account would fail with a message about band leadership.
-- Referential cascades run after the parent row is already gone, which is what
-- makes the two existence checks below a reliable way to tell the cases apart.
create or replace function private.forbid_removing_last_leader()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.bands where id = old.band_id) then
    return old;  -- the band is being deleted; the roster goes with it
  end if;

  if not exists (select 1 from public.profiles where id = old.user_id) then
    return old;  -- the account is being deleted; this is cleanup, not leaving
  end if;

  if old.role = 'leader' and not exists (
    select 1
      from public.band_members
     where band_id = old.band_id
       and role = 'leader'
       and id <> old.id
  ) then
    raise exception 'A band must keep at least one leader.'
      using errcode = 'restrict_violation';
  end if;

  return old;
end;
$$;

create trigger band_members_keep_a_leader
  before delete on public.band_members
  for each row execute function private.forbid_removing_last_leader();

-- ---------------------------------------------------------------------------
-- create_band — story A2
-- ---------------------------------------------------------------------------

-- Deliberately exposed as an endpoint, unlike the trigger functions D40 moved
-- out of `public`: this one is meant to be called by the app. It is security
-- definer because it does one thing the caller cannot do for themselves —
-- create a band and its first membership in a single transaction.
--
-- Atomicity is the entire reason this is not two client inserts. The read
-- policy on `bands` resolves through `band_members`, so a band inserted
-- without its membership row would be invisible to the person who just made
-- it, and would violate invariant 6 from the moment it existed.
create or replace function public.create_band(band_name text)
returns public.bands
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid     uuid := (select auth.uid());
  trimmed text := btrim(coalesce(band_name, ''));
  created public.bands;
begin
  if uid is null then
    raise exception 'You must be signed in to create a band.'
      using errcode = '28000';
  end if;

  if trimmed = '' then
    raise exception 'A band needs a name.'
      using errcode = '22023';
  end if;

  insert into public.bands (name, invite_code, created_by)
  values (trimmed, private.new_invite_code(), uid)
  returning * into created;

  insert into public.band_members (band_id, user_id, role)
  values (created.id, uid, 'leader');

  return created;
end;
$$;

-- ---------------------------------------------------------------------------
-- join_band_by_code — story A3
-- ---------------------------------------------------------------------------

-- The one place where privilege is deliberately elevated for a non-member: a
-- user who is not yet in the band cannot be granted read access to `bands` by
-- the normal policy, so the lookup has to happen somewhere they cannot see.
-- It does exactly one thing, and it returns a status rather than raising, so
-- that a mistyped code is an answer the join screen can render in words.
--
-- Joining twice is 'already_member', not an error: tapping the link a second
-- time is something people do, and the 30-second budget has no room for a
-- dead end that was really a success.
create or replace function public.join_band_by_code(code text)
returns table (status text, band_id uuid, band_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  b   public.bands;
begin
  if uid is null then
    raise exception 'You must be signed in to join a band.'
      using errcode = '28000';
  end if;

  select * into b
    from public.bands
   where invite_code = btrim(coalesce(code, ''));

  if b.id is null then
    return query select 'invalid'::text, null::uuid, null::text;
    return;
  end if;

  -- Expired is told apart from invalid on purpose. Learning that some code you
  -- already hold has expired is worth nothing to an attacker, and it is the
  -- difference between "ask your band leader for a new link" and a dead end.
  if b.invite_expires_at <= now() then
    return query select 'expired'::text, null::uuid, null::text;
    return;
  end if;

  if exists (
    select 1 from public.band_members
     where band_members.band_id = b.id and user_id = uid
  ) then
    return query select 'already_member'::text, b.id, b.name;
    return;
  end if;

  insert into public.band_members (band_id, user_id, role)
  values (b.id, uid, 'member');

  return query select 'joined'::text, b.id, b.name;
end;
$$;

-- ---------------------------------------------------------------------------
-- rotate_invite_code — what a leader does when a link gets out
-- ---------------------------------------------------------------------------

create or replace function public.rotate_invite_code(band uuid)
returns public.bands
language plpgsql
security definer
set search_path = ''
as $$
declare
  b public.bands;
begin
  if not private.is_band_leader(band) then
    raise exception 'Only a leader can reset the invite link.'
      using errcode = '42501';
  end if;

  update public.bands
     set invite_code       = private.new_invite_code(),
         invite_expires_at = now() + interval '7 days'
   where id = band
   returning * into b;

  return b;
end;
$$;

-- ---------------------------------------------------------------------------
-- band_roster — who is in this band
-- ---------------------------------------------------------------------------

-- `profiles` is readable only by its owner (D38), so one member cannot read
-- another's row and the member list cannot be a join. Rather than widening
-- that policy to everyone who shares a band — which would hand every bandmate
-- every other bandmate's email address — the roster comes back through a
-- function that returns names and instruments and no contact details at all.
create or replace function public.band_roster(band uuid)
returns table (
  user_id      uuid,
  display_name text,
  role         public.member_role,
  instruments  text[],
  joined_at    timestamptz
)
language sql
security definer
stable
set search_path = ''
as $$
  select m.user_id, p.display_name, m.role, m.instruments, m.joined_at
    from public.band_members m
    join public.profiles p on p.id = m.user_id
   where m.band_id = band
     and private.is_band_member(band)
   order by m.joined_at;
$$;

-- ---------------------------------------------------------------------------
-- Who may call these
-- ---------------------------------------------------------------------------

-- A security definer function is PUBLIC-executable by default, which would let
-- anyone holding the publishable key call it without a session. Take it back
-- and hand it to signed-in users only.
revoke all on function public.create_band(text) from public, anon;
revoke all on function public.join_band_by_code(text) from public, anon;
revoke all on function public.rotate_invite_code(uuid) from public, anon;
revoke all on function public.band_roster(uuid) from public, anon;

grant execute on function public.create_band(text) to authenticated;
grant execute on function public.join_band_by_code(text) to authenticated;
grant execute on function public.rotate_invite_code(uuid) to authenticated;
grant execute on function public.band_roster(uuid) to authenticated;
