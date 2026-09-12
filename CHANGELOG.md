# Changelog

## Unreleased

- Project scaffold (Astro 7, static output).
- `scripts/fetch-data.mjs`: pulls Beastmaster data from XIVAPI v2 — 50 beasts with kits, lore,
  sources and classification; player actions and traits; beast gear / feed / Crucible items;
  Crucible battle rosters, ranks and score bonuses; the job quest chain. Icons cached to
  `public/icons/`.
- `docs/DATA-NOTES.md`: sheet inventory and `XBMPet` column decode table.
- Site v1 (opinion-free skeleton, every page reads live game data and has a Markdown/JSON drop-in
  slot for the guide text):
  - Bestiary table with search, classification / source / affinity / role filters, column sort and a
    per-browser capture checklist; a page per beast with lore, source, instinct (Trick) skill and
    affinity, controlled ability (Tempered Release), full kit, growth bars and notes slot.
  - Actions & traits with tooltips, unlock order and the Instinctual Combo wheel (colours taken from
    the axe icons: Volant green, Rampant red, Durant blue, Eldritch yellow).
  - Getting started: unlock steps, Capture rules, job quest chain, beasts by zone and by duty.
  - Crucible: score ranks, all 33 score bonuses, 45 battles with enemy pieces (element, signature
    action); per-battle pages with wtfdig-style strategy tabs (one Markdown file per variant).
  - Team comp builder: 3 Battlehorn slots or a 7-slot Crucible squad, coverage summary (affinities,
    roles, elements, kinships), shareable `?b=` links, featured comps from `curated/comps.json`.
  - Gear / feed / Crucible item tables with effect text; tier list driven by `curated/tiers.json`.
  - Dark/light theme, static HTML for every page (104 pages).
