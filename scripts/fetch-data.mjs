// Pulls Beastmaster data from XIVAPI v2 into src/data/*.json and public/icons/.
//
// XIVAPI v2 serves the game's own data sheets (the same EXD tables Dalamud /
// Lumina read in-game). Beastmaster's sheets are prefixed "XBM". As of Patch
// 7.56 the community schema (EXDSchema) has only mapped some of their columns;
// unmapped ones are still reachable by asking for "UnknownN" fields by name.
// We keep those raw values under `raw` so decoding later is a rename in the
// site code, not a re-fetch. See docs/DATA-NOTES.md for the decode table.
//
// Usage: npm run fetch          (re-downloads JSON; icons are cached on disk)
//        npm run fetch -- --icons=skip   to skip icon downloads entirely

import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = join(ROOT, 'src', 'data');

const BASE = 'https://v2.xivapi.com/api';
// XIVAPI blocks requests without a descriptive User-Agent.
const HEADERS = { 'User-Agent': 'beastmaster-guide fetch-data (https://github.com/nnieuwenhuis/beastmaster-guide)' };
const BST_CLASSJOB = 43;
const SKIP_ICONS = process.argv.includes('--icons=skip');

// ---------------------------------------------------------------- helpers ---

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, params = {}) {
  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v));
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) {
      const wait = 1500 * attempt;
      console.warn(`  ${res.status} on ${url.pathname}; retrying in ${wait}ms`);
      await sleep(wait);
      continue;
    }
    throw new Error(`${res.status} ${res.statusText} for ${url}`);
  }
  throw new Error(`gave up on ${url}`);
}

// Every row of a sheet. XIVAPI pages with `after=<last row id>`.
async function allRows(sheet, fields, extra = {}) {
  const rows = [];
  let after;
  for (;;) {
    const page = await api(`sheet/${sheet}`, { fields, limit: 500, after, ...extra });
    rows.push(...page.rows);
    if (page.rows.length < 500) return { rows, version: page.version, schema: page.schema };
    after = page.rows.at(-1).row_id;
  }
}

async function rowsById(sheet, ids, fields) {
  const unique = [...new Set(ids)].filter((id) => id > 0).sort((a, b) => a - b);
  const out = new Map();
  for (let i = 0; i < unique.length; i += 100) {
    const chunk = unique.slice(i, i + 100);
    const page = await api(`sheet/${sheet}`, { rows: chunk.join(','), fields });
    for (const r of page.rows) out.set(r.row_id, r.fields);
  }
  return out;
}

// Unmapped columns come back as "UnknownN". Asking for ones that don't exist
// is harmless (they're silently omitted), so we ask for a generous range.
const unknownFields = (n = 64) => Array.from({ length: n }, (_, i) => `Unknown${i}`).join(',');

// A relation field looks like { value, sheet, row_id, fields: {...} }.
const rel = (f) => (f && typeof f === 'object' && 'row_id' in f ? f : null);
const relName = (f, key = 'Name') => rel(f)?.fields?.[key] ?? '';

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Sheet names are lowercase common nouns ("squirrel", "Cu Sith"); show them
// in title case but keep the raw form for anything that needs exact matching.
const titleCase = (s) => s.replace(/(^|[\s-])([a-z])/g, (m, p, c) => p + c.toUpperCase());

// Descriptions arrive with game formatting stripped to plain text but still
// carry "\n" line breaks. The familiar-name payload in "Summons your <pet> to
// fight" is dropped by the API, leaving a double space; restore a generic noun.
const cleanText = (s) =>
  typeof s === 'string'
    ? s.replace(/\r/g, '').replace(/your {2,}to fight/g, 'your familiar to fight').replace(/[ \t]+\n/g, '\n').trim()
    : '';

const iconPath = (id) => {
  const folder = String(Math.floor(id / 1000) * 1000).padStart(6, '0');
  return `ui/icon/${folder}/${String(id).padStart(6, '0')}_hr1.tex`;
};

const iconQueue = new Map(); // public path -> tex path
function wantIcon(kind, id) {
  if (!id) return null;
  const pub = `/icons/${kind}/${id}.png`;
  iconQueue.set(pub, iconPath(id));
  return pub;
}

