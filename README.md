# Jamly

**Everything your band agreed on, on everyone's screen. Even the drummer's.**

Jamly is the shared brain for your band and the private coach for your playing — setlists
that sync live on stage, dates and availability, repertoire and charts that work with no
signal, and (from v0.2) a practice list generated from what your band is actually playing
next.

> **Status: v0.0 — foundation.** The strategy is written, the app skeleton runs. No real
> features yet. See the [roadmap](docs/product/12-roadmap.md).

---

## Why this exists

Every band runs on a WhatsApp group, a Drive folder and someone's memory. Apps that fix
this exist — and their own users report the same failure: the band leader learns the tool
and nobody else ever does. A tool for a group that one person uses is worthless.

Jamly's bet is a different one: be radically easier to join than to explain, work at a
venue with no signal, and then do the one thing no competitor can — connect what the band
needs on Saturday to what you personally should practise on Tuesday.

The full reasoning, with sources: [docs/business/02-market-and-competitors.md](docs/business/02-market-and-competitors.md).

## Getting started

```bash
npm install
cp .env.example .env      # optional — the skeleton runs without a backend
npm start                 # then scan the QR code with Expo Go
```

Other commands:

```bash
npm run android      # open on an Android device/emulator
npm run ios          # open on iOS (macOS only, or use Expo Go)
npm run web          # run in a browser
npm run typecheck    # tsc --noEmit
npm run lint
npm test
```

### Backend (optional at this stage)

The app needs a [Supabase](https://supabase.com) project only for network-backed
features. To set one up: create a project, run `supabase/migrations/0001_init.sql`
against it, and put the project URL and **anon** key into `.env`.

The service-role key must never appear in this app.

## Documentation

`docs/` is the project's memory — the business case, every product decision, and the
reasoning behind each technical choice. Start at **[docs/README.md](docs/README.md)**.

| | |
|---|---|
| [Vision](docs/business/01-vision.md) | The full ecosystem this is heading toward |
| [Market & competitors](docs/business/02-market-and-competitors.md) | Who else is here and where the gaps are |
| [MVP scope](docs/product/11-mvp-scope.md) | What v0.1 actually is |
| [Roadmap](docs/product/12-roadmap.md) | v0.1 → v1.0 |
| [Architecture](docs/tech/30-architecture.md) | How it's built |
| [ADRs](docs/tech/adr/README.md) | Why it's built that way |

## Stack

Expo SDK 57 (React Native 0.86, React 19.2) · TypeScript · Expo Router · Zustand ·
TanStack Query · Supabase (Postgres, Auth, Realtime, Storage) · SQLite offline cache.

Rationale for each: [docs/tech/31-stack.md](docs/tech/31-stack.md).

## A note on content and copyright

Jamly stores charts, lyrics and audio that users upload themselves, **inside private band
spaces only**. There is no public library and no sharing of charts between bands, and
there never will be — this is a deliberate legal position, not a missing feature. See
[ADR-0007](docs/tech/adr/0007-copyright-user-generated-charts-only.md).

## Contributing

Personal project, not currently open to contributions. If you're a gigging musician and
any of this sounds like your life, feedback is genuinely welcome — that's what
[the validation plan](docs/product/14-validation-plan.md) is for.

## License

See [LICENSE](LICENSE).
