# Guide notes

Every Markdown file in this folder is rendered on the page that matches its path. This is where
the written guide lives — the site renders a "pending" stub anywhere a file doesn't exist yet.

| File | Shows up on |
|---|---|
| `intro.md` | home page |
| `leveling.md` | Getting started |
| `rotation.md` | Actions & traits |
| `crucible.md` | Crucible overview |
| `gear.md` | Gear |
| `tier-list.md` | Tier list (rationale; placements live in `src/data/curated/tiers.json`) |
| `beasts/<slug>.md` | that beast's page (slugs are the URL: `beasts/cu-sith.md`) |
| `crucible/<battle>/<anything>.md` | that battle's page — every file becomes a tab, so alternate strats are separate files |

Frontmatter:

```yaml
---
title: Optional heading
status: draft        # or verified — shows as a badge
author: Your name
updated: 2026-09-12
variant: Safe route  # Crucible files only: the tab label
order: 1             # Crucible files only: tab order
---
```

Plain Markdown below the frontmatter. Images go in `public/` and are referenced as `/whatever.png`.
