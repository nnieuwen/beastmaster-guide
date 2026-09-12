# Guide notes

Every Markdown file in this folder is rendered on the page that matches its path. This is where
the written guide lives — the site renders a "pending" stub anywhere a file doesn't exist yet.

| File | Shows up on |
|---|---|
| `intro.md` | home page |
| `leveling.md` | Getting started |
| `rotation.md` | Actions & traits |
| `actions.md` | Actions & traits (kit primer, top of page) |
| `crucible.md` | Crucible overview |
| `gear.md` | Gear |
| `beasts/<slug>.md` | that beast's page (slugs are the URL: `beasts/cu-sith.md`) |
| `crucible/<board>/<anything>.md` | that board's page (`unbroken-1`, `unbroken-2`, `unbroken-3`, `masters-1`, `masters-2`) — every file becomes a tab, so normal clear vs. Legendary run are separate files |
| `crucible/battles/<id>/<anything>.md` | a single battle's page, same tab behaviour |

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
