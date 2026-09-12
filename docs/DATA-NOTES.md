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

## Sheets used

| Sheet | Rows | What we take |
|---|---|---|
| `ClassJob` 43 | 1 | name, abbreviation `BST`, role |
| `XBMPet` | 50 | one row per beast — see decode table below |
| `Pet` (via `XBMPet.Pet`) | 50 | `Name`, `Abilities[]` → the beast's four actions |
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
| `Unknown2` | `trick.description` | certain | what Trick does for this beast |
| `Unknown3` | `iconId` | certain | 242001–242050 |
| `Unknown7` | `kin` | high | 1–8 in the order Borrow lists classifications: Beastkin, Vilekin, Cloudkin, Seedkin, Wavekin, Scalekin, Soulkin, Ashkin. Checked against all 50. |
| `Unknown8` | `raw.u8` | **unknown** | 5–50 with duplicates; not level, not sort order |
| `Unknown9` | `raw.u9` | **unknown** | 1–5; 1 = every Vilekin, 5 = every Ashkin, 4 = Lamb + Behemoth. Body/size class? |
| `Unknown11` | `growth`, `growthFlags` | medium | five ints 76–100 that look like stat growth %, then six booleans |
| `unknown39`–`43` | `raw.flags` | **unknown** | booleans |

Not in any sheet, so it lives in `src/data/curated/`: the beast's own level, map coordinates,
spawn conditions, capture tips.

## `XBMBattleDetail` decode

`Name` → `BNpcName`, `Element` → `XBMElement`, `Resist` → `BNpcResist` (11 booleans, meaning
unknown), `Unknown1` = piece icon, `Unknown2` → `XBMBattleDetailAction` (`Action`, `Status`,
`ActionEffectType`, `ActionTarget` — the last two point at unmapped sheets and are stored as ids).

## Refreshing

```bash
npm run fetch
```

Output is key-sorted and stably ordered so a re-run after a patch produces a reviewable diff.
Icons already on disk are skipped; delete `public/icons/` to force a re-download.
