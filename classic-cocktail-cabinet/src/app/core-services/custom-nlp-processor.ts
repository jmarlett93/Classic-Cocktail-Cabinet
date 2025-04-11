import { LiqourType } from '../models/recipe-book';
import { NlpTemplate, nlpTemplates, IntentType } from './nlp-templates';

export interface NlpResult {
  intent: IntentType;
  keywords: string[];
  negativeKeywords: string[];
  liquorTypes: LiqourType[];
  confidence: number;
  response: string;
  reasoning: string;
  detectedPreferences: {
    types: LiqourType[];
    flavors: string[];
    avoidances: string[];
  };
}

export class CustomNlpProcessor {
  private templates: NlpTemplate[];

  constructor(templates = nlpTemplates) {
    this.templates = templates;
  }

  public processInput(userInput: string): NlpResult {
    const input = userInput.toLowerCase();
    let bestMatch: {
      template: NlpTemplate;
      confidence: number;
    } | null = null;

    // Find the best matching template
    for (const template of this.templates) {
      let isMatch = false;

      if (template.pattern instanceof RegExp) {
        isMatch = template.pattern.test(input);
      } else if (Array.isArray(template.pattern)) {
        isMatch = template.pattern.some((pattern) => input.includes(pattern.toLowerCase()));
      }

      if (isMatch && (!bestMatch || template.confidence > bestMatch.confidence)) {
        bestMatch = {
          template,
          confidence: template.confidence,
        };
      }
    }

    // Use fallback if no match
    if (!bestMatch) {
      bestMatch = {
        template: this.templates.find((t) => t.id === 'fallback')!,
        confidence: 0.1,
      };
    }

    // Extract information using template extractors
    const extractors = bestMatch.template.extractors;
    const intent = extractors['intent']?.(input) as IntentType;
    const keywords = (extractors['preferredTags']?.(input) || []) as string[];
    const negativeKeywords = (extractors['avoidedTags']?.(input) || []) as string[];
    const liquorTypes = (extractors['preferredTypes']?.(input) || []) as LiqourType[];
    const reasoning = (extractors['reasoning']?.(input) || '') as string;
    const response = (extractors['response']?.(input) || '') as string;

    return {
      intent,
      keywords,
      negativeKeywords,
      liquorTypes,
      confidence: bestMatch.confidence,
      response,
      reasoning,
      detectedPreferences: {
        types: liquorTypes,
        flavors: keywords,
        avoidances: negativeKeywords,
      },
    };
  }

  public formatResponse(result: NlpResult): string {
    return result.response;
  }
}
