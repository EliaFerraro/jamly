# Architecture Decision Records

An ADR captures **one significant decision**, the context that forced it, and the consequences accepted along with it. Together they are the permanent ledger of *why Jamly is built the way it is*.

The value isn't the decision — it's the reasoning. In six months, "why didn't I use Firebase?" is a question with a real cost if it isn't already answered here.

## Index

| # | Title | Status | Date |
|---|---|---|---|
| [0001](0001-cross-platform-expo-react-native.md) | Cross-platform with Expo / React Native | Accepted | 2026-09-01 |
| [0002](0002-backend-supabase-postgres.md) | Supabase + Postgres as the backend | Accepted | 2026-09-01 |
| [0003](0003-offline-first-sync-strategy.md) | Offline-first: cached reads now, queued writes later | Accepted | 2026-09-01 |
| [0004](0004-realtime-setlist-sync-transport.md) | Realtime broadcast for live setlist sync | Accepted | 2026-09-01 |
| [0005](0005-monetization-free-now-pro-later.md) | Free now, individual Pro later | Accepted | 2026-09-01 |
| [0006](0006-beachhead-gigging-band.md) | Beachhead: the gigging band | Accepted | 2026-09-01 |
| [0007](0007-copyright-user-generated-charts-only.md) | User-generated, band-private content only | Accepted | 2026-09-01 |

## When to write one

Write an ADR when the decision:
- is expensive or painful to reverse (a framework, a database, a data model shape)
- constrains what the product can become (the copyright position, the monetization model)
- is one that a future reader would otherwise question and re-litigate

Everything smaller goes in [41-decision-log](../../process/41-decision-log.md).

## Format

```markdown
# NNNN — Title

**Status:** Proposed | Accepted | Superseded by ADR-XXXX | Deprecated
**Date:** YYYY-MM-DD

## Context
The forces at play. What makes this a decision rather than an obvious choice.

## Decision
What we are doing, stated plainly.

## Alternatives considered
Each with the honest reason it was rejected. An ADR with no rejected
alternatives is not a decision — it's a note.

## Consequences
### Positive
### Negative / accepted costs
### Revisit when
The concrete trigger that should make us reopen this.
```

## Rules

1. **ADRs are immutable.** A decision that changes gets a *new* ADR that supersedes the old one. The old one stays, marked superseded. The history is the point.
2. **Always record rejected alternatives.** Otherwise the same option gets reconsidered from scratch every six months.
3. **Always record the revisit trigger.** A decision that's right at 10 users may be wrong at 10,000; naming the threshold in advance prevents both premature rework and stubborn persistence.
