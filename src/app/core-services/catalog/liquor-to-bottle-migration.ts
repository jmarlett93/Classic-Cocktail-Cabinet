import { Liqour, LiqourType, liquors } from '../../models/recipe-book';
import {
  BottleRecord,
  FlavorSpace,
  FlavorWeights,
} from '../../models/catalog-types';

const SCHEMA_VERSION = 1;
const FLAVOR_SPACE: FlavorSpace = 'v1';

/** Maps legacy tag strings to v1 flavor dimension weights. */
const TAG_TO_FLAVOR: Record<string, FlavorWeights> = {
  bitter: { bitter: 0.8 },
  sweet: { sweet: 0.75 },
  dry: { dry: 0.8 },
  herbal: { herbal: 0.75 },
  botanical: { herbal: 0.7 },
  aromatic: { herbal: 0.5, floral: 0.35 },
  citrus: { citrus: 0.8 },
  orange: { citrus: 0.65, fruity: 0.25 },
  bright: { bright: 0.8 },
  zesty: { citrus: 0.7, bright: 0.6 },
  warm: { hot: 0.55, rich: 0.35 },
  hot: { hot: 0.7 },
  smoky: { smoky: 0.85 },
  peaty: { smoky: 0.8, earthy: 0.4 },
  spicy: { spicy: 0.75 },
  peppery: { spicy: 0.7 },
  fruity: { fruity: 0.75 },
  floral: { floral: 0.7 },
  earthy: { earthy: 0.7 },
  vegetal: { earthy: 0.6, herbal: 0.35 },
  oak: { oak: 0.75 },
  rich: { rich: 0.7 },
  dark: { rich: 0.55, earthy: 0.35 },
  caramel: { sweet: 0.45, rich: 0.4 },
  nutty: { nutty: 0.75 },
  creamy: { creamy: 0.7 },
  syrupy: { sweet: 0.65, rich: 0.45 },
  salty: { salty: 0.6 },
  malty: { rich: 0.5, nutty: 0.35 },
  crisp: { bright: 0.55, dry: 0.45 },
  clean: { bright: 0.45, dry: 0.35 },
  light: { bright: 0.5 },
  neutral: { dry: 0.4 },
  refreshing: { bright: 0.55, citrus: 0.25 },
  tropical: { fruity: 0.65 },
  cherry: { fruity: 0.6, sweet: 0.35 },
  berry: { fruity: 0.7 },
  minty: { herbal: 0.65, bright: 0.3 },
  medicinal: { herbal: 0.5, bitter: 0.45 },
};

const NOTE_TAGS: Record<string, string> = {
  juniper: 'note-juniper',
  orange: 'note-orange',
  rhubarb: 'note-rhubarb',
  gentian: 'note-gentian',
  vanilla: 'note-vanilla',
  cherry: 'note-cherry',
  coffee: 'note-coffee',
};

export function liquorNameToBottleId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/['.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `bottle-${slug}`;
}

function mergeFlavorWeights(tags: readonly string[]): FlavorWeights {
  const merged: FlavorWeights = {};
  for (const tag of tags) {
    const key = tag.toLowerCase();
    const profile = TAG_TO_FLAVOR[key];
    if (!profile) {
      continue;
    }
    for (const [dim, weight] of Object.entries(profile)) {
      const existing = merged[dim as keyof FlavorWeights] ?? 0;
      merged[dim as keyof FlavorWeights] = Math.min(1, Math.max(existing, weight));
    }
  }
  if (Object.keys(merged).length === 0) {
    merged.dry = 0.5;
    merged.bright = 0.4;
  }
  return roundFlavor(merged);
}

function roundFlavor(flavor: FlavorWeights): FlavorWeights {
  const out: FlavorWeights = {};
  for (const [dim, value] of Object.entries(flavor)) {
    if (value !== undefined && value > 0) {
      out[dim as keyof FlavorWeights] = Math.round(value * 100) / 100;
    }
  }
  return out;
}

