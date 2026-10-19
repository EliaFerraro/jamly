/**
 * Jamly domain types.
 *
 * These mirror docs/product/13-domain-model.md exactly, and the SQL schema in
 * supabase/migrations/0001_init.sql. The three must agree — when they diverge,
 * the migration is the truth.
 *
 * Names come from the ubiquitous language: a Setlist is never a Playlist, a
 * Chart is never a Document (docs/design/20-design-principles.md, Rule 5).
 *
 * Fields are camelCase here and snake_case in the database. The mapping happens
 * exactly once, in the repository layer.
 */

export type Uuid = string;
/** ISO-8601 with timezone. Bands travel; a 21:00 gig must survive the trip. */
export type Timestamp = string;

export type Plan = 'free_unlimited' | 'free' | 'pro';
export type MemberRole = 'leader' | 'member';
export type SongStatus = 'learning' | 'rehearsing' | 'ready' | 'retired';
export type ChartKind = 'pdf' | 'image' | 'chordpro';
export type EventType = 'rehearsal' | 'gig';
export type AttendanceStatus = 'yes' | 'no' | 'maybe' | 'unanswered';
export type SetlistItemKind = 'song' | 'break' | 'set_marker';

export type Profile = {
  id: Uuid;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  plan: Plan;
  /** Enforces the migration rule: nothing a user already has becomes paid. */
  planGrandfatheredAt: Timestamp;
  createdAt: Timestamp;
};

export type Band = {
  id: Uuid;
  /** The only field required for a band to exist. Everything else is friction. */
  name: string;
  inviteCode: string;
  /**
   * A link in a group chat is a bearer credential. Expiry is what stops a
   * forwarded screenshot from still working months later; a leader can rotate
   * the code at any time as well.
   */
  inviteExpiresAt: Timestamp;
  createdBy: Uuid;
  createdAt: Timestamp;
};

export type BandMember = {
  id: Uuid;
  bandId: Uuid;
  userId: Uuid;
  role: MemberRole;
  /** Free-form: musicians play things we didn't anticipate. */
  instruments: string[];
  joinedAt: Timestamp;
};

/** A song in a band's repertoire. Band-scoped, never a global catalogue entry. */
export type Song = {
  id: Uuid;
  bandId: Uuid;
  title: string;
  artist: string | null;
  /** Text, not an enum — "Bb", "Am", "D dorian" all have to be expressible. */
  songKey: string | null;
  tempoBpm: number | null;
  durationSeconds: number | null;
  status: SongStatus;
  /** BAND-SHARED notes: arrangement, cues, endings. Not the private ones. */
  notes: string | null;
  createdBy: Uuid | null;
  createdAt: Timestamp;
};

/** A file attached to a song. Always private to its band (ADR-0007). */
export type Chart = {
  id: Uuid;
  songId: Uuid;
  bandId: Uuid;
  kind: ChartKind;
  /** Private bucket path. Never a public URL. */
  storagePath: string;
  title: string | null;
  forInstrument: string | null;
  /** Recorded from the first upload: storage is the only real marginal cost. */
  sizeBytes: number;
  uploadedBy: Uuid | null;
  createdAt: Timestamp;
};

/**
 * The personal layer — one row per (song x user). Small table, largest
 * strategic weight in the schema: this is the seam the v0.2 practice features
 * and the entire long-term moat are built on.
 */
export type SongPersonal = {
  id: Uuid;
  songId: Uuid;
  userId: Uuid;
  /** Private to its owner. Bandmates are included in "no one else". */
  notes: string | null;
  /** 1-5, self-rated. Unused by the v0.1 UI; v0.2's practice list needs it. */
  confidence: number | null;
  updatedAt: Timestamp;
};

/** Rehearsals and gigs are one entity with a type — they share every field. */
export type BandEvent = {
  id: Uuid;
  bandId: Uuid;
  type: EventType;
  title: string | null;
  startsAt: Timestamp;
  endsAt: Timestamp | null;
  venueName: string | null;
  venueAddress: string | null;
  loadInAt: Timestamp | null;
  notes: string | null;
  /** v0.3. Modelled now so the schema doesn't need reshaping later. */
  feeAmount: number | null;
  feeCurrency: string | null;
  createdBy: Uuid | null;
  createdAt: Timestamp;
};

export type EventAttendance = {
  id: Uuid;
  eventId: Uuid;
  userId: Uuid;
  status: AttendanceStatus;
  updatedAt: Timestamp;
};

export type Setlist = {
  id: Uuid;
  bandId: Uuid;
  eventId: Uuid | null;
  name: string | null;
  createdBy: Uuid | null;
  updatedAt: Timestamp;
};

/**
 * A position in a setlist. Breaks are items too — that is what makes the
 * running-time arithmetic work.
 */
export type SetlistItem = {
  id: Uuid;
  setlistId: Uuid;
  songId: Uuid | null;
  kind: SetlistItemKind;
  position: number;
  setNumber: number;
  label: string | null;
  notes: string | null;
  /** When the song is played in a different key tonight. */
  overrideKey: string | null;
};

/**
 * Live sync state. EPHEMERAL — carried on a realtime broadcast channel, never
 * written to the database. Losing a live session must never touch durable data
 * (ADR-0004, invariant 7).
 */
export type LiveSession = {
  eventId: Uuid;
  currentItemId: Uuid | null;
  driverUserId: Uuid;
  updatedAt: Timestamp;
};
