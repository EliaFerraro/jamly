# 41 — Decision Log

> Chronological record of decisions that shaped the project but don't warrant a full [ADR](../tech/adr/README.md).
>
> **Format:** date · decision · why · where it's documented. Newest at the bottom, so this reads as a history.

---

## 2026-09-01 — Project founded

| # | Decision | Why | See |
|---|---|---|---|
| D1 | **Beachhead: the gigging band**, not solo players or music schools | Sharpest pain, real willingness to pay, built-in distribution through band members | [ADR-0006](../tech/adr/0006-beachhead-gigging-band.md) |
| D2 | **Stack: Expo / React Native + TypeScript** | One codebase for iOS/Android/tablet/web; leverages existing React skill; solo-dev constraint | [ADR-0001](../tech/adr/0001-cross-platform-expo-react-native.md) |
| D3 | **Backend: Supabase + Postgres**, no custom API server in v0.1 | Relational data, RLS as the security boundary, realtime included, real SQL learning | [ADR-0002](../tech/adr/0002-backend-supabase-postgres.md) |
| D4 | **Free with no limits now; individual Pro later** | Multiplayer product — price friction multiplies by band size; nothing validated yet | [ADR-0005](../tech/adr/0005-monetization-free-now-pro-later.md) |
| D5 | **All content user-uploaded and band-private. No public chart library, ever.** | NMPA/MPA enforcement precedent (OLGA's 34,000 tabs deleted); active campaign against unlicensed apps | [ADR-0007](../tech/adr/0007-copyright-user-generated-charts-only.md) |
| D6 | **v0.1 wedge is the rehearsal-to-gig loop** — repertoire → setlist → live sync → done | Scope collapse is the top risk; six pillars at once ships nothing | [11-mvp-scope](../product/11-mvp-scope.md) |
| D7 | **The passive band member is the primary design persona**, not the band leader | The incumbent's documented failure is that bandmates never adopt it | [03-personas](../business/03-personas-and-jtbd.md), [20-design-principles](../design/20-design-principles.md) |
| D8 | **`song_personal` exists in v0.1** despite carrying only notes | Establishes the band↔personal seam that the entire v0.2+ moat depends on; retrofitting it later would be a re-architecture | [13-domain-model](../product/13-domain-model.md) |
| D9 | **Entitlement abstraction and storage measurement built in v0.1**, while everything is free | Makes the Phase 2 switch a config change; you can't price what you never measured | [ADR-0005](../tech/adr/0005-monetization-free-now-pro-later.md) |
| D10 | **North-star metric is *active bands*, never total users** | A user count would hide the exact failure mode we fear most — one member per band using it | [14-validation-plan](../product/14-validation-plan.md) |
| D11 | **Songs are band-scoped, not a global catalogue** | Enormous simplification, and it keeps every chart inside a private band boundary. A global catalogue is a different, licence-encumbered product | [13-domain-model](../product/13-domain-model.md) |
| D12 | **Five tabs: Band · Repertoire · Dates · Setlists · Me** — expected to survive to v1.0 | Matches how bands actually think; a new tab per release would signal sprawl rather than depth | [21-information-architecture](../design/21-information-architecture.md) |
| D13 | **"Me" tab ships in v0.1 nearly empty** | Reserves the home for the personal layer so v0.2 is additive, not a redesign | [21-information-architecture](../design/21-information-architecture.md) |
| D14 | **No band chat feature. Ever, probably.** | Competing with the group chat the band already loves is unwinnable. Jamly takes the *structured* things out of chat and leaves the conversation there | [10-feature-inventory F213](../product/10-feature-inventory.md) |
| D15 | **Music wiki / discovery pillar deferred to v1.0+**, entering via "where this song comes from" on existing repertoire | It's an editorial cost, not an engineering one, and it's the least validated pillar. Attach context to songs bands already play rather than building an encyclopedia | [12-roadmap](../product/12-roadmap.md) |
| D16 | **Music-school / teacher edition deferred indefinitely** | A real market with a different product, a different buyer and a sales motion. Furthest from the vision and from the developer's own world | [03-personas anti-personas](../business/03-personas-and-jtbd.md) |
| D17 | **No UI component library; small in-house kit on design tokens** | The stage-readable dark theme is a product differentiator; fighting a library's defaults would cost more than building the pieces we need | [31-stack](../tech/31-stack.md) |
| D18 | **Live sync uses ephemeral broadcast, with no database table** | A lost live session must never touch durable data; broadcast is the right primitive for transient state | [ADR-0004](../tech/adr/0004-realtime-setlist-sync-transport.md) |
| D19 | **Pre-committed decision rules written before the validation interviews** | So the results can't be rationalized after the fact. The plan is allowed to be wrong — but only if we let the data say so | [14-validation-plan](../product/14-validation-plan.md) |
| D20 | **Name "Jamly" kept; trademark checks deferred but tracked** | No music-app collision found; one unrelated company on Crunchbase. Cheap to resolve pre-launch, expensive after | [04-positioning](../business/04-positioning.md), [R10](../business/06-risks-and-open-questions.md) |

## 2026-09-01 — Scaffold built

| # | Decision | Why | See |
|---|---|---|---|
| D21 | **Expo SDK 57**, not 56 | 57 is the current stable release (RN 0.86.3, React 19.2.3, TypeScript 6). Desk research had said 56; the toolchain corrected it. From SDK 57 Expo uses **unified versioning** — first-party packages carry the SDK major (`expo-router@57.x`), so versions must come from `npx expo install`, never hand-written | [31-stack](../tech/31-stack.md) |
| D22 | **`babel-preset-expo` declared as an explicit devDependency** | Not resolvable transitively; the Jest transform fails without it | [31-stack](../tech/31-stack.md) |
| D23 | **Zustand documented but not yet installed** | The stack doc's own rule: a dependency without a current use is a liability. It arrives with the first screen that needs UI state | [31-stack](../tech/31-stack.md) |
| D24 | **`.gitignore` hardened to exclude `.env`** | The Expo template ignores only `.env*.local`, which would have let a real `.env` with Supabase keys be committed | — |
| D25 | **`Placeholder` component is a developer marker, not an empty state** | Empty states are a user-facing design problem with their own rule (never assign the user homework). Conflating the two would have smuggled an anti-pattern into the design system | [20-design-principles](../design/20-design-principles.md) |

## 2026-09-02 — Development runtime

| # | Decision | Why | See |
|---|---|---|---|
| D26 | **EAS development build is the dev runtime; Expo Go is not usable** | Expo Go on both stores is frozen at SDK 54 and Expo ships no SDK 57 build — it is now positioned as a learning tool. Downgrading the project to 54 to regain Expo Go was rejected: it would forfeit RN 0.86 / New Architecture and contradict the SDK 57 pin (D21). `expo-dev-client` added; `eas.json` defines `development` / `preview` / `production` profiles. Cloud builds keep the machine free of the Android toolchain, as [ADR-0001](../tech/adr/0001-cross-platform-expo-react-native.md) already assumed | [31-stack](../tech/31-stack.md) |

---

## Open decisions

Deliberately not yet decided. Recorded so they aren't forgotten — and so nobody assumes they were settled.

| # | Question | Blocked on | Deadline |
|---|---|---|---|
| O1 | Which PDF rendering library for charts | Hands-on evaluation during the v0.1 build | Before story B4 |
| O2 | Whether chart display belongs in v0.1 at all | Validation [Q3](../business/06-risks-and-open-questions.md) — do musicians move charts out of forScore? | Before v0.1 ships |
| O3 | Exact Pro price point | Validation Q5 + Phase 2 timing | Phase 2 |
| O4 | Whether to offer a lifetime/founder tier at the Phase 1→2 transition | Community size and sentiment at that point | Phase 2 |
| O5 | Italian localization at v0.3 or later | Where the first real users actually come from | v0.3 planning |
| O6 | Whether to keep a hand-rolled sync layer or adopt PowerSync at v0.2 | How painful v0.2's offline writes turn out to be | v0.2 |

---

**Related:** [ADR index](../tech/adr/README.md) · [40 — Ways of Working](40-ways-of-working.md) · [06 — Risks & Open Questions](../business/06-risks-and-open-questions.md)
