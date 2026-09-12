# Data notes

Where every number on the site comes from, and which columns are still a guess.

## Source

[XIVAPI v2](https://v2.xivapi.com/api) serves the game's EXD data sheets — the same tables
Dalamud/Lumina read out of the client. `scripts/fetch-data.mjs` pulls them into `src/data/*.json`
and downloads icons to `public/icons/`. The community schema ([EXDSchema](https://github.com/xivdev/EXDSchema))
names the columns; for the new Beastmaster sheets (prefix `XBM`) many columns are still unnamed and
come back as `UnknownN`. We fetch those by name and keep them under `raw` so decoding later is a
rename in the site code, not a re-fetch.

Practical notes:

- Requests need a descriptive `User-Agent` or they 403.
- Array columns are filtered with `Field[].Sub`, e.g. `Abilities[].Name`. Plain `Abilities.Name` is a 400.
- `fields=*` expands every mapped column; `fields=Unknown0,Unknown1,…` returns unmapped ones and
  silently drops names that don't exist. A second batch of booleans on `XBMPet` is exposed with a
  lowercase prefix (`unknown39`–`unknown43`).
- Boolean search on `ClassJobCategory` doesn't resolve; `ClassJob=43` does, so PvP actions are
  filtered client-side.
- Quest row id = 65536 + the number in the quest's internal key (`JobXbm001_05490` → 71026).
- Icons: `/api/asset?path=ui/icon/242000/242001_hr1.tex&format=png`, falling back to the non-`_hr1` path.
- Paging on sheets with subrows needs `after=<row>:<subrow>`; a bare `after=<row>` resumes at subrow 1 and
  duplicates/skips rows (bit us on `XBMPetParamGrow`).

## Sheets used

| Sheet | Rows | What we take |
|---|---|---|
| `ClassJob` 43 | 1 | name, abbreviation `BST`, role |
| `XBMPet` | 50 | one row per beast — see decode table below |
| `Pet` (via `XBMPet.Pet`) | 50 | `Name`, `Abilities[]` → the beast's four actions |
| `XBMPetParamGrow` | 38 profiles × 25 ranks | STR / INT / PHY R / MAG R / CON per rank; `XBMPet.Unknown8` picks the profile. Rows 1–4 (30 subrows) are something else. |
| `Status` 4595–4626 | 22 | Hearts, Sunstrider / Moonstalker, One with Nature, the eight Kinships, Lingering Vantage, Interest Captured, the "-skin" Beast Mode effects |
| `Action` 44930–44933 | 4 | Brutal Rage / Hawkish Talons / Risen Fall / Calamity — the 250-TP upgrades (ClassJob 0, so found by name) |
| `XBMContent` | 5 boards | name via `ContentFinderCondition`, level sync, squad cap (`Unknown34`), rank sync (`Unknown36`), Crucible Mode bonuses (`Unknown30/31/32` = 4000 / 6250 / 9000) |
| `XBMContentBattle` | 5 × subrows | battle ids per board; **subrow 0 is the boss** |
| `XBMEntrance` | 5 | `Unknown0` = unlock quest id, `Unknown1` = board |
| `XBMContentCamp` | 5 × subrows | campsite index → "up to N familiars" healed |
| `XBMContentStageEvent` | 5 × subrows | tiles in order: `Unknown0` type, `Unknown1` move number, `Unknown2` index into the type's list |
| `XBMContentStageEventMap` | 5 × subrows | map graph: kind 1 rows are nodes (x, y, id); other kinds are edges from→to (6 up, 9/4 up-left, 10/5 up-right, 7/8 sideways) |
| `XBMRandomStageEvent` + `XBMContentRandomStageEvent` | — | what a "triple card" tile can resolve into |
| `Action` / `ActionTransient` | ~220 | player actions (`ClassJob=43`, non-PvP) and beast abilities; descriptions from the transient sheet |
| `Trait` / `TraitTransient` | 14 | traits by level |
| `XBMItem` / `XBMItemType` | 203 | beast gear, feed, Crucible items — fully mapped (`Description`, `SellPrice`, `Type`) |
| `XBMElement` | 9 | Fire … Water, Blunt / Piercing / Slashing |
| `XBMBattleDetail` (+`XBMBattleDetailAction`) | 45 battles | Crucible enemy pieces: name, element, resist flags, icon, signature action |
| `XBMScoreRank`, `XBMScoreBonus` | 9, 33 | Crucible ranks (Legendary, Apex, Elite…) and score bonuses with descriptions |
| `XBMContent`, `XBMContentBattle`, `XBMContentCamp`, `XBMEntrance` | — | stored raw, undecoded |
| `Quest` 71026–71045 | 13 | the BST job quest chain |

## `XBMPet` decode table

| Column | Decoded as | Confidence | Notes |
|---|---|---|---|
| `Pet` | `petId`, `name` | mapped | link to `Pet` |
| `Action` | `autoAttack.actionId` | mapped | an unnamed Auto-attack row; its damage type is described in `Unknown1` |
| `Location`, `LocationKey` | `source`, `sourceType` | mapped | key 0 starter / 1 field zone (`PlaceName`) / 2 duty (`ContentFinderCondition`) |
| `Unknown0` | `lore` | certain | bestiary flavour text |
| `Unknown1` | `autoAttack.description` | certain | "Delivers a slashing physical attack." |
| `Unknown2` | `controlledAbility.description` | certain | summary of the familiar's second skill — the "controlled ability" Tempered Release fires. (The first skill, fired by Trick, is the instinctual one; its tooltip carries `Instinctual Affinity: …`.) |
| `Unknown3` | `iconId` | certain | 242001–242050 |
| `Unknown7` | `kin` | high | 1–8 in the order Borrow lists classifications: Beastkin, Vilekin, Cloudkin, Seedkin, Wavekin, Scalekin, Soulkin, Ashkin. Checked against all 50. |
| `Unknown8` | `stats.profileId` | certain | row of `XBMPetParamGrow`; verified against six beasts' in-game stat lines |
| `Unknown9` | `raw.u9` | **unknown** | 1–5; 1 = every Vilekin, 5 = every Ashkin, 4 = Lamb + Behemoth. Body/size class? |
| `Unknown11` | `growth`, `growthFlags` | **unknown** | five ints 76–100 then six booleans. Displayed stats come from the profile, not these — they may weight rank XP or the "Recommended Team" picker |
| `unknown39`–`43` | `raw.flags` | **unknown** | booleans |

Not in any sheet, so it lives in `src/data/curated/`: the beast's own level, map coordinates,
spawn conditions, capture tips.

## `XBMBattleDetail` decode

`Name` → `BNpcName`, `Element` → `XBMElement` — this is the piece's **weakness** (the board preview
shows Pas de Seul weak to Piercing and the succubi to Fire, exactly the sheet's values), `Resist` →
`BNpcResist` (11 booleans, meaning unknown), `Unknown1` = piece icon, `Unknown2` →
`XBMBattleDetailAction` (`Action`, `Status`, `ActionEffectType`, `ActionTarget` — the last two point at
unmapped sheets and are stored as ids). The star ratings for Strength / Intelligence / resistances in
the preview haven't been located.

## Crucible boards

Pinned down against the in-game board preview for the First Board of the Unbroken ("Move 9: Boss",
"Move 8: Shop #1", "Move 7: Campsite #2 … up to 2 familiars") and the FC guide's team screenshots
(squad caps 10 / 12 / 14 / 12 / 15):

- Tile type codes (`XBMContentStageEvent.Unknown0`): 1 start, 2 and 3 enemy battles (the difference
  between 2 and 3 is not known), 4 boss, 5 shop, 6 campsite, 7 treasure coffer, 8 random "triple card".
  Displayed "#n" is `Unknown2 + 1`. For battle types `Unknown2` indexes `XBMContentBattle` (0 = boss).
- Node ids in `XBMContentStageEventMap` are sequential in tile order: the k-th non-start tile is node
  k, node 0 is the start. Move number = graph depth from the start on boards 1–4; board 5 has sideways
  edges so its move numbers come from the sheet, not the graph.
- `XBMContent.Unknown35` (3 / 8 / 13 / 18 / 23) is still unknown — the preview shows "Recommended
  Beast Rank 1 (Sync from 5)" on board 1, which doesn't match it.

## Refreshing

```bash
npm run fetch
```

Output is key-sorted and stably ordered so a re-run after a patch produces a reviewable diff.
Icons already on disk are skipped; delete `public/icons/` to force a re-download.
