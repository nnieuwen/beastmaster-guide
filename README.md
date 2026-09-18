# Beastmaster Guide

A community strategy guide for **Beastmaster**, the limited job added to Final Fantasy XIV in
Patch 7.56. Static site built with [Astro](https://astro.build); game data comes from
[XIVAPI v2](https://v2.xivapi.com).

## Two layers

The site is deliberately split so that the parts that can be generated are generated, and the parts
that need a human are easy to drop in:

1. **Generated data** (`src/data/*.json`, `public/icons/`) — beasts, abilities, actions, traits,
   items, Crucible rosters, job quests. Produced by `npm run fetch`; never edit by hand.
2. **Curated content** — everything the game data can't tell you:
   - `src/content/notes/**/*.md` — Markdown notes rendered on the matching page (beast pages,
     Crucible stages, rotation, leveling, gear). Frontmatter carries `status: draft | verified`.
   - `src/data/curated/beast-locations.json` — the beast's level, map coordinates, spawn notes.
   - `src/data/curated/comps.json` — featured familiar team comps.

Every page renders something useful from layer 1 today and shows a "notes pending" stub where
layer 2 is still empty.

## Pages

`/bestiary/` (+ one page per beast) · `/actions/` · `/leveling/` · `/crucible/` (+ one page per battle) ·
`/comps/` · `/gear/`

## Live site

Temporary home while a domain is picked: **https://beastmaster-guide.pages.dev** (Cloudflare
Pages, deployed with `npx wrangler pages deploy dist`). A mirror at
https://nnieuwen.github.io/beastmaster-guide/ rebuilds on every push to `main` via
`.github/workflows/deploy.yml`, which sets `BASE_PATH` so the build lives under a sub-path.
All internal links go through `withBase()` (`src/lib/url.ts`), so either layout works from one
source tree; a real domain later is just `SITE_URL`.

## Commands

```bash
npm install
npm run fetch      # refresh src/data + icons from XIVAPI (needs network)
npm run dev        # http://localhost:4321 (Astro 7 daemonises it; `npx astro dev stop` to stop)
npm run build      # static output in dist/
npm run preview
```

## Data

See [docs/DATA-NOTES.md](docs/DATA-NOTES.md) for which sheets are used and which columns are
still undecoded.
