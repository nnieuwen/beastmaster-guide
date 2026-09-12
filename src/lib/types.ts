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
  sourceType: 'starter' | 'field' | 'duty' | string;
  source: BeastSource | null;
  growth: number[];
  growthFlags: boolean[];
  abilities: Ability[];
  raw: { u7: number | null; u8: number | null; u9: number | null; flags: (boolean | null)[] };
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
  element: string | null;
  icon: string | null;
  resistFlags: boolean[];
  action: { name: string; status: string | null; effectType: number | null; target: number | null } | null;
}

export interface CrucibleBattle {
  id: number;
  enemies: CrucibleEnemy[];
}

export interface Crucible {
  battles: CrucibleBattle[];
  scoreRank: { id: number; name: string; raw: Record<string, unknown> }[];
  scoreBonus: { id: number; name: string; description: string; raw: Record<string, unknown> }[];
  content: unknown[];
  contentBattle: unknown[];
  contentCamp: unknown[];
  entrance: { id: number; raw: Record<string, unknown> }[];
}

export interface Quest {
  id: number;
  key: string;
  name: string;
  level: number | null;
  issuer: string;
  zone: string;
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

export interface Tiers {
  tiers: string[];
  placements: Record<string, string>; // beast slug -> tier
  updated?: string;
  notes?: string;
}

export interface Comp {
  name: string;
  beasts: string[]; // slugs
  role?: string;
  notes?: string;
  status?: 'example' | 'draft' | 'verified';
  author?: string;
}
