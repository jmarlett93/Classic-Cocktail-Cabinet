import { LiqourType } from '../models/recipe-book';
import { liquorTypeKeywords, tasteTags } from './taste-vocabulary';

export interface NlpTemplate {
  id: string;
  pattern: RegExp | string[];
  extractors: {
    [key: string]: (match: string) => string[] | string | undefined;
  };
  confidence: number;
}

export { liquorTypeKeywords, tasteTags } from './taste-vocabulary';

// Define intent types
export type IntentType =
  | 'flavor_preference'
  | 'type_preference'
  | 'avoidance'
  | 'comparison'
  | 'explanation'
  | 'clarification'
  | 'general_inquiry';

// Helper functions for extractors
const extractTags = (input: string): string[] => {
  const foundTags: string[] = [];
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
  const negativeWords = [
    'not',
    "don't",
    'dislike',
    'hate',
    'avoid',
    'no',
    'is gross',
    'is bad',
    'is nasty',
    'is disgusting',
  ];
  const negativePatterns = negativeWords.map((word) => new RegExp(`${word}\\s+([\\w\\s]+)`, 'gi'));
  let negativeTags: string[] = [];

  negativePatterns.forEach((pattern) => {
    const matches = [...input.matchAll(pattern)];
    matches.forEach((match) => {
      if (match[1]) {
        const potentialTag = match[1].trim().toLowerCase();
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
    id: 'flavor_preference',
    pattern: [
      'i like',
      'i enjoy',
      'i prefer',
      'i love',
      'fan of',
      'something sweet',
      'something bitter',
      'something smoky',
      'looking for',
      'want something',
    ],
    extractors: {
      intent: () => 'flavor_preference',
      preferredTags: (match) => extractTags(match),
      reasoning: (match) => `I understand you're looking for drinks with ${extractTags(match).join(', ')} flavors.`,
      response: (match) =>
        `Based on your preference for ${extractTags(match).join(', ')}, I can recommend some options that match these flavor profiles.`,
    },
    confidence: 0.8,
  },
  {
    id: 'type_preference',
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
      intent: () => 'type_preference',
      preferredTypes: (match) => extractLiquorTypes(match),
      reasoning: (match) => `You're interested in ${extractLiquorTypes(match).join(', ')}.`,
      response: (match) =>
        `I'll focus on ${extractLiquorTypes(match).join(', ')} options that match your taste preferences.`,
    },
    confidence: 0.9,
  },
  {
    id: 'avoidance',
    pattern: [
      "i don't like",
      'i dislike',
      'i hate',
      'not a fan of',
      "can't stand",
      'too strong',
      'too sweet',
      'too bitter',
    ],
    extractors: {
      intent: () => 'avoidance',
      avoidedTags: (match) => extractNegativeTags(match),
      reasoning: (match) => `You want to avoid ${extractNegativeTags(match).join(', ')} flavors.`,
      response: (match) =>
        `I'll make sure to avoid recommending drinks with ${extractNegativeTags(match).join(', ')} characteristics.`,
    },
    confidence: 0.7,
  },
  {
    id: 'comparison',
    pattern: ['similar to', 'like', 'compared to', 'versus', 'difference between'],
    extractors: {
      intent: () => 'comparison',
      comparisonTags: (match) => extractTags(match),
      reasoning: (match) => `You're looking for comparisons or similar options to ${extractTags(match).join(', ')}.`,
      response: (match) =>
        `I can help you find options similar to ${extractTags(match).join(', ')} or explain the differences.`,
    },
    confidence: 0.6,
  },
  {
    id: 'explanation',
    pattern: ['why', 'how', 'explain', 'tell me about', 'what is', 'describe'],
    extractors: {
      intent: () => 'explanation',
      topicTags: (match) => extractTags(match),
      reasoning: (match) => `You're looking for more information about ${extractTags(match).join(', ')}.`,
      response: (match) =>
        `I can explain more about ${extractTags(match).join(', ')} and how it relates to your preferences.`,
    },
    confidence: 0.7,
  },
  {
    id: 'fallback',
    pattern: /.*/,
    extractors: {
      intent: () => 'general_inquiry',
      reasoning: () => "I understand you're looking for drink recommendations.",
      response: () =>
        'I can help you find drinks that match your taste preferences. What flavors do you typically enjoy?',
    },
    confidence: 0.1,
  },
];