async function downloadIcons() {
  if (SKIP_ICONS) return console.log('skipping icons (--icons=skip)');
  const entries = [...iconQueue.entries()];
  let done = 0, fetched = 0;
  const worker = async () => {
    while (entries.length) {
      const [pub, tex] = entries.shift();
      const file = join(ROOT, 'public', pub);
      done++;
      if (await access(file).then(() => true, () => false)) continue;
      await mkdir(dirname(file), { recursive: true });
      let res = await fetch(`${BASE}/asset?path=${tex}&format=png`, { headers: HEADERS });
      if (!res.ok) res = await fetch(`${BASE}/asset?path=${tex.replace('_hr1', '')}&format=png`, { headers: HEADERS });
      if (!res.ok) { console.warn(`  icon missing: ${tex}`); continue; }
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
      fetched++;
      await sleep(60);
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  console.log(`icons: ${done} referenced, ${fetched} downloaded, ${done - fetched} cached`);
}

// Deterministic output: sorted keys at every level so re-runs diff cleanly.
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k) => [k, stable(value[k])]));
  return value;
}
async function writeJson(name, data) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(join(DATA_DIR, name), JSON.stringify(stable(data), null, 2) + '\n');
  console.log(`wrote src/data/${name}`);
}

// Collect the UnknownN columns of a row into { raw: { u0: ..., u1: ... } }.
function rawOf(fields) {
  const raw = {};
  for (const [k, v] of Object.entries(fields)) {
    const m = /^Unknown(\d+)$/i.exec(k);
    if (m) raw[`u${m[1]}`] = v;
  }
  return raw;
}

// ---------------------------------------------------------------- actions ---

const ACTION_FIELDS = [
  'Name', 'ClassJobLevel', 'ActionCategory.Name', 'Icon', 'ClassJob.Abbreviation', 'IsPvP', 'IsPlayerAction',
  'Cast100ms', 'Recast100ms', 'CooldownGroup', 'AdditionalCooldownGroup', 'MaxCharges',
  'PrimaryCostType', 'PrimaryCostValue', 'SecondaryCostType', 'SecondaryCostValue',
  'Range', 'EffectRange', 'CastType', 'ActionCombo.Name', 'PreservesCombo', 'TargetArea',
  'CanTargetSelf', 'CanTargetParty', 'CanTargetHostile', 'BehaviourType',
].join(',');

async function actionDetails(ids) {
  const rows = await rowsById('Action', ids, ACTION_FIELDS);
  const transient = await rowsById('ActionTransient', ids, 'Description');
  const out = new Map();
  for (const [id, f] of rows) {
    out.set(id, {
      id,
      name: f.Name,
      level: f.ClassJobLevel,
      category: relName(f.ActionCategory),
      job: relName(f.ClassJob, 'Abbreviation'),
      icon: wantIcon('actions', f.Icon?.id),
      description: cleanText(transient.get(id)?.Description),
      cast: f.Cast100ms / 10,
      recast: f.Recast100ms / 10,
      cooldownGroup: f.CooldownGroup,
      maxCharges: f.MaxCharges,
      cost: { type: f.PrimaryCostType, value: f.PrimaryCostValue },
      range: f.Range,
      effectRange: f.EffectRange,
      combo: relName(f.ActionCombo) || null,
      preservesCombo: f.PreservesCombo,
      targets: { self: f.CanTargetSelf, party: f.CanTargetParty, hostile: f.CanTargetHostile, area: f.TargetArea },
    });
  }
  return out;
}

async function fetchPlayerActions() {
  // Search resolves plain equality on the ClassJob column; boolean lookups
  // through ClassJobCategory don't, so we filter PvP out client-side.
  const search = await api('search', { sheets: 'Action', query: `ClassJob=${BST_CLASSJOB}`, fields: 'Name,IsPvP', limit: 200 });
  const ids = search.results.filter((r) => !r.fields.IsPvP).map((r) => r.row_id);
  const details = await actionDetails(ids);
  return [...details.values()].sort((a, b) => a.level - b.level || a.id - b.id);
}

async function fetchTraits() {
  const search = await api('search', { sheets: 'Trait', query: `ClassJob=${BST_CLASSJOB}`, fields: 'Name,Level,Icon', limit: 100 });
  const ids = search.results.map((r) => r.row_id);
  const transient = await rowsById('TraitTransient', ids, 'Description');
  return search.results
    .map((r) => ({
      id: r.row_id,
      name: r.fields.Name,
      level: r.fields.Level,
      icon: wantIcon('traits', r.fields.Icon?.id),
      description: cleanText(transient.get(r.row_id)?.Description),
    }))
    .sort((a, b) => a.level - b.level || a.id - b.id);
}

// ----------------------------------------------------------------- beasts ---

// XBMPet Unknown7 indexes the eight familiar classifications in the same
// order Borrow's tooltip lists them (verified against every beast by hand).
const KIN = [null, 'Beastkin', 'Vilekin', 'Cloudkin', 'Seedkin', 'Wavekin', 'Scalekin', 'Soulkin', 'Ashkin'];

