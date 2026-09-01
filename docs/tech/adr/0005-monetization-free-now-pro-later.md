# 0005 — Free now, individual Pro later

**Status:** Accepted
**Date:** 2026-09-01

## Context

Jamly needs a monetization position now, because it shapes the architecture — even though no money will be taken for a long time.

Forces:
- **Nothing is validated yet.** Charging for an unproven product means the only signal received is "no", which teaches nothing ([14-validation-plan](../../product/14-validation-plan.md)).
- **The product is multiplayer.** Value requires the whole band, so any friction multiplies by five ([R2](../../business/06-risks-and-open-questions.md)). A price is friction the band leader would have to overcome five times.
- **The stated primary goal is learning and shipping**, with revenue as a genuine but secondary aspiration ([01-vision §7](../../business/01-vision.md)).
- **Infrastructure cost is near zero** at the scale this will operate at for a long time.
- Retrofitting monetization into an app that never considered it is a painful refactor. Building payment infrastructure that goes unused for a year is equally wasteful.

## Decision

**Phase 1 — free, complete, unlimited.** No paywalls, no limits, no ads, no trial timers. The entire product, free.

**Phase 2 (later) — individual Pro subscription.** Each musician subscribes for themselves. Not per band, not per seat.

**Hard rule:** shared band functionality is never gated. If one member pays and another doesn't, the band works identically for both.

**Migration rule:** *nothing a user already has becomes paid.* Pro is built from new capability. Users from Phase 1 are permanently grandfathered.

**Architecture requirements accepted now** ([05-business-model](../../business/05-business-model.md)):
1. `plan` and `plan_grandfathered_at` exist on every profile from v0.1
2. All feature access flows through a single `useEntitlement(feature)` abstraction, returning `true` for everything in Phase 1
3. Storage usage is **measured per user and per band from the first upload**, while still unlimited
4. **No payment SDK in Phase 1**

## Alternatives considered

**Per-band subscription (BandHelper's model, ~$8/mo for 2–5 members)** — Proven in this exact market, and matches how bands think about shared costs.
*Rejected because:* one holdout blocks the entire band; access dies when someone leaves the group; and — decisively — **the features most worth charging for are personal ones** (practice analytics, personal storage, gear libraries). Charging the band for an individual's practice history is incoherent. Group billing is also genuinely complex: ownership, member changes, proration.

**Freemium from day one** — Standard, and generates revenue signal early.
*Rejected because:* it requires knowing which features are worth paying for, which is exactly what is not yet known. Guessing wrong sets a bad anchor that is hard to undo, and any paywall works against the multiplayer adoption problem that is the project's biggest risk.

**One-time purchase / lifetime** — Musicians demonstrably like this (forScore, OnSong), and it avoids subscription fatigue.
*Rejected as the primary model because:* cloud sync and storage cost recurs forever while a one-time payment doesn't. Sustaining ongoing infrastructure on one-time revenue means constantly needing new buyers. **Worth offering as a founder/supporter tier during the Phase 1→2 transition**, as a way to keep faith with early users.

**Ads** — Rejected outright. Destroys the experience, contradicts a product used on stage, and requires scale this will never have.

**Never monetize** — Honest for a learning project, but it forecloses an option for free. Building the entitlement seam costs almost nothing now and preserves the choice.

## Consequences

### Positive
- Zero friction during the phase where adoption is the only thing that matters
- Freedom to learn what people value before pricing it
- Individual subscription **follows the musician across bands** — which matches how the roadmap develops (v0.2 personal layer, v0.4 gear)
- Phase 2 becomes a configuration change, not a refactor
- The migration rule is technically enforceable, not merely a promise

### Negative / accepted costs
- No revenue for a long time; costs come out of pocket (small: target €0/month, plus the €99/yr Apple fee)
- Free users may create storage cost with no offsetting revenue — which is precisely why usage is measured from day one
- The eventual introduction of Pro is a delicate moment with a real risk of community backlash. The migration rule exists to defuse it, and must be honoured absolutely.
- Carrying an unused entitlement abstraction is a small ongoing cost. Judged much cheaper than retrofitting one.

### Revisit when
- Infrastructure cost exceeds ~€20/month
- There are ~500+ active users, or a clear pattern of which features people would pay for
- Validation interviews reveal a specific willingness to pay ([14-validation-plan](../../product/14-validation-plan.md))
- **If interviews show almost nobody pays for music apps** → drop Phase 2 planning entirely and optimize for cost

---
**Related:** [05 — Business Model](../../business/05-business-model.md) · [32 — Data Model](../32-data-model.md) · [11 — MVP Scope, story F3](../../product/11-mvp-scope.md)
