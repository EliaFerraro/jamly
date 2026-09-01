# 0002 — Supabase + Postgres as the backend

**Status:** Accepted
**Date:** 2026-09-01

## Context

Jamly needs, from v0.1: authentication, a shared multi-tenant database (bands isolated from each other), file storage for charts, and realtime messaging for live setlist sync.

Deciding forces:
- **The data is unambiguously relational.** Bands have members, songs, events; setlists reference songs; personal rows reference both a song and a user. Every query is a join.
- **Security is not optional.** A member of band A must never reach band B's data ([N7](../../product/11-mvp-scope.md)) — and files are copyrighted material in a private space ([ADR-0007](0007-copyright-user-generated-charts-only.md)).
- **Realtime is a core feature**, not an add-on ([story E2](../../product/11-mvp-scope.md)).
- **The developer wants genuine fullstack learning** ([01-vision §7](../../business/01-vision.md)) — SQL, schema design and authorization are the skills worth acquiring.
- **Operating infrastructure is not the point of this project.** Time spent on servers is time not spent on the product.

## Decision

Use **Supabase** — managed **PostgreSQL**, Auth, Realtime, and Storage — with **row-level security as the authorization boundary**.

**No custom backend server in v0.1.** The client talks to Supabase directly; RLS policies enforce access. Edge Functions are added later only when something genuinely cannot be expressed as a query plus a policy.

Schema is managed as **versioned SQL migrations** in `supabase/migrations/`, applied via the CLI. Never edited in the dashboard.

## Alternatives considered

**Firebase / Firestore** — The most mature BaaS, excellent realtime, generous free tier.
*Rejected because:* the document model fits this domain badly. "All songs in setlists for events in the next 30 days for bands I'm a member of" is a natural SQL join and an awkward denormalization exercise in Firestore. Security rules are less expressive than RLS for multi-tenant membership checks. And the learning transfers less — Postgres and SQL are durable skills, Firestore modelling is Firestore-specific. Vendor lock-in is also materially harder to escape than Postgres, which is portable by definition.

**Custom Node/NestJS API + managed Postgres** — Maximum control, the most conventional fullstack learning path.
*Rejected for v0.1 because:* it means building and operating auth, realtime WebSockets, file upload/signing, and a deployment pipeline — all before the first band can use anything. That's months of infrastructure for a product whose riskiest question is "will the drummer open it?" A thin API layer can be added later without changing the database, because the database is standard Postgres.

**Appwrite / PocketBase** — Open-source alternatives, self-hostable.
*Rejected because:* smaller ecosystems, less documentation to lean on when stuck alone, and self-hosting is operational burden this project explicitly refuses.

**Realtime via a separate service (Ably, Pusher)** — Excellent at the one job.
*Rejected because:* Supabase Realtime is already included and adequate. A second vendor is a second bill, a second SDK and a second failure mode for no gain at this scale.

## Consequences

### Positive
- Auth, database, storage and realtime from one platform, one SDK, one bill
- **RLS puts authorization in the database**, so a client-side bug can't leak another band's data — the strongest possible position for the copyright and privacy requirements
- Real Postgres: genuine SQL learning, and portable if Supabase ever has to be left
- Free tier covers Phase 1 entirely ([05-business-model](../../business/05-business-model.md))
- No servers to operate, patch or monitor
- Generated TypeScript types keep the client honest against the schema

### Negative / accepted costs
- **RLS becomes critical infrastructure.** A policy bug is a data breach. This is why policy tests are mandated as the highest-value tests in the project ([32-data-model](../32-data-model.md)).
- Business logic that belongs on a server has nowhere to live until Edge Functions are introduced. Accepted: v0.1 has almost none.
- Platform dependency on Supabase's availability and pricing. Mitigated by the data being standard Postgres — migration is work, not a rewrite.
- Complex authorization expressed as SQL policies is harder to read than imperative code.

### Revisit when
- Business logic appears that cannot be expressed as a query plus a policy (server-side purchase validation in Phase 2 is the first expected case → Edge Functions, not a new backend)
- Costs exceed roughly €25/month with no path to covering them
- RLS policy complexity becomes the main source of bugs

---
**Related:** [30 — Architecture](../30-architecture.md) · [32 — Data Model](../32-data-model.md) · [ADR-0007](0007-copyright-user-generated-charts-only.md)
