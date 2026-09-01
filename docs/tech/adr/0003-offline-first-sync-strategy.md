# 0003 — Offline-first: cached reads now, queued writes later

**Status:** Accepted
**Date:** 2026-09-01

## Context

Jamly is used in rehearsal rooms and venues — basements, back rooms, buildings with concrete walls. **The moment the app matters most is the moment the network is worst.** An app that shows a spinner when the band walks on stage has failed at its only job.

But offline-first is also a hard distributed-systems problem, and the *hard* part is not reading — it's concurrent writes. Two members reordering the same setlist while both are offline is genuinely difficult to resolve well, and the naive attempt at solving it can consume months ([R7](../../business/06-risks-and-open-questions.md)).

Honest observation about real usage: **conflicting concurrent edits to shared band data are rare.** One person builds the setlist. One person creates the event. The others read. Simultaneous conflicting edits by two offline members is a corner case, not the main path.

## Decision

**Stage the offline guarantee, and state each stage honestly.**

**v0.1 — offline reads, online shared writes**
- All band data (repertoire, events, setlists, charts) is cached in local **SQLite** (`expo-sqlite`) and fully readable offline.
- **Chart files are pre-downloaded**, never streamed on demand.
- Reads render from cache immediately, then revalidate from the network. The UI never blocks on the network for data it already has.
- *Personal* writes (my notes) queue locally and sync when connected.
- *Shared* writes require a connection, and say so clearly.

**v0.2 — offline writes with last-write-wins**
- Shared writes queue locally and replay on reconnect.
- Conflicts resolve **last-write-wins**, with the conflict made **visible** to the user rather than silently discarded.

**Explicitly not building CRDTs or operational transforms.**

## Alternatives considered

**Full CRDT sync (Yjs, Automerge)** — Correct concurrent editing, no lost writes.
*Rejected because:* it is the single most likely place for this project to disappear for three months and emerge with nothing user-visible. The problem it solves — two people reordering the same setlist simultaneously while offline — is rare in real band usage. Wrong risk/reward for the actual conflict rate.

**PowerSync** — Purpose-built Postgres↔SQLite sync via change data capture; genuinely good, and would "solve sync" rather than requiring it to be built.
*Rejected for v0.1 because:* another vendor, another bill, and another layer to understand before the first band can use anything. It is the **strongest candidate if the hand-rolled v0.2 sync layer proves painful** — that is the named revisit trigger, not a hypothetical.

**WatermelonDB** — Mature RN offline database with a documented Supabase sync path.
*Rejected because:* it wants to own the data layer and imposes its own model and observability patterns. For v0.1's read-only cache, plain `expo-sqlite` plus TanStack Query is simpler and has fewer opinions. Reconsider alongside PowerSync at v0.2.

**Online-only** — Radically simpler.
*Rejected outright:* it fails at a venue, which is the primary use case. This would make Jamly unusable exactly when it needs to work.

## Consequences

### Positive
- v0.1 ships with the offline behaviour that actually matters — everything readable, charts available, at a venue with no signal
- The hard problem is deferred to a point where real usage data will inform it
- Cache-first reads make the app feel instant, satisfying the cold-start and chart-open budgets ([N1](../../product/11-mvp-scope.md), [N6](../../product/11-mvp-scope.md))
- SQLite is a durable, portable choice regardless of what happens above it

### Negative / accepted costs
- **v0.1 has a real limitation:** the band leader can't build a setlist offline. Must be communicated clearly in the UI rather than failing mysteriously.
- Cache invalidation logic is hand-written and is a plausible source of bugs.
- Last-write-wins *will* lose an edit occasionally in v0.2. Accepted — provided the loss is visible, never silent.
- Pre-downloading charts consumes device storage; needs a bound and a cache-eviction policy.

### Revisit when
- Users report losing work due to conflicts more than rarely
- The hand-rolled v0.2 sync layer becomes a recurring source of bugs → **evaluate PowerSync seriously at that point**
- A genuinely collaborative feature appears (two people editing one setlist together, live) — that would justify CRDTs on its own merits

---
**Related:** [30 — Architecture](../30-architecture.md) · [R7](../../business/06-risks-and-open-questions.md) · [Design Rule 4](../../design/20-design-principles.md)
