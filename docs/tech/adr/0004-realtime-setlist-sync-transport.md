# 0004 — Realtime broadcast for live setlist sync

**Status:** Accepted
**Date:** 2026-09-01

## Context

Live setlist sync is Jamly's most visible differentiator ([story E2](../../product/11-mvp-scope.md)): the leader advances to the next song and every member's screen follows. It is also the feature with the least validated demand — [Q2](../../business/06-risks-and-open-questions.md) explicitly asks whether it's genuinely useful or a demo trick.

Requirements:
- Propagation under **2 seconds** ([N2](../../product/11-mvp-scope.md)) — slower than someone shouting "next one" is worthless
- Must degrade gracefully: a device that loses connection keeps working alone and re-attaches later
- **Losing a live session must never affect durable data** (invariant 7, [13-domain-model](../../product/13-domain-model.md))
- Any member must be able to detach and re-attach in one obvious tap — never trap someone in a synced view ([Design Rule 3](../../design/20-design-principles.md))
- Venue wifi is unreliable; mobile data is often the only usable link

## Decision

Use **Supabase Realtime broadcast channels**, one channel per event: `event:{event_id}`.

The channel carries **ephemeral state only** — the leader's current position:
```ts
{ currentItemId, driverUserId, updatedAt }
```

**No `live_sessions` table.** Live position is transient by design; it is never written to durable storage.

Client behaviour:
- The **driver** (a leader, or whoever takes the wheel) broadcasts on every position change
- **Followers** apply incoming positions only while *attached*; a detached client ignores them entirely and shows an obvious "following / browsing" state
- On reconnect, a client requests the current position and re-attaches if it was attached before
- **Every device works fully standalone.** Sync is an enhancement layered on a view that already works alone.

## Alternatives considered

**Postgres changes + database table for live state** — Write the position to a `live_sessions` row and let clients subscribe to row changes.
*Rejected because:* it writes tens of ephemeral rows per gig for state with a lifespan of seconds, adds database load and history for nothing, and — most importantly — couples a transient concern to durable storage. A sync bug could then damage real data, which invariant 7 exists to prevent. Broadcast is the right primitive for ephemeral messages.

**A dedicated realtime service (Ably, Pusher)** — Better delivery guarantees and presence features.
*Rejected because:* Supabase Realtime is already present, adequate for a handful of messages per song, and free at this scale. A second vendor for one feature is not justified — especially one whose demand is not yet validated.

**Peer-to-peer over local wifi (WebRTC / Bluetooth / multipeer)** — Would work with no internet at all, which is genuinely attractive for a venue.
*Rejected for v0.1 because:* substantially more complex, platform-specific, and hostile to debug. It is the **most interesting future option** if venue connectivity turns out to be the binding constraint in practice — noted as a revisit trigger rather than dismissed.

**Polling** — Dead simple.
*Rejected because:* meeting a 2-second budget by polling means hammering the backend continuously through an entire show, for every member, for a feature used a few times per set.

## Consequences

### Positive
- Nothing new to operate; the transport already exists in the stack
- Ephemeral by construction, so a lost session can never corrupt the setlist
- Detach/attach is trivial to implement — it's purely a client-side subscription state
- Low cost: a few messages per song, only during rehearsals and shows

### Negative / accepted costs
- **Broadcast is at-most-once.** A message can be missed. Mitigated by re-requesting position on reconnect and by every device remaining usable alone — a missed message means one screen is briefly behind, not broken.
- Requires internet. If a venue has no connectivity at all, **sync is unavailable while everything else still works** — an acceptable and honestly-communicated degradation ([ADR-0003](0003-offline-first-sync-strategy.md)).
- No built-in "who is following" presence in v0.1. Could be added with Realtime Presence later if it turns out leaders want it.

### Revisit when
- Validation shows venue connectivity is so bad that sync is regularly unusable → evaluate local peer-to-peer
- Leaders ask to see who is following → add Realtime Presence
- Message loss proves noticeable in practice → add a lightweight periodic position heartbeat
- **[Q2](../../business/06-risks-and-open-questions.md) resolves negative** — if bands don't actually use this, the whole feature gets demoted rather than improved

---
**Related:** [30 — Architecture](../30-architecture.md) · [13 — Domain Model](../../product/13-domain-model.md) · [ADR-0003](0003-offline-first-sync-strategy.md)
