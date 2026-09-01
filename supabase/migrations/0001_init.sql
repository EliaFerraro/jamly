-- Jamly v0.1 — initial schema
--
-- Implements docs/tech/32-data-model.md and docs/product/13-domain-model.md.
-- When this file and those documents disagree, THIS FILE is the truth.
--
-- Migrations are forward-only and never edited after being applied to
-- production. Never change the schema in the Supabase dashboard: untracked
-- drift is how a solo project loses the ability to reason about its database.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

-- 'free_unlimited' is every Phase 1 user. The other values exist so that
-- switching on an individual Pro tier later is configuration, not a migration
-- of live data (ADR-0005).
create type user_plan         as enum ('free_unlimited', 'free', 'pro');
create type member_role       as enum ('leader', 'member');
create type song_status       as enum ('learning', 'rehearsing', 'ready', 'retired');
create type chart_kind        as enum ('pdf', 'image', 'chordpro');
create type event_type        as enum ('rehearsal', 'gig');
create type attendance_status as enum ('yes', 'no', 'maybe', 'unanswered');
create type setlist_item_kind as enum ('song', 'break', 'set_marker');

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  display_name          text,
  avatar_url            text,
  plan                  user_plan   not null default 'free_unlimited',
  -- Enforces the migration rule in code, not just in good intentions:
  -- nothing a user already has ever becomes paid.
  plan_grandfathered_at timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- Create a profile automatically whenever an auth user is created, so the app
-- never has to deal with a signed-in user who has no profile row.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- bands
-- ---------------------------------------------------------------------------

-- Only `name` is required. Every extra required field is friction on the
-- fastest path to value (docs/design/20-design-principles.md, Rule 2).
create table bands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) > 0),
  invite_code text not null unique default encode(gen_random_bytes(9), 'base64'),
  created_by  uuid not null references profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index bands_invite_code_idx on bands (invite_code);

create trigger bands_updated_at before update on bands
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- band_members
--
-- The most important table in the schema: every RLS policy resolves through
-- it, so its indexes matter for correctness AND performance.
-- ---------------------------------------------------------------------------

