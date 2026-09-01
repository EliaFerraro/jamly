# 0001 — Cross-platform with Expo / React Native

**Status:** Accepted
**Date:** 2026-09-01

## Context

Jamly must run on **Android and iOS** at launch, on **tablets** (the tablet on a music stand is the professional musician's device), and plausibly on **desktop** later. It is built by **one part-time developer** whose existing strength is frontend web development, with an explicit goal of growing into fullstack.

The constraints that actually decide this:
- One person cannot maintain two native codebases. Attempting it would consume the entire scope budget ([R1](../../business/06-risks-and-open-questions.md)).
- Learning value matters — this project is explicitly a learning vehicle ([01-vision §7](../../business/01-vision.md)) — but not at the price of never shipping.
- Deep links are load-bearing: the invite link is the single most important flow in the product ([R2](../../business/06-risks-and-open-questions.md)).
- Nothing in v0.1 needs low-level audio, MIDI or DSP. Charts, lists and a realtime channel are all well within any cross-platform toolkit.

## Decision

Build Jamly with **Expo (SDK 57) and React Native, in TypeScript with `strict: true`**, using **Expo Router** for file-based routing.

Ship to iOS and Android from one codebase; keep the web build available as a hedge and a future admin/landing surface.

## Alternatives considered

**Flutter + Dart** — Genuinely excellent: the most consistent cross-platform rendering, strong tablet and desktop story, and arguably better raw UI performance for a graphics-heavy performance mode.
*Rejected because:* it requires learning a new language and ecosystem from zero, which converts existing React skill into a cost rather than an asset. For a part-time solo project, momentum is the binding constraint, and the ramp-up would come out of the same budget as the product. Revisitable if RN performance ever proves inadequate — but it would be a rewrite, so the trigger must be real.

**Native Kotlin + Swift** — Best platform feel, best access to audio/MIDI, best long-term ceiling.
*Rejected because:* two codebases, one developer. This is the option most likely to result in a half-finished product, which is the project's number-one risk.

**Web app / PWA only** — Zero store friction, instant deploys.
*Rejected because:* offline reliability, background behaviour, deep-link handling and screen-wake control are all weaker on mobile web — and every one of those is a v0.1 requirement, not a nice-to-have. A venue with no signal is the exact case a PWA handles worst.

**Bare React Native (no Expo)** — More native control.
*Rejected because:* it trades away EAS managed builds, OTA updates and first-party modules for control we don't need. Local native toolchain maintenance is a recurring tax on a developer with limited hours. Ejecting later remains possible if a native requirement appears.

## Consequences

### Positive
- One codebase reaches iOS, Android, tablet and web
- Existing React knowledge transfers directly; the learning curve is spent on *new* things (Postgres, RLS, sync) rather than on re-learning UI
- EAS removes local Xcode/Android SDK maintenance — significant for a Windows-primary developer targeting iOS
- Expo Router gives deep links essentially for free, and deep links are the invite flow
- OTA updates allow shipping a JS fix without a store review — valuable when a bug appears the day before someone's gig

### Negative / accepted costs
- Some native capability requires a config plugin or a custom dev client. PDF rendering is the least certain dependency in the stack ([31-stack](../31-stack.md)) and must be validated early.
- Bound to the Expo release cadence; the New Architecture is mandatory from SDK 55, with no legacy fallback, so an SDK upgrade can't be deferred indefinitely.
- Performance ceiling below native. Acceptable for lists, PDFs and text — would not be acceptable for real-time audio, which is out of scope.
- App size is larger than a native equivalent.

### Revisit when
- A core feature requires native audio, MIDI or DSP that RN cannot reach acceptably
- Performance mode cannot hold 60fps on a mid-range Android device after honest optimization
- The desktop target becomes a real priority rather than a maybe

---
**Related:** [31 — Stack](../31-stack.md) · [30 — Architecture](../30-architecture.md)
