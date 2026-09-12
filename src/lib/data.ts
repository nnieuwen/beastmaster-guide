// Single import point for generated + curated data, plus the small amount of
// derivation the site does on top of it (Trick tagging, action grouping).

import beastsJson from '../data/beasts.json';
import actionsJson from '../data/actions.json';
import traitsJson from '../data/traits.json';
import itemsJson from '../data/items.json';
import crucibleJson from '../data/crucible.json';
import questsJson from '../data/quests.json';
import metaJson from '../data/meta.json';
import locationsJson from '../data/curated/beast-locations.json';
import compsJson from '../data/curated/comps.json';
import routesJson from '../data/curated/routes.json';
import statusesJson from '../data/statuses.json';
import type { Ability, Beast, BeastLocation, Comp, Crucible, CrucibleBoard, Item, Kin, Meta, Quest, Routes, Status, Trait } from './types';

export const beasts = beastsJson as Beast[];
const allActions = actionsJson as Ability[];
/** Base kit (what the ClassJob=43 search returns). */
export const actions = allActions.filter((a) => !a.upgradeOf);
/** The four level 50 replacements that appear at 250 TP. */
export const upgrades = allActions.filter((a) => !!a.upgradeOf);
export const statuses = statusesJson as Status[];
export const traits = traitsJson as Trait[];
export const items = itemsJson as Item[];
export const crucible = crucibleJson as unknown as Crucible;
export const quests = questsJson as Quest[];
export const meta = metaJson as Meta;
export const locations = locationsJson as Record<string, BeastLocation>;
export const comps = (compsJson as { comps: Comp[] }).comps;
export const routes = routesJson as unknown as Routes;

export const boards = crucible.boards as CrucibleBoard[];
export const boardBySlug = new Map(boards.map((b) => [b.slug, b]));
export const battleById = new Map(crucible.battles.map((b) => [b.id, b]));
/** Which board a battle belongs to. */
export const boardOfBattle = new Map(boards.flatMap((b) => b.battleIds.map((id) => [id, b] as const)));

export const TILE_LABELS: Record<string, string> = {
  start: 'Start',
  battle: 'Enemy',
  elite: 'Elite enemy',
  boss: 'Boss',
  shop: 'Shop',
  campsite: 'Campsite',
  treasure: 'Treasure coffer',
  random: 'Random (triple card)',
};

export const KINS: Kin[] = ['Beastkin', 'Vilekin', 'Cloudkin', 'Seedkin', 'Wavekin', 'Scalekin', 'Soulkin', 'Ashkin'];

export const beastBySlug = new Map(beasts.map((b) => [b.slug, b]));

// The four affinities in gauge order. Completing a pair alternates between the
// two named intentional combos (taken from the axe action tooltips); colours
// match the in-game action icons.
export const AFFINITIES = [
  { key: 'volant', name: 'Volant', action: 'Gale Axe', color: 'var(--c-volant)', combo: 'Moonstalker' },
  { key: 'rampant', name: 'Rampant', action: 'Avalanche Axe', color: 'var(--c-rampant)', combo: 'Sunstrider' },
  { key: 'durant', name: 'Durant', action: 'Mistral Axe', color: 'var(--c-durant)', combo: 'Moonstalker' },
  { key: 'eldritch', name: 'Eldritch', action: 'Spinning Axe', color: 'var(--c-eldritch)', combo: 'Sunstrider' },
] as const;

// ---- familiar kit derivation --------------------------------------------------
//
// Each familiar's Abilities[] is: [0] the instinctual skill Trick fires (costs
// Familiar TP, carries an Instinctual Affinity), [1] the controlled ability
// Tempered Release fires (summarised in XBMPet.controlledAbility), then the
// shared Aetheric Burst (Parting Blow) and Threaten.

export type Affinity = 'Volant' | 'Rampant' | 'Durant' | 'Eldritch';

export function instinctOf(b: Beast): { ability: Ability | undefined; affinity: Affinity | null } {
  const ability = b.abilities[0];
  const m = ability ? /Instinctual Affinity: (Volant|Rampant|Durant|Eldritch)/.exec(ability.description) : null;
  return { ability, affinity: (m?.[1] as Affinity | undefined) ?? null };
}

export const controlledOf = (b: Beast): Ability | undefined => b.abilities[1];

export const affinityColor = (a: Affinity | null) => (a ? `var(--c-${a.toLowerCase()})` : 'var(--muted)');

// The player axe whose Heart sets up a combo *into* this affinity, and the axe
// that follows it — so a Rampant familiar pairs with Gale Axe (Volant) before
// it and Mistral Axe (Durant) after.
export function affinityNeighbours(a: Affinity) {
  const i = AFFINITIES.findIndex((x) => x.name === a);
  return { before: AFFINITIES[(i + 3) % 4], self: AFFINITIES[i], after: AFFINITIES[(i + 1) % 4] };
}

