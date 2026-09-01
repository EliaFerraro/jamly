# 0007 — User-generated, band-private content only

**Status:** Accepted — **binding, non-negotiable**
**Date:** 2026-09-01

## Context

Jamly stores charts, chord sheets, lyrics, sheet music and rehearsal audio for songs — the vast majority of which are **copyrighted works owned by music publishers**.

This is not a theoretical concern. The precedents are direct:

- The **On-line Guitar Archive** received a takedown letter from lawyers for the **NMPA and MPA** and **removed all 34,000 tablatures** in 2006. ([source](https://en.wikipedia.org/wiki/On-line_Guitar_Archive))
- Sites that display chords and lyrics "either have a license to the lyrics or they are infringing." Chord and lyric licensing is real, expensive, and negotiated per-publisher.
- The **NMPA is running an active enforcement campaign against apps**. Its lawsuit against Vinkle was announced as the *start* of a broader campaign, alongside roughly **100 cease-and-desist letters to other apps**. ([source](https://www.billboard.com/pro/nmpa-vinkle-full-lawsuit-ignoring-licenses))

A solo developer cannot license a repertoire catalogue, cannot fund a defence, and cannot survive a takedown that deletes the product's core content. The legal position must therefore be designed into the product, not bolted on.

The distinction that makes this workable: **a private cloud drive is not a distribution platform.** Users storing their own files in their own private space is a fundamentally different legal posture from a service making works available to the public.

## Decision

**All charts, lyrics, scores and audio in Jamly are user-uploaded and live only inside a private band space.**

Binding rules:

1. **Private storage only.** Files live in a private bucket, path-scoped by band, reachable exclusively through short-lived signed URLs issued to authenticated members. **No public URLs. No unauthenticated access. Ever.**
2. **No public library.** Jamly will never host a browsable, searchable, or public collection of charts, tabs or lyrics.
3. **No cross-band sharing of charts.** Content does not move between band spaces through any Jamly feature. This is not "unbuilt" — it is **permanently rejected** ([`F119`](../../product/10-feature-inventory.md)).
4. **No scraping or ingesting** from Ultimate Guitar or any third-party chord/tab source.
5. **No lyrics or chord content authored, bundled or seeded by Jamly.**
6. **Terms of Service** place responsibility for uploaded content on the uploading user, who warrants they have the right to use it.
7. **A DMCA / notice-and-takedown process and a published contact address exist from launch**, with the technical ability to remove specific content on request.
8. **Gear presets are the explicit exception.** A drum tuning, an amp setting or a pedal chain is not a copyrighted musical work. That library **can** be public, social and searchable — which is why Pillar 3 is Jamly's social surface and Pillar 1 never will be.

## Alternatives considered

**License lyrics and chords properly** — The legitimate route, and what Ultimate Guitar does.
*Rejected because:* it requires negotiating with publishers and paying royalties at a scale no personal project can reach. It's a business model, not a feature.

**A public community library with DMCA safe harbour** — The route several sites attempted.
*Rejected because:* OLGA is the precedent, and it ended with all 34,000 files deleted. Safe harbour offers limited protection when a service's core value proposition is the infringing content itself, and the NMPA is actively pursuing apps right now. The downside is existential; the upside is a feature.

**Ignore it and hope to stay small** — *Rejected.* It puts every user's data at risk of sudden deletion and makes the project unsellable, unfundable and undefendable. It is also a bad thing to do to songwriters, who are the same people this app is built for.

**Store nothing at all; link out to external sources** — *Rejected:* it fails the offline requirement, which is a core product need ([ADR-0003](0003-offline-first-sync-strategy.md)), and it is a strictly worse product for no additional safety.

## Consequences

### Positive
- The legal posture is that of a private cloud drive — the same as Dropbox or Google Drive — which is a well-established and defensible position
- No licensing costs, no negotiations, no royalty accounting
- Users' own material stays genuinely private, which is also what bands actually want
- Forces the differentiation toward things that are legally clean and more defensible anyway: logistics, sync, practice, gear
- The technical enforcement is already required for privacy ([RLS, 32-data-model](../32-data-model.md)), so it costs nothing extra

### Negative / accepted costs
- **Every band starts with an empty chart library** and must upload its own material. Real onboarding friction, in direct tension with [Design Rule 2](../../design/20-design-principles.md).
- A genuinely useful feature — "share this chart with another band" — can never be built. Users will ask for it. **The answer is permanently no**, and this document is the reason to point at.
- Jamly cannot compete with Ultimate Guitar on content, ever. Accepted: that was never the strategy ([01-vision §5](../../business/01-vision.md)).
- Some ToS and takedown-process work is required before public launch.

### Revisit when
- **Realistically, never for rules 1–5.** These are the foundation of the product's legal existence.
- Rule 6/7 mechanics evolve with jurisdiction (EU vs US) and should be reviewed with a lawyer before v1.0 public launch.
- If Jamly ever reached a scale where licensing became feasible, that would be a *new* ADR superseding this one — and a different company.

---

> **If someone proposes a public chart library or cross-band chart sharing, the answer is no, and this document is why.**

---
**Related:** [R3 — Copyright & licensing](../../business/06-risks-and-open-questions.md) · [32 — Data Model](../32-data-model.md) · [10 — Feature Inventory, F119](../../product/10-feature-inventory.md) · [01 — Vision §5](../../business/01-vision.md)