function classifyLiquor(liquor: Liqour): {
  kind: string;
  spiritFamily: string;
  typicalRole: string;
} {
  const name = liquor.name.toLowerCase();
  switch (liquor.type) {
    case LiqourType.AMARO:
      return { kind: 'amaro', spiritFamily: 'amaro', typicalRole: 'bitter' };
    case LiqourType.WHISKEY:
      if (name.includes('bourbon')) {
        return { kind: 'whiskey', spiritFamily: 'whiskey-bourbon', typicalRole: 'base' };
      }
      if (name.includes('rye')) {
        return { kind: 'whiskey', spiritFamily: 'whiskey-rye', typicalRole: 'base' };
      }
      if (name.includes('scotch')) {
        return { kind: 'whiskey', spiritFamily: 'whiskey-scotch', typicalRole: 'base' };
      }
      if (name.includes('irish')) {
        return { kind: 'whiskey', spiritFamily: 'whiskey-irish', typicalRole: 'base' };
      }
      return { kind: 'whiskey', spiritFamily: 'whiskey-other', typicalRole: 'base' };
    case LiqourType.LIQUEUR:
      if (name.includes('cointreau') || name.includes('triple sec') || name.includes('curacao')) {
        return { kind: 'liqueur', spiritFamily: 'liqueur-orange', typicalRole: 'modifier' };
      }
      if (name.includes('chartreuse') || name.includes('benedictine') || name.includes('drambuie')) {
        return { kind: 'liqueur', spiritFamily: 'liqueur-herbal', typicalRole: 'modifier' };
      }
      return { kind: 'liqueur', spiritFamily: 'liqueur-other', typicalRole: 'modifier' };
    case LiqourType.BITTERS:
      return { kind: 'bitters', spiritFamily: 'bitters-aromatic', typicalRole: 'bitter' };
    case LiqourType.SPIRIT:
    default:
      if (name.includes('vermouth')) {
        return {
          kind: 'vermouth',
          spiritFamily: 'vermouth',
          typicalRole: name.includes('dry') ? 'modifier' : 'modifier',
        };
      }
      if (name.includes('gin')) {
        return { kind: 'spirit', spiritFamily: 'gin', typicalRole: 'base' };
      }
      if (name.includes('vodka')) {
        return { kind: 'spirit', spiritFamily: 'vodka', typicalRole: 'base' };
      }
      if (name.includes('rum')) {
        return { kind: 'spirit', spiritFamily: 'rum', typicalRole: 'base' };
      }
      if (name.includes('tequila') || name.includes('mezcal')) {
        return { kind: 'spirit', spiritFamily: 'agave', typicalRole: 'base' };
      }
      if (name.includes('cognac') || name.includes('brandy') || name.includes('pisco')) {
        return { kind: 'spirit', spiritFamily: 'brandy', typicalRole: 'base' };
      }
      if (name.includes('absinthe')) {
        return { kind: 'spirit', spiritFamily: 'other', typicalRole: 'accent' };
      }
      return { kind: 'spirit', spiritFamily: 'other', typicalRole: 'base' };
  }
}

function noteIdsFromTags(tags: readonly string[]): string[] {
  const ids = new Set<string>();
  for (const tag of tags) {
    const noteId = NOTE_TAGS[tag.toLowerCase()];
    if (noteId) {
      ids.add(noteId);
    }
  }
  return [...ids];
}

function describeLiquor(liquor: Liqour): string {
  const family = classifyLiquor(liquor);
  return `${liquor.name} — type-level ${family.spiritFamily.replace(/-/g, ' ')} bottle migrated from the legacy liquor catalog.`;
}

export function migrateLiquorToBottle(liquor: Liqour): BottleRecord {
  const taxonomy = classifyLiquor(liquor);
  const id = liquorNameToBottleId(liquor.name);
  return {
    id,
    schemaVersion: SCHEMA_VERSION,
    flavorSpace: FLAVOR_SPACE,
    names: [liquor.name],
    description: describeLiquor(liquor),
    brand: liquor.brand,
    kind: taxonomy.kind,
    spiritFamily: taxonomy.spiritFamily,
    typicalRole: taxonomy.typicalRole,
    flavor: mergeFlavorWeights(liquor.tags),
    noteIds: noteIdsFromTags(liquor.tags),
    countsForUnlock: true,
  };
}

export function migrateLegacyLiquors(source: readonly Liqour[] = liquors): BottleRecord[] {
  return source.map(migrateLiquorToBottle);
}

/** Legacy liquor display names covered by migration (for integrity tests). */
export const LEGACY_LIQUOR_NAMES = liquors.map((l) => l.name);
