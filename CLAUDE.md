# Jamly — project context

Jamly is a mobile app (iOS, Android, tablet; web later) for musicians and bands.
Solo, part-time project. Currently building **v0.1 — the band loop**, Epic A
(getting the band in): sign-in and bands (create, invite by link, join by code) exist.

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

**Backend:** Supabase Cloud only — no local stack, no Docker, no WSL (D27). Tables
arrive with the feature that needs them (D28); the original full schema sits in
git at `88b39e7` to crib from a table at a time. So far: **`profiles`** and
**`bands`**, in `supabase/migrations/`. Elia applies them with `npx supabase link` then
`npx supabase db push` — never by editing the schema in the dashboard, and never by an
agent (see below).

**Current state of the app:** behind an auth gate. `app/(auth)/sign-in.tsx` is all an
unauthenticated device can reach. `app/index.tsx` is BandHome: your band and its
roster, or create/join if you have none. `app/band/` creates a band and shares the
invite; `app/join/[code].tsx` is the invite link's landing route. Sign-in is email +
password with sign-up disabled — accounts are created by hand in the dashboard
(ADR-0008).

## Commands

```
npm start           # Expo dev server
npm run typecheck   # tsc --noEmit
npm run lint
npm test
```

## Working as an agent

These hold whenever you work on your own, for example in a cloud session started from
an issue.

- **One issue, one branch, one PR.** Branch `<type>/<issue>-<slug>`, e.g.
  `feat/12-setlist-order`, cut from `dev`. Open the PR against `dev`; never merge it,
  and never push to `dev`, `staging` or `main` (they flow dev → staging → main, and
  promoting between them is Elia's).
- **Never touch the live Supabase project.** No `supabase db push`, `config push`,
  `link`, or anything else that writes to the cloud. Write the migration file under
  `supabase/migrations/` and say in the PR that it needs applying; Elia applies it.
  The cloud session has no Supabase credentials, by design.
- **No EAS builds or submissions.** Those are Elia's, from his machine.
- **Product questions stop you.** If the issue doesn't settle a product choice (scope,
  wording, who sees what), don't guess: ask in the PR and stop. Ideas you have along
  the way go to `docs/product/10-feature-inventory.md`, not into the code.
- **Expo docs:** read the v57 docs (see `AGENTS.md`). APIs changed; memory is wrong.

## Definition of done

Full list in [33-conventions](docs/tech/33-conventions.md#definition-of-done). Who holds
each line:

- Typecheck, lint, tests pass: `npm run typecheck && npm run lint && npm test` *(you,
  before saying done; CI on the PR)*
- New logic has a test where a test is meaningful *(you)*
- Decisions written to the decision log or an ADR, contradicted docs updated in the
  same PR *(you write them; Elia checks in review)*
- Works on iOS **and** Android, read paths work offline, legible in the dark *(Elia, on
  real devices — a cloud session can't check these, so don't claim them; list in the
  PR what he should try)*

## Recording decisions

Significant technical decisions → a new ADR in `docs/tech/adr/` (never edit an existing
one; supersede it). Everything smaller → `docs/process/41-decision-log.md`. A decision
that isn't written down is lost by the next session.
