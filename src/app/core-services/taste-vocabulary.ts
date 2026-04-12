import { LiqourType } from '../models/recipe-book';

/** Canonical taste families → phrases users might type (lowercase substring match). */
export const tasteTags: Record<string, readonly string[]> = {
  bright: ['bright', 'lively', 'zippy', 'effervescent'],
  sweet: ['sweet', 'sugary', 'syrupy', 'honey', 'dessert'],
  bitter: ['bitter', 'bitterness'],
  herbal: ['herbal', 'herbs', 'botanical', 'plant', 'grassy', 'pine'],
  citrus: ['citrus', 'lemon', 'lime', 'orange', 'grapefruit', 'zesty'],
  smoky: ['smoky', 'smoke', 'campfire', 'burnt', 'charred'],
  spicy: ['spicy', 'spice', 'hot', 'peppery', 'cinnamon', 'clove', 'pepper'],
  fruity: ['fruity', 'fruit', 'berry', 'apple', 'pear', 'tropical'],
  floral: ['floral', 'flower', 'rose', 'lavender', 'jasmine'],
  creamy: ['creamy', 'cream', 'milk', 'dairy'],
  nutty: ['nutty', 'nut', 'almond', 'hazelnut', 'walnut'],
  chocolate: ['chocolate', 'cocoa', 'cacao'],
  coffee: ['coffee', 'espresso', 'mocha'],
  vanilla: ['vanilla', 'vanillin'],
  anise: ['anise', 'licorice', 'star anise'],
  minty: ['mint', 'minty', 'peppermint', 'spearmint'],
  warm: ['warm', 'warming', 'cozy', 'comforting', 'hot'],
  dry: ['dry', 'not sweet', 'crisp', 'brut'],
  rich: ['rich', 'full-bodied', 'robust', 'deep'],
  complex: ['complex', 'layered', 'sophisticated', 'nuanced'],
  smooth: ['smooth', 'mellow', 'soft', 'gentle', 'mild'],
};

/**
 * Maps each canonical family to liquor `tags` that satisfy that intent in the catalog.
 * Used only for scoring (see SCORING.md).
 */
export const tasteFamilyToLiquorTags: Record<string, readonly string[]> = {
  bright: ['bright', 'citrus', 'zesty', 'crisp', 'clean', 'light', 'refreshing'],
  sweet: ['sweet', 'syrupy', 'honey', 'caramel', 'chocolate', 'vanilla', 'creamy'],
  bitter: ['bitter'],
  herbal: ['herbal', 'botanical', 'aromatic', 'vegetal', 'grassy'],
  citrus: ['citrus', 'zesty', 'orange', 'lemon', 'lime', 'grapefruit'],
  smoky: ['smoky', 'peaty', 'woody'],
  spicy: ['spicy', 'peppery', 'hot', 'cinnamon', 'clove'],
  fruity: ['fruity', 'berry', 'tropical', 'cherry', 'melon', 'plum', 'apple', 'pear'],
  floral: ['floral', 'elderflower', 'lavender'],
  creamy: ['creamy', 'syrupy'],
  nutty: ['nutty', 'almond', 'hazelnut'],
  chocolate: ['chocolate', 'cocoa'],
  coffee: ['coffee'],
  vanilla: ['vanilla'],
  anise: ['anise', 'licorice'],
  minty: ['minty', 'mint'],
  warm: ['warm', 'hot', 'rich', 'caramel'],
  dry: ['dry', 'crisp', 'herbal', 'juniper', 'botanical', 'neutral', 'clean'],
  rich: ['rich', 'deep', 'dark', 'oak', 'complex'],
  complex: ['complex', 'layered', 'botanical'],
  smooth: ['smooth', 'mellow', 'soft', 'light', 'neutral'],
};

export const liquorTypeKeywords: Record<LiqourType, readonly string[]> = {
  [LiqourType.AMARO]: ['amaro', 'bitter', 'digestif', 'aperitif'],
  [LiqourType.WHISKEY]: ['whiskey', 'whisky', 'bourbon', 'scotch', 'rye'],
  [LiqourType.SPIRIT]: ['spirit', 'vodka', 'gin', 'rum', 'tequila', 'mezcal', 'brandy', 'cognac', 'vermouth'],
  [LiqourType.LIQUEUR]: ['liqueur', 'cordial', 'schnapps'],
  [LiqourType.BITTERS]: ['bitters', 'aromatic'],
};

const NEGATIVE_TRIGGERS = [
  'not ',
  "don't ",
  'dont ',
  'dislike ',
  'hate ',
  'avoid ',
  'no ',
  'nothing ',
  'without ',
  'never ',
  'not a fan of ',
  "can't stand ",
];

export function extractPositiveTasteFamilies(input: string): string[] {
  const lower = input.toLowerCase();
  const found: string[] = [];
  for (const [family, keywords] of Object.entries(tasteTags)) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      found.push(family);
    }
  }
  return [...new Set(found)];
}

export function extractLiquorTypesFromText(input: string): LiqourType[] {
  const lower = input.toLowerCase();
  const found: LiqourType[] = [];
  for (const [type, keywords] of Object.entries(liquorTypeKeywords) as [LiqourType, readonly string[]][]) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      found.push(type);
    }
  }
  return [...new Set(found)];
}

/**
 * Taste families the user wants to avoid (phrase-based heuristics).
 */
export function extractNegativeTasteFamilies(input: string): string[] {
  const lower = input.toLowerCase();
  const found: string[] = [];

  for (const trigger of NEGATIVE_TRIGGERS) {
    let idx = 0;
    while ((idx = lower.indexOf(trigger, idx)) !== -1) {
      const after = lower.slice(idx + trigger.length, idx + trigger.length + 80);
      for (const [family, keywords] of Object.entries(tasteTags)) {
        if (keywords.some((k) => after.startsWith(k) || after.includes(` ${k}`))) {
          found.push(family);
        }
      }
      idx += trigger.length;
    }
  }

  for (const [family, keywords] of Object.entries(tasteTags)) {
    for (const kw of keywords) {
      if (kw === 'not sweet' && lower.includes('not sweet')) {
        found.push('sweet');
      }
      const too = new RegExp(`too\\s+${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
      if (too.test(input)) {
        found.push(family);
      }
    }
  }

  return [...new Set(found)];
}
