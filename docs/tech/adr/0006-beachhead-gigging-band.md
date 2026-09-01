# 0006 — Beachhead: the gigging band

**Status:** Accepted
**Date:** 2026-09-01

## Context

Jamly's vision spans six pillars and four distinct user types ([01-vision](../../business/01-vision.md)). Building for all of them at once is the fastest route to shipping nothing — the project's number-one risk ([R1](../../business/06-risks-and-open-questions.md)).

A beachhead had to be chosen: the first user, the first loop, and the first thing that has to be excellent. Everything else follows from it — features, design priorities, monetization, even the data model.

This is a product/business decision rather than a technical one, but it constrains the architecture more than most technical decisions do, so it belongs in the ledger.

## Decision

**Build first for the gigging band** — amateur and semi-pro groups that rehearse regularly and play paid shows.

The first loop is the **rehearsal-to-gig loop**: shared repertoire → setlist for an event → live sync on stage → who played.

Within that, **the passive band member is the primary design persona** ([P2 Sara](../../business/03-personas-and-jtbd.md)), not the band leader. The leader is the buyer and champion; the passive member decides whether the product succeeds.

The full vision stays intact on paper. Only the build order is constrained.

## Alternatives considered

**The solo learner / bedroom player first** — Much larger market, no multiplayer chicken-and-egg problem, far easier to build alone, and immediately useful to a single user.
*Rejected because:* the space is brutally competitive (Ultimate Guitar at 30M MAU, Modacity, Yousician), retention for solo practice tools is notoriously poor, and the differentiated insight — that band context makes practice meaningful — is unavailable without band data. Building solo-first would produce a worse Modacity with no moat. **This is the fallback if validation shows passive members won't install anything** ([14-validation-plan](../../product/14-validation-plan.md)).

**Music schools / teachers (B2B2C)** — Higher revenue per account, stickier, a real business.
*Rejected because:* a different product with a sales motion, an institutional buyer, and compliance concerns. It is furthest from the original vision and from the developer's own world, which matters for a part-time project where motivation is a real constraint. Deferred, not dismissed.

**Non-gigging hobby bands** — Closest to the "Jamly as social hub" reading, lowest pressure.
*Rejected because:* the pain is weakest — no deadlines, no money, no stakes — and willingness to pay is near zero. Sharp pain is what makes people adopt a new tool.

**Build the whole vision at once** — Rejected. This is [R1](../../business/06-risks-and-open-questions.md) in its purest form.

## Consequences

### Positive
- The pain is sharpest and most concrete: money, deadlines, and public embarrassment on stage
- Built-in distribution: one member joining brings four others, and bands know other bands
- Real willingness to pay is demonstrated in this segment (BandHelper sustains a business here)
- A gig is a natural, recurring deadline — which produces recurring usage without engagement gimmicks
- The developer is inside this world and can dogfood credibly

### Negative / accepted costs
- **The chicken-and-egg problem is severe** ([R2](../../business/06-risks-and-open-questions.md)): one user alone gets little. This is the single largest risk accepted by this decision, and it is why onboarding is treated as the core feature rather than a supporting one.
- The most crowded of the four candidate segments ([02-market](../../business/02-market-and-competitors.md)) — although crowded with weak products.
- Requires a real band to test with; the developer cannot validate this alone.
- Personal-layer features (practice, gear) get postponed even though they are the long-term moat. Mitigated by building the **data seam** for them at v0.1 ([`song_personal`](../32-data-model.md)) so v0.2 is additive rather than a re-architecture.

### Revisit when
- **Validation shows passive members won't adopt any app** → pivot to solo-first ([pre-committed decision](../../product/14-validation-plan.md))
- v0.1 metrics show passive-member weekly activity below ~40% → the wedge is wrong, stop and rethink before v0.2
- The personal layer turns out to drive far more retention than the band layer → reorder the roadmap around it

---
**Related:** [03 — Personas & JTBD](../../business/03-personas-and-jtbd.md) · [11 — MVP Scope](../../product/11-mvp-scope.md) · [12 — Roadmap](../../product/12-roadmap.md) · [14 — Validation Plan](../../product/14-validation-plan.md)