async function fetchBeasts() {
  const fields = [
    'Pet.Name', 'Action.Name', 'Location.Name', 'Location.PlaceName.Name', 'Location.ClassJobLevelRequired',
    'Location.ContentType.Name', 'LocationKey', unknownFields(),
    // A second batch of booleans is mapped with a lowercase prefix.
    'unknown39', 'unknown40', 'unknown41', 'unknown42', 'unknown43',
  ].join(',');
  const { rows, version, schema } = await allRows('XBMPet', fields);
  const pets = rows.filter((r) => r.row_id > 0 && relName(r.fields.Pet));

  // Beast skill kits live on the Pet sheet, one Action id per Abilities slot.
  const petIds = pets.map((r) => rel(r.fields.Pet).row_id);
  const petRows = await rowsById('Pet', petIds, 'Name,Abilities[].Name');
  const abilityIds = [...petRows.values()].flatMap((p) => (p.Abilities ?? []).map((a) => a.row_id));
  const abilities = await actionDetails(abilityIds);

  const beasts = pets.map((r) => {
    const f = r.fields;
    const raw = rawOf(f);
    const nameRaw = relName(f.Pet);
    const loc = rel(f.Location);
    const sourceType = ['starter', 'field', 'duty'][f.LocationKey] ?? `unknown-${f.LocationKey}`;
    let source = null;
    if (loc && loc.row_id > 0) {
      source = loc.sheet === 'ContentFinderCondition'
        ? { kind: 'duty', id: loc.row_id, name: loc.fields.Name, level: loc.fields.ClassJobLevelRequired, contentType: relName(loc.fields.ContentType) }
        : { kind: 'zone', id: loc.row_id, name: loc.fields.Name };
    }
    const kit = (petRows.get(rel(f.Pet).row_id)?.Abilities ?? [])
      .map((a) => a.row_id)
      .filter((id) => id > 0)
      .map((id) => abilities.get(id))
      .filter(Boolean);
    const growth = Array.isArray(raw.u11) ? raw.u11 : [];
    return {
      id: r.row_id,
      slug: slugify(nameRaw),
      name: titleCase(nameRaw),
      nameRaw,
      petId: rel(f.Pet).row_id,
      icon: wantIcon('beasts', raw.u3),
      iconId: raw.u3 ?? null,
      lore: cleanText(raw.u0),
      autoAttack: { actionId: rel(f.Action)?.row_id ?? 0, description: cleanText(raw.u1) },
      trick: { description: cleanText(raw.u2) },
      kin: KIN[raw.u7] ?? null,
      sourceType,
      source,
      growth: growth.filter((v) => typeof v === 'number'),
      growthFlags: growth.filter((v) => typeof v === 'boolean'),
      abilities: kit,
      // Undecoded columns; see docs/DATA-NOTES.md before relying on these.
      raw: { u7: raw.u7 ?? null, u8: raw.u8 ?? null, u9: raw.u9 ?? null, flags: [39, 40, 41, 42, 43].map((i) => raw[`u${i}`] ?? null) },
    };
  });
  return { beasts, version, schema };
}

// -------------------------------------------------------------- items etc ---

async function fetchItems() {
  // XBMItem is fully mapped in the schema, unlike most XBM sheets.
  const { rows } = await allRows('XBMItem', 'Name,Singular,Icon,Description,ShortDescription,SellPrice,Type.Name');
  return rows
    .filter((r) => r.fields.Name)
    .map((r) => ({
      id: r.row_id,
      slug: slugify(r.fields.Name),
      name: r.fields.Name,
      type: relName(r.fields.Type),
      icon: wantIcon('items', r.fields.Icon?.id),
      description: cleanText(r.fields.Description),
      shortDescription: cleanText(r.fields.ShortDescription),
      sellPrice: r.fields.SellPrice,
    }))
    .sort((a, b) => a.id - b.id);
}

async function fetchElements() {
  const { rows } = await allRows('XBMElement', 'Name');
  return rows.filter((r) => r.fields.Name.trim()).map((r) => ({ id: r.row_id, name: r.fields.Name.trim() }));
}