export type RoleTag = 'Damage' | 'Control' | 'Debuff' | 'Buff' | 'Sustain' | 'Sacrifice';

// Rough role tags from a skill summary, for filtering and the comp builder.
export function roleTags(desc: string): RoleTag[] {
  const d = desc.toLowerCase();
  const tags: RoleTag[] = [];
  if (/deals .*damage|delivers .*attack/.test(d)) tags.push('Damage');
  if (/poison|slow|bind|stun|paralyz|petrif|sleep|doom|heaviness|blind|sicken|knocks? back|draws in|freez|nightmare/.test(d)) tags.push('Control');
  if (/lowers .*resistance|vulnerability of enem|reduces enemy accuracy|dispels one beneficial|removes a status/.test(d)) tags.push('Debuff');
  if (/of allies|allies\.|hastens (self|allies)|to allies|self\./.test(d) && /reduces|improves|increases|hastens|keen edge|grants/.test(d)) tags.push('Buff');
  if (/hp absorption|restores|generates beastmaster hp|heal/.test(d)) tags.push('Sustain');
  if (/retreats upon/.test(d)) tags.push('Sacrifice');
  return tags;
}

export function element(desc: string): string | null {
  const m = /(fire|wind|earth|lightning|ice|water)-aspected|dealing (fire|wind|earth|lightning|ice|water) damage/i.exec(desc);
  const e = m?.[1] ?? m?.[2];
  if (e) return e[0].toUpperCase() + e.slice(1).toLowerCase();
  const p = /(slashing|piercing|blunt) physical/i.exec(desc);
  if (p) return p[1][0].toUpperCase() + p[1].slice(1).toLowerCase();
  if (/unaspected/i.test(desc)) return 'Unaspected';
  return null;
}

export const isMagicElement = (e: string | null) => !!e && ['Fire', 'Wind', 'Earth', 'Lightning', 'Ice', 'Water'].includes(e);

export const STAT_NAMES = ['STR', 'INT', 'PHY R', 'MAG R', 'CON'] as const;
/** The rank syncs of the five Crucible boards, plus rank 1. */
export const RANK_MARKS = [1, 5, 10, 15, 20, 25];

export const statsAt = (b: Beast, rank: number): number[] | null => b.stats.ranks[Math.min(Math.max(rank, 1), b.stats.ranks.length) - 1] ?? null;

/** Physical / magical / hybrid attacker, from the STR:INT split at max rank. */
export function build(b: Beast): 'Physical' | 'Magical' | 'Hybrid' | null {
  const s = statsAt(b, 25);
  if (!s) return null;
  const [str, int] = s;
  if (str > int * 1.15) return 'Physical';
  if (int > str * 1.15) return 'Magical';
  return 'Hybrid';
}

export function beastLevel(b: Beast): number | null {
  const loc = locations[b.slug];
  if (loc?.level != null) return loc.level;
  if (b.sourceType === 'duty' && b.source?.level) return b.source.level;
  return null;
}

// Beast abilities that every familiar shares, listed after the two signature skills.
export const SHARED_ABILITIES = new Set(['Aetheric Burst', 'Threaten']);

// ---- player action grouping ------------------------------------------------

export const ACTION_GROUPS: { title: string; blurb: string; names: string[] }[] = [
  {
    title: 'Weaponskill combo',
    blurb: 'The basic 1-2-3. Finishing the chain is what feeds your TP gauge.',
    names: ['Smash Axe', 'Axeblade Bite', 'Shieldsplitter'],
  },
  {
    title: 'Instinctual skills',
    blurb: 'Spend TP (minimum 100, scaling to 1,000 potency at full) and set a Heart for the next affinity in the wheel.',
    names: ['Gale Axe', 'Avalanche Axe', 'Mistral Axe', 'Spinning Axe'],
  },
  {
    title: 'Familiar commands',
    blurb: 'Summon, direct and borrow from your beast.',
    names: ['First Battlehorn', 'Second Battlehorn', 'Third Battlehorn', 'Trick', 'Parting Blow', 'Tempered Release', 'Borrow', 'Beast Mode'],
  },
  {
    title: 'Gauge & utility',
    blurb: 'Capturing, checking odds, gap-closing and cashing in Instinct stacks.',
    names: ['Capture', 'Gauge', 'Shield Charge', 'Rally', 'Rallying Cheer'],
  },
];

export const actionByName = new Map(allActions.map((a) => [a.name, a]));
export const statusByName = new Map(statuses.map((s) => [s.name, s]));

// Notes status helpers ---------------------------------------------------------

export type NoteStatus = 'draft' | 'verified';
