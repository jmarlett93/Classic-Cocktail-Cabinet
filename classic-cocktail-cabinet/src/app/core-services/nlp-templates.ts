import { LiqourType } from '../models/recipe-book';

export interface NlpTemplate {
  id: string;
  pattern: RegExp | string[];
  extractors: {
    [key: string]: (match: string) => string[] | string | undefined;
  };
  confidence: number;
  response: string;
}

// Define taste categories for better matching
export const tasteTags = {
  sweet: ['sweet', 'sugary', 'syrupy', 'honey', 'dessert'],
  bitter: ['bitter', 'bitterness', 'not sweet'],
  herbal: ['herbal', 'herbs', 'botanical', 'plant', 'grassy', 'pine'],
  citrus: ['citrus', 'lemon', 'lime', 'orange', 'grapefruit', 'zesty'],
  smoky: ['smoky', 'smoke', 'campfire', 'burnt', 'charred'],
  spicy: ['spicy', 'spice', 'hot', 'peppery', 'cinnamon', 'clove', 'pepper'],
  fruity: ['fruity', 'fruit', 'berry', 'apple', 'pear', 'tropical'],
  floral: ['floral', 'flower', 'rose', 'lavender', 'jasmine'],
  creamy: ['creamy', 'cream', 'milk', 'dairy', 'smooth'],
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

// Define liquor type keywords
export const liquorTypeKeywords = {
  [LiqourType.AMARO]: ['amaro', 'bitter', 'digestif', 'aperitif', 'bitters'],
  [LiqourType.WHISKEY]: ['whiskey', 'whisky', 'bourbon', 'scotch', 'rye'],
  [LiqourType.SPIRIT]: ['spirit', 'vodka', 'gin', 'rum', 'tequila', 'mezcal', 'brandy', 'cognac'],
  [LiqourType.LIQUEUR]: ['liqueur', 'cordial', 'schnapps'],
  [LiqourType.BITTERS]: ['bitters', 'aromatic'],
};

// Helper functions for extractors
const extractTags = (input: string): string[] => {
  const foundTags: string[] = [];

  // Check for taste tags
  Object.entries(tasteTags).forEach(([tag, keywords]) => {
    if (keywords.some((keyword) => input.toLowerCase().includes(keyword))) {
      foundTags.push(tag);
    }
  });

  return foundTags;
};

const extractLiquorTypes = (input: string): string[] => {
  const foundTypes: string[] = [];

  Object.entries(liquorTypeKeywords).forEach(([type, keywords]) => {
    if (keywords.some((keyword) => input.toLowerCase().includes(keyword))) {
      foundTypes.push(type);
    }
  });

  return foundTypes;
};

const extractNegativeTags = (input: string): string[] => {
  const negativeWords = ['not', "don't", 'dislike', 'hate', 'avoid', 'no'];
  const negativePatterns = negativeWords.map((word) => new RegExp(`${word}\\s+([\\w\\s]+)`, 'gi'));

  let negativeTags: string[] = [];

  negativePatterns.forEach((pattern) => {
    const matches = [...input.matchAll(pattern)];
    matches.forEach((match) => {
      if (match[1]) {
        const potentialTag = match[1].trim().toLowerCase();
        // Check if this negative phrase contains any taste tags
        Object.entries(tasteTags).forEach(([tag, keywords]) => {
          if (keywords.some((keyword) => potentialTag.includes(keyword))) {
            negativeTags.push(tag);
          }
        });
      }
    });
  });

  return negativeTags;
};

// Define the NLP templates
export const nlpTemplates: NlpTemplate[] = [
  {
    id: 'taste_preference',
    pattern: [
      'i like',
      'i enjoy',
      'i prefer',
      'i love',
      'fan of',
      'something sweet',
      'something bitter',
      'something smoky',
    ],
    extractors: {
      preferredTags: (match) => extractTags(match),
      avoidedTags: (match) => extractNegativeTags(match),
      preferredTypes: (match) => extractLiquorTypes(match),
    },
    confidence: 0.8,
    response: 'Based on your preference for {preferredTags}, I can recommend some liquors you might enjoy.',
  },
  {
    id: 'dislike_preference',
    pattern: ["i don't like", 'i dislike', 'i hate', 'not a fan of', "can't stand"],
    extractors: {
      avoidedTags: (match) => extractTags(match),
      preferredTags: (match) => [], // Empty by default
      preferredTypes: (match) => extractLiquorTypes(match),
    },
    confidence: 0.7,
    response: "I'll avoid recommending liquors with {avoidedTags} flavors.",
  },
  {
    id: 'specific_type',
    pattern: [
      'whiskey',
      'whisky',
      'bourbon',
      'scotch',
      'gin',
      'vodka',
      'rum',
      'tequila',
      'mezcal',
      'amaro',
      'liqueur',
      'brandy',
      'cognac',
    ],
    extractors: {
      preferredTypes: (match) => extractLiquorTypes(match),
      preferredTags: (match) => extractTags(match),
      avoidedTags: (match) => extractNegativeTags(match),
    },
    confidence: 0.9,
    response: 'I can recommend some {preferredTypes} options for you.',
  },
  {
    id: 'occasion',
    pattern: [
      'for dinner',
      'for dessert',
      'for a party',
      'for relaxing',
      'after meal',
      'before meal',
      'digestif',
      'aperitif',
    ],
    extractors: {
      preferredTags: (match) => {
        if (match.includes('dessert')) return ['sweet'];
        if (match.includes('aperitif') || match.includes('before meal')) return ['bitter', 'citrus'];
        if (match.includes('digestif') || match.includes('after meal')) return ['herbal', 'bitter'];
        if (match.includes('relaxing')) return ['smooth', 'warm'];
        return [];
      },
      preferredTypes: (match) => {
        if (match.includes('aperitif')) return [LiqourType.AMARO];
        if (match.includes('digestif')) return [LiqourType.AMARO, LiqourType.LIQUEUR];
        return [];
      },
      avoidedTags: () => [],
    },
    confidence: 0.6,
    response: 'For that occasion, I would recommend something with {preferredTags} characteristics.',
  },
  {
    id: 'fallback',
    pattern: ['.'],
    extractors: {
      preferredTags: () => [],
      avoidedTags: () => [],
      preferredTypes: () => [],
    },
    confidence: 0.1,
    response:
      "I'm not sure what kind of liquor you're looking for. Could you tell me more about your taste preferences? Do you like sweet, bitter, smoky, or herbal flavors?",
  },
];
