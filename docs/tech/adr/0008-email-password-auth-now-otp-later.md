# 0008 — Email + password now, email OTP later

**Status:** Accepted
**Date:** 2026-09-09

Amends the auth position stated in [30-architecture §Auth](../30-architecture.md) and story [A1](../../product/11-mvp-scope.md), both of which said magic link and no passwords.

## Context

v0.0 has no way in. Authentication is the blocking dependency for everything else in v0.1: every row-level-security policy resolves through `auth.uid()`, so until somebody can be signed in, not one band-scoped query can be written or tested.

The documented plan was a magic link, chosen to avoid password storage, a reset flow, and a field on the fastest path to value. Building it surfaced what that plan actually costs:

- **Both passwordless methods depend on email delivery this project does not have.** Supabase's built-in mailer is explicitly not for production: a handful of messages per hour, from a shared domain, straight into spam. Magic link *and* OTP therefore require a third-party provider (Resend, Postmark) and a verified sending domain **before the developer can sign in even once**.
- **Magic link needs more than that.** A deep-link callback (`jamly://`) plus iOS universal links, and it inherits a failure mode nobody controls: corporate link scanners — Outlook Safe Links and friends — fetch every URL in an email, consuming the single-use token, so the user sees "link expired" before they ever tap it.
- **A password does not remove the inbox from the trust chain.** The moment a reset flow exists, an emailed link is a way into the account anyway. The password is a *second* secret alongside the inbox, not a replacement for trusting it. That is the honest framing of the trade — passwordless removes a secret; it does not remove a dependency.
- **Accounts are not self-serve yet.** Jamly is invite-only while it is being built, so the "no registration form" argument for magic link — its strongest — does not apply to a user base that is currently one person.

## Decision

**Email and password (`signInWithPassword`) is the sign-in method for v0.1. Self-serve sign-up is disabled; accounts are created deliberately in the Supabase dashboard.**

**Email OTP — a six-digit code typed into the app, no deep link — remains the target**, and lands when a transactional email provider is configured. Both methods sign in the same `auth.users` row, so adding it costs one repository function and one input: no migration, no re-registration, nothing to undo.

Adopted as part of this decision, because a password flow is only as good as its handling:

| | |
|---|---|
| Session storage | The OS keystore (`expo-secure-store`), chunked to survive SecureStore's 2048-byte Android ceiling. Never AsyncStorage, which is a plaintext file to any backup or rooted device |
| Password strength | Enforced **server-side** (dashboard: minimum length 10, leaked-password protection against Have I Been Pwned). Never as a client rule on a sign-in field — that locks out whoever chose their password before the rule and reveals the shape of every password in the system |
| Failure messages | A wrong password and an unknown account get the identical answer. Distinguishing them turns the sign-in screen into a way to enumerate who has a Jamly account |
| Repeated failures | Client-side back-off after five, doubling to a five-minute cap. The server-side rate limit is the control that actually matters; this one keeps a stolen phone slow and keeps a forgetful musician from tripping the harder server limit |
| Email confirmation | Stays on |
| Forgotten password | Reset by hand in the dashboard until a reset flow exists (`F606`). Acceptable at one user; the first thing OTP deletes |

## Alternatives considered

**Magic link now, as documented** — the original plan, fewest taps once working.
*Rejected because:* SMTP provider, verified domain, deep-link callback and iOS universal links all stand between here and the first sign-in, and the mail-scanner problem means some users would never get in through no fault of the app. That is a lot of infrastructure to build before the riskiest question — *will the drummer open it?* — can even be asked.

**Email OTP now** — no deep links, nothing to steal, closest to the documented spirit.
*Rejected for today only:* it still needs the email provider and DNS verification, which buys nothing the developer needs this week. Explicitly kept as the target rather than a rejected option.

**Anonymous or device-local accounts** — zero friction, no email at all.
*Rejected because:* Jamly is a shared band space. An identity that cannot follow a musician to a new phone is not an identity, and the entire domain model hangs off a durable `User`.

**Social login (Apple / Google)** — no password, no email pipeline, one tap.
*Rejected for v0.1 because:* two provider consoles to configure, an App Store rule that offering Google obliges offering Sign in with Apple too, and it still does not remove the need for an email path for musicians who use neither. v0.2, as already planned.

## Consequences

### Positive
- Unblocks every other v0.1 story today, with no third-party service in the way
- Works with no email delivery at all — including on a plane, and including on the developer's own devices from the first minute
- Password managers and OS autofill work, which makes repeat sign-in on a phone genuinely fast
- The session, keystore and route-guard machinery built here is method-agnostic: OTP reuses all of it

### Negative / accepted costs
- **A password reset flow is owed** before any user outside the developer exists. Recorded as `F606`
- A bcrypt hash now exists to be protected — a breach target that magic link would not have created
- Users reuse passwords; a credential leaked elsewhere is a credential that works here. Leaked-password protection mitigates, it does not solve
- Two auth methods to keep working once OTP lands
- Documents that said "no password field, ever" are now wrong and have been amended — the cost of writing a decision down before building it

### Revisit when
- A transactional email provider is configured → add email OTP, and consider making it the default
- The first account exists that is not the developer's → the reset flow becomes mandatory, not owed
- Anyone asks for Apple or Google sign-in → that is the v0.2 conversation, and it is additive to this

---
**Related:** [ADR-0002](0002-backend-supabase-postgres.md) · [30 — Architecture](../30-architecture.md) · [32 — Data Model](../32-data-model.md)