async function fetchCrucible() {
  // Each XBMBattleDetail row is one battle; subrows are the enemy pieces on
  // the board. Unknown1 is the piece icon and Unknown2 links the piece's
  // signature action (both already typed in the schema, just unnamed).
  const detail = await allRows(
    'XBMBattleDetail',
    'Name.Singular,Element.Name,Resist.Unknown0,Unknown1,Unknown2.Action.Name,Unknown2.Status.Name,Unknown2.ActionEffectType,Unknown2.ActionTarget',
  );
  const battles = new Map();
  for (const r of detail.rows) {
    const name = relName(r.fields.Name, 'Singular');
    if (!name) continue;
    if (!battles.has(r.row_id)) battles.set(r.row_id, { id: r.row_id, enemies: [] });
    const act = rel(r.fields.Unknown2);
    battles.get(r.row_id).enemies.push({
      slot: r.subrow_id,
      name,
      bnpcNameId: rel(r.fields.Name).row_id,
      element: relName(r.fields.Element).trim() || null,
      icon: wantIcon('pieces', r.fields.Unknown1?.id),
      resistFlags: rel(r.fields.Resist)?.fields?.Unknown0 ?? [],
      action: act && act.row_id > 0
        ? {
            name: relName(act.fields.Action),
            status: relName(act.fields.Status) || null,
            effectType: rel(act.fields.ActionEffectType)?.row_id ?? null,
            target: rel(act.fields.ActionTarget)?.row_id ?? null,
          }
        : null,
    });
  }
  const rawSheet = async (sheet) => {
    const { rows } = await allRows(sheet, unknownFields());
    return rows.map((r) => ({ id: r.row_id, ...(r.subrow_id !== undefined ? { sub: r.subrow_id } : {}), raw: rawOf(r.fields) }))
      .filter((r) => Object.values(r.raw).some((v) => v !== 0 && v !== '' && v !== false && v !== null));
  };
  const scoreRank = (await rawSheet('XBMScoreRank')).map((r) => ({ id: r.id, name: r.raw.u0, raw: r.raw }));
  const scoreBonus = (await rawSheet('XBMScoreBonus')).map((r) => ({ id: r.id, name: r.raw.u0, description: cleanText(r.raw.u1), raw: r.raw }));
  return {
    battles: [...battles.values()].sort((a, b) => a.id - b.id),
    scoreRank,
    scoreBonus,
    // Everything below is still schema-less; stored so the site can start
    // decoding once someone (or EXDSchema) works out the columns.
    content: await rawSheet('XBMContent'),
    contentBattle: await rawSheet('XBMContentBattle'),
    contentCamp: await rawSheet('XBMContentCamp'),
    entrance: await rawSheet('XBMEntrance'),
  };
}

// Job quests. The quest text sheets are named quest/054/JobXbm001_05490 etc;
// the trailing number is the Quest sheet row id offset from 65536.
async function fetchQuests() {
  const numbers = [5490, 5491, 5492, 5493, 5494, 5495, 5496, 5497, 5498, 5499, 5500, 5501, 5509];
  const ids = numbers.map((n) => 65536 + n);
  const rows = await rowsById('Quest', ids, 'Name,Id,ClassJobLevel,IssuerStart.Singular,IssuerLocation.Territory.PlaceName.Name,PreviousQuest[].Name,Expansion.Name');
  return [...rows.entries()]
    .filter(([, f]) => f.Name)
    .map(([id, f]) => ({
      id,
      key: f.Id,
      name: f.Name,
      level: Array.isArray(f.ClassJobLevel) ? (f.ClassJobLevel.find((l) => l > 0) ?? null) : f.ClassJobLevel ?? null,
      issuer: relName(f.IssuerStart, 'Singular'),
      zone: rel(f.IssuerLocation)?.fields?.Territory?.fields?.PlaceName?.fields?.Name ?? '',
      previous: (f.PreviousQuest ?? []).map((q) => relName(q)).filter(Boolean),
      expansion: relName(f.Expansion),
    }))
    .sort((a, b) => (a.level ?? 0) - (b.level ?? 0) || a.id - b.id);
}

// ------------------------------------------------------------------- main ---

const job = (await api(`sheet/ClassJob/${BST_CLASSJOB}`, { fields: 'Name,Abbreviation,NameEnglish,Role,LimitBreak1.Name' })).fields;
console.log(`job: ${job.NameEnglish} (${job.Abbreviation})`);

const { beasts, version, schema } = await fetchBeasts();
console.log(`beasts: ${beasts.length}`);
const actions = await fetchPlayerActions();
console.log(`actions: ${actions.length}`);
const traits = await fetchTraits();
console.log(`traits: ${traits.length}`);
const items = await fetchItems();
console.log(`items: ${items.length}`);
const elements = await fetchElements();
const crucible = await fetchCrucible();
console.log(`crucible battles: ${crucible.battles.length}`);
const quests = await fetchQuests();
console.log(`quests: ${quests.length}`);

await writeJson('beasts.json', beasts);
await writeJson('actions.json', actions);
await writeJson('traits.json', traits);
await writeJson('items.json', items);
await writeJson('elements.json', elements);
await writeJson('crucible.json', crucible);
await writeJson('quests.json', quests);
await writeJson('meta.json', {
  fetchedAt: new Date().toISOString(),
  patch: '7.56',
  xivapi: { base: BASE, version, schema },
  job: { id: BST_CLASSJOB, name: job.NameEnglish, abbreviation: job.Abbreviation, role: job.Role },
  counts: { beasts: beasts.length, actions: actions.length, traits: traits.length, items: items.length, crucibleBattles: crucible.battles.length, quests: quests.length },
});

await downloadIcons();
console.log('done');
