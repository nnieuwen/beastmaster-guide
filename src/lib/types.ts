// Shapes of the generated JSON in src/data (see scripts/fetch-data.mjs).

export interface Ability {
  id: number;
  name: string;
  level: number;
  category: string;
  job: string;
  icon: string | null;
  description: string;
  cast: number;
  recast: number;
  cooldownGroup: number;
  maxCharges: number;
  cost: { type: number; value: number };
  range: number;
  effectRange: number;
  combo: string | null;
  preservesCombo: boolean;
  targets: { self: boolean; party: boolean; hostile: boolean; area: boolean };
  /** Level 50 upgrades only: the axe this replaces at 250 TP. */
  upgradeOf?: string | null;
}

export interface Status {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  maxStacks: number;
}

export type Kin = 'Beastkin' | 'Vilekin' | 'Cloudkin' | 'Seedkin' | 'Wavekin' | 'Scalekin' | 'Soulkin' | 'Ashkin';

export interface BeastSource {
  kind: 'zone' | 'duty';
  id: number;
  name: string;
  level?: number;
  contentType?: string;
}

export interface Beast {
  id: number;
  slug: string;
  name: string;
  nameRaw: string;
  petId: number;
  icon: string | null;
  iconId: number | null;
  lore: string;
  autoAttack: { actionId: number; description: string };
  controlledAbility: { description: string };
  kin: Kin | null;
  /** Per-rank [STR, INT, PHY R, MAG R, CON], index 0 = rank 1. */
  stats: { profileId: number | null; ranks: number[][] };
  sourceType: 'starter' | 'field' | 'duty' | string;
  source: BeastSource | null;
  growth: number[];
  growthFlags: boolean[];
  abilities: Ability[];
  raw: { u7: number | null; u9: number | null; flags: (boolean | null)[] };
}

export interface Trait {
  id: number;
  name: string;
  level: number;
  icon: string | null;
  description: string;
}

export interface Item {
  id: number;
  slug: string;
  name: string;
  type: string;
  icon: string | null;
  description: string;
  shortDescription: string;
  sellPrice: number;
}

export interface CrucibleEnemy {
  slot: number;
  name: string;
  bnpcNameId: number;
  /** The damage type / element the piece is weak to. */
  weakness: string | null;
  icon: string | null;
  resistFlags: boolean[];
  action: { name: string; status: string | null; effectType: number | null; target: number | null } | null;
}

export interface CrucibleBattle {
  id: number;
  enemies: CrucibleEnemy[];
}

export type TileType = 'start' | 'battle' | 'elite' | 'boss' | 'shop' | 'campsite' | 'treasure' | 'random';

export interface CrucibleTileRef {
  type: TileType | string;
  typeCode: number;
  index: number;
  battleId?: number | null;
  familiars?: number | null;
}

export interface CrucibleTile extends CrucibleTileRef {
  node: number;
  move: number;
  options?: CrucibleTileRef[];
}

export interface CrucibleBoard {
  id: number;
  slug: string;
  name: string;
  level: number;
  sync: number;
  squadSize: number;
  rankSync: number;
  unlockQuestId: number | null;
  modeBonuses: { first: number; second: number; third: number };
  /** Points for each XBMScoreBonus (by id) on this board; 0 = not available here. */
  bonusPoints: number[];
  bossBattleId: number | null;
  battleIds: number[];
  campsites: number[];
  tiles: CrucibleTile[];
  map: { nodes: { id: number; x: number; y: number }[]; edges: { from: number; to: number; kind: number }[] };
  raw: { u35: number | null };
}

export interface Crucible {
  battles: CrucibleBattle[];
  boards: CrucibleBoard[];
  scoreRank: { id: number; name: string; raw: Record<string, unknown> }[];
  scoreBonus: { id: number; name: string; description: string; raw: Record<string, unknown> }[];
}

export interface Quest {
  id: number;
  key: string;
  name: string;
  level: number | null;
  issuer: string;
  zone: string;
  coords: { x: number; y: number } | null;
  previous: string[];
  expansion: string;
}

export interface Meta {
  fetchedAt: string;
  patch: string;
  xivapi: { base: string; version: string; schema: string };
  job: { id: number; name: string; abbreviation: string; role: number };
  counts: Record<string, number>;
}

// ---- curated (hand-maintained) -------------------------------------------

export interface BeastLocation {
  level?: number | null;
  zone?: string;
  x?: number | null;
  y?: number | null;
  notes?: string;
  source?: string;
  verified?: boolean;
}

/** Hand-drawn routes over a board's tile graph: node ids in walking order. */
export type Routes = Record<string, { label: string; nodes: number[]; source?: string }[]>;

export interface Tiers {
  tiers: string[];
  placements: Record<string, string>; // beast slug -> tier
  updated?: string;
  notes?: string;
}

export interface Comp {
  name: string;
  beasts: string[]; // slugs
  /** Crucible board slug this comp is for, if any. */
  board?: string;
  source?: string; // URL
  role?: string;
  notes?: string;
  status?: 'example' | 'draft' | 'verified';
  author?: string;
}