create table band_members (
  id          uuid primary key default gen_random_uuid(),
  band_id     uuid not null references bands(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        member_role not null default 'member',
  -- text[], not an enum: musicians play things we didn't anticipate, and
  -- "vox + rhythm guitar + occasional harmonica" has to be expressible.
  instruments text[] not null default '{}',
  joined_at   timestamptz not null default now(),
  unique (band_id, user_id)
);

create index band_members_user_idx on band_members (user_id);
create index band_members_band_idx on band_members (band_id);

-- ---------------------------------------------------------------------------
-- songs
--
-- Band-scoped, NOT a global catalogue. Two bands playing "Superstition" have
-- two rows. Costs some duplication, buys enormous simplicity, and keeps every
-- chart inside a private band boundary (ADR-0007).
-- ---------------------------------------------------------------------------

create table songs (
  id               uuid primary key default gen_random_uuid(),
  band_id          uuid not null references bands(id) on delete cascade,
  title            text not null check (length(trim(title)) > 0),
  artist           text,
  -- Text, not an enum: "Bb", "Am", "D dorian".
  song_key         text,
  tempo_bpm        int check (tempo_bpm between 20 and 400),
  duration_seconds int check (duration_seconds > 0),
  status           song_status not null default 'learning',
  -- BAND-SHARED notes (arrangement, cues, endings). The private ones live in
  -- song_personal and are a different thing entirely.
  notes            text,
  created_by       uuid references profiles(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index songs_band_idx        on songs (band_id);
create index songs_band_status_idx on songs (band_id, status);

create trigger songs_updated_at before update on songs
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- charts
-- ---------------------------------------------------------------------------

create table charts (
  id             uuid primary key default gen_random_uuid(),
  song_id        uuid not null references songs(id) on delete cascade,
  -- Denormalized deliberately: keeps the RLS policy a single-join lookup and
  -- makes per-band storage totals a trivial sum().
  band_id        uuid not null references bands(id) on delete cascade,
  kind           chart_kind not null,
  -- Private bucket path. NEVER a public URL (ADR-0007).
  storage_path   text not null,
  title          text,
  for_instrument text,
  -- Recorded from the very first upload while storage is still unlimited:
  -- you cannot price what you never measured (ADR-0005).
  size_bytes     bigint not null default 0,
  uploaded_by    uuid references profiles(id),
  created_at     timestamptz not null default now()
);

create index charts_song_idx on charts (song_id);
create index charts_band_idx on charts (band_id);

-- ---------------------------------------------------------------------------
-- song_personal — THE SEAM
--
-- Small table, largest strategic weight in the schema. It is what makes Jamly
-- structurally different from every competitor: the band layer and the
-- personal layer on one object (docs/business/02-market-and-competitors.md).
-- ---------------------------------------------------------------------------

create table song_personal (
  id         uuid primary key default gen_random_uuid(),
  song_id    uuid not null references songs(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  -- Visible to exactly one user. Bandmates are included in "no one else".
  notes      text,
  -- Unused by the v0.1 UI. Modelled now because v0.2's practice list and
  -- readiness view are built on it.
  confidence int check (confidence between 1 and 5),
  updated_at timestamptz not null default now(),
  unique (song_id, user_id)
);

create index song_personal_user_idx on song_personal (user_id);

create trigger song_personal_updated_at before update on song_personal
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- events
--
-- Rehearsals and gigs are one entity with a type: they share every field that
-- matters, and splitting them would double the code for no gain.
-- ---------------------------------------------------------------------------

create table events (
  id            uuid primary key default gen_random_uuid(),
  band_id       uuid not null references bands(id) on delete cascade,
  type          event_type not null,
  title         text,
  -- Always timestamptz: bands travel, and a 21:00 gig must survive the trip.
  starts_at     timestamptz not null,
  ends_at       timestamptz,
  venue_name    text,
  venue_address text,
  load_in_at    timestamptz,
  notes         text,
  -- v0.3. Modelled now so the schema does not need reshaping later.
  fee_amount    numeric(10,2),
  fee_currency  char(3) default 'EUR',
  created_by    uuid references profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- The index behind the single most-used query in the app: the next event for
-- this band (story C2 — zero taps, first screen).
create index events_band_starts_idx on events (band_id, starts_at);

create trigger events_updated_at before update on events
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- event_attendance
-- ---------------------------------------------------------------------------

create table event_attendance (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  status     attendance_status not null default 'unanswered',
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index event_attendance_event_idx on event_attendance (event_id);

create trigger event_attendance_updated_at before update on event_attendance
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- setlists
-- ---------------------------------------------------------------------------

create table setlists (
  id         uuid primary key default gen_random_uuid(),
  band_id    uuid not null references bands(id) on delete cascade,
  -- set null, not cascade: deleting a gig must not destroy the set someone
  -- spent an hour building.
  event_id   uuid references events(id) on delete set null,
  name       text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index setlists_band_idx  on setlists (band_id);
create index setlists_event_idx on setlists (event_id);

create trigger setlists_updated_at before update on setlists
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- setlist_items
-- ---------------------------------------------------------------------------

create table setlist_items (
  id           uuid primary key default gen_random_uuid(),
  setlist_id   uuid not null references setlists(id) on delete cascade,
  -- restrict, not cascade: deleting a song that is in a setlist must fail
  -- loudly rather than silently corrupting a set (invariant 5).
  song_id      uuid references songs(id) on delete restrict,
  kind         setlist_item_kind not null default 'song',
  -- Plain int. Reordering rewrites positions in a transaction; with sets of
  -- 20-40 items, fractional indexing would be premature cleverness.
  position     int not null,
  set_number   int not null default 1,
  label        text,
  notes        text,
  override_key text,
  created_at   timestamptz not null default now(),
  check (kind <> 'song' or song_id is not null)
);

create index setlist_items_setlist_idx on setlist_items (setlist_id, position);

-- ---------------------------------------------------------------------------
-- Row-level security
--
-- RLS IS THE SECURITY BOUNDARY. The client is untrusted; a bug in the app must
-- not be able to leak another band's data (requirement N7). This is also what
-- makes the copyright position defensible (ADR-0007).
-- ---------------------------------------------------------------------------

alter table profiles         enable row level security;
alter table bands            enable row level security;
alter table band_members     enable row level security;
alter table songs            enable row level security;
alter table charts           enable row level security;
alter table song_personal    enable row level security;
alter table events           enable row level security;
alter table event_attendance enable row level security;
alter table setlists         enable row level security;
alter table setlist_items    enable row level security;

-- The one predicate every band-scoped policy reduces to.
create or replace function is_band_member(b uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from band_members
    where band_id = b and user_id = auth.uid()
  );
$$;

create or replace function is_band_leader(b uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from band_members
    where band_id = b and user_id = auth.uid() and role = 'leader'
  );
$$;

-- profiles: read your own, plus bandmates (needed to show who is in the band).
create policy "read own profile" on profiles
  for select using (id = auth.uid());
create policy "read bandmate profiles" on profiles
  for select using (
    exists (
      select 1 from band_members mine
      join band_members theirs on theirs.band_id = mine.band_id
      where mine.user_id = auth.uid() and theirs.user_id = profiles.id
    )
  );
create policy "update own profile" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- bands
create policy "members read band"   on bands for select using (is_band_member(id));
create policy "any user create band" on bands for insert with check (created_by = auth.uid());
create policy "leaders update band" on bands for update using (is_band_leader(id));
create policy "leaders delete band" on bands for delete using (is_band_leader(id));

-- band_members
create policy "members read roster" on band_members
  for select using (is_band_member(band_id));
create policy "leaders manage roster" on band_members
  for delete using (is_band_leader(band_id) or user_id = auth.uid());
create policy "leaders update roster" on band_members
  for update using (is_band_leader(band_id));
-- The band creator inserts their own leader row; everyone else joins through
-- join_band_by_code() below.
create policy "self insert membership" on band_members
  for insert with check (user_id = auth.uid());

-- songs / charts / events / setlists: read+write for members, delete for leaders.
create policy "members read songs"   on songs for select using (is_band_member(band_id));
create policy "members write songs"  on songs for insert with check (is_band_member(band_id));
create policy "members update songs" on songs for update using (is_band_member(band_id));
create policy "leaders delete songs" on songs for delete using (is_band_leader(band_id));

create policy "members read charts"   on charts for select using (is_band_member(band_id));
create policy "members write charts"  on charts for insert with check (is_band_member(band_id));
create policy "members delete charts" on charts for delete using (is_band_member(band_id));

create policy "members read events"   on events for select using (is_band_member(band_id));
create policy "members write events"  on events for insert with check (is_band_member(band_id));
create policy "members update events" on events for update using (is_band_member(band_id));
create policy "leaders delete events" on events for delete using (is_band_leader(band_id));

create policy "members read attendance" on event_attendance
  for select using (
    exists (select 1 from events e where e.id = event_id and is_band_member(e.band_id))
  );
create policy "own attendance write" on event_attendance
  for insert with check (user_id = auth.uid());
create policy "own attendance update" on event_attendance
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "members read setlists"   on setlists for select using (is_band_member(band_id));
create policy "members write setlists"  on setlists for insert with check (is_band_member(band_id));
create policy "members update setlists" on setlists for update using (is_band_member(band_id));
create policy "leaders delete setlists" on setlists for delete using (is_band_leader(band_id));

create policy "members read setlist items" on setlist_items
  for select using (
    exists (select 1 from setlists s where s.id = setlist_id and is_band_member(s.band_id))
  );
create policy "members write setlist items" on setlist_items
  for all using (
    exists (select 1 from setlists s where s.id = setlist_id and is_band_member(s.band_id))
  ) with check (
    exists (select 1 from setlists s where s.id = setlist_id and is_band_member(s.band_id))
  );

-- song_personal: the personal exception. Exactly one reader, ever.
create policy "own personal rows only" on song_personal
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- join_band_by_code
--
-- Joining needs a controlled path: a user who is not yet a member cannot be
-- granted read access to `bands` by the normal policy. This is the ONLY place
-- privilege is deliberately elevated, and it does exactly one thing.
-- ---------------------------------------------------------------------------

create or replace function join_band_by_code(code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  target_band uuid;
begin
  select id into target_band from bands where invite_code = code;

  if target_band is null then
    raise exception 'invalid invite code';
  end if;

  insert into band_members (band_id, user_id, role)
  values (target_band, auth.uid(), 'member')
  on conflict (band_id, user_id) do nothing;

  return target_band;
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage
--
-- Charts live in a PRIVATE bucket, path-namespaced by band, reachable only via
-- short-lived signed URLs issued to members. No public URLs, ever (ADR-0007).
-- Paths: band/{band_id}/song/{song_id}/{uuid}.{ext}
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('charts', 'charts', false)
on conflict (id) do nothing;

create policy "members read charts bucket" on storage.objects
  for select using (
    bucket_id = 'charts'
    and is_band_member(((storage.foldername(name))[2])::uuid)
  );

create policy "members upload charts bucket" on storage.objects
  for insert with check (
    bucket_id = 'charts'
    and is_band_member(((storage.foldername(name))[2])::uuid)
  );

create policy "members delete charts bucket" on storage.objects
  for delete using (
    bucket_id = 'charts'
    and is_band_member(((storage.foldername(name))[2])::uuid)
  );
