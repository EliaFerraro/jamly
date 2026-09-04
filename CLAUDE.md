# Jamly — project context

Jamly is a mobile app (iOS, Android, tablet; web later) for musicians and bands.
Solo, part-time project. Currently at **v0.0 — foundation**: documentation complete,
app skeleton runs, no real features yet.

## Read these before doing anything substantial

| Question | Document |
|---|---|
| What are we building and why? | [docs/business/01-vision.md](docs/business/01-vision.md) |
| What is in scope right now? | [docs/product/11-mvp-scope.md](docs/product/11-mvp-scope.md) |
| What are the nouns? | [docs/product/13-domain-model.md](docs/product/13-domain-model.md) |
| How is it built? | [docs/tech/30-architecture.md](docs/tech/30-architecture.md) |
| Code rules | [docs/tech/33-conventions.md](docs/tech/33-conventions.md) |
| Why is it like this? | [docs/tech/adr/](docs/tech/adr/README.md) |

`docs/README.md` is the index.

## The five things most likely to be got wrong

1. **Scope.** The vision covers six pillars; v0.1 builds ONE — the rehearsal-to-gig
   loop. New feature ideas go into `docs/product/10-feature-inventory.md`, never
   straight into the code. Scope collapse is the project's number-one risk.
2. **Screens never import the Supabase client.** All data access goes through
   `src/features/<feature>/api/`. No exceptions.
3. **No public chart library, ever.** All user content is band-private. This is a
   legal position with real precedent behind it — see
   [ADR-0007](docs/tech/adr/0007-copyright-user-generated-charts-only.md). If asked to
   add cross-band chart sharing, the answer is no.
4. **Design for the passive band member**, not the band leader. Any feature that helps
   the leader but adds friction for the drummer is a net negative.
5. **Musicians' words, not software words.** Setlist, chart, repertoire, gig, load-in.
   Never playlist, document, booking, task, item.

## Stack

Expo SDK 57 (RN 0.86, React 19.2) · TypeScript strict · Expo Router · Zustand ·
TanStack Query · Supabase (Postgres + Auth + Realtime + Storage, RLS as the security
boundary) · expo-sqlite for the offline cache.

Full list and rationale: [docs/tech/31-stack.md](docs/tech/31-stack.md). **Do not add a
dependency that isn't justified there.**

## Layout

```
app/          Expo Router routes — thin, composition only
src/
  components/ shared UI kit
  features/   vertical slices: auth, band, repertoire, events, setlist, me
  lib/        supabase client, entitlements, utils
  theme/      design tokens — no literal hex or magic numbers in styles
  types/      domain types mirroring 13-domain-model.md
```

**Backend:** Supabase Cloud only — no local stack, no Docker, no WSL (D27). The
database currently has **no tables**; each arrives with the feature that needs
it. When the first migration is needed, `supabase init` recreates `supabase/`,
and the original full schema sits in git at `88b39e7` to crib from a table at a
time.

**Current state of the app:** one screen, `app/index.tsx`, reporting whether the
device can reach the database. The tab skeleton was removed (D29).

## Commands

```
npm start           # Expo dev server
npm run typecheck   # tsc --noEmit
npm run lint
npm test
```

## Recording decisions

Significant technical decisions → a new ADR in `docs/tech/adr/` (never edit an existing
one; supersede it). Everything smaller → `docs/process/41-decision-log.md`. A decision
that isn't written down is lost by the next session.
