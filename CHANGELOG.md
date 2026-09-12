# Changelog

## Unreleased

### FC guide content + Crucible boards (2026-09-12)

- Crucible restructured around the **five boards** decoded from `XBMContent` and its satellite sheets:
  name, level sync, squad cap, beast rank sync, unlock quest, boss, tile sequence and the tile graph
  (drawn as an SVG map that matches the in-game board preview), random-tile options, and the point
  value of every score bonus per board. Battles moved to `/crucible/battles/<id>/` with board context;
  tile type 3 identified as *elite*; `XBMBattleDetail.Element` relabelled as the piece's weakness.
- **Per-rank beast stats** (STR / INT / PHY R / MAG R / CON, ranks 1–25) from `XBMPetParamGrow` via
  `XBMPet.Unknown8`; shown on beast pages, as a Physical / Magical build column in the bestiary, and as
  squad totals in the comp builder.
- Comp builder: Crucible mode picks a board and sizes the squad to its cap (10–15); featured comps
  carry a board and a source link.
- Actions page: kit-primer slot, the four 250-TP upgrades (Brutal Rage / Hawkish Talons / Risen Fall /
  Calamity) with their Sunstrider / Moonstalker affinities, and 22 Beastmaster status effects.
- Job quests now carry issuer map coordinates computed from the `Level` sheet.
- Guide text from the FC's draft: intro, leveling, kit primer, rotation + the affinity multiplier
  system, BiS gear and food, Crucible overview with Legendary breakpoints and beast-leveling tips,
  normal + Legendary comps for all five boards, per-board strategy tabs, and mechanics for all six
  board-1 battles from the *Legendary Rank & Third Degree* video transcript.
- Third Board of the Unbroken: full Legendary strategy and mechanics for all six fought battles
  (Cavalier/Bishop, Ymir, Zu, Lakhamu, Siren, Guttler) from Mrhappy1227's walkthrough transcript;
  two extra board-1 Legendary trios (Cloudkin, alt Vilekin) from the *Legendary Rank & Third Degree* guide.
- Tier list removed for now (per the FC — nothing to rate yet).
- Fetch script: subrow-aware paging cursor (`after=row:subrow`).

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
