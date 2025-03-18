import { LiqourType } from '../models/recipe-book';
import { NlpTemplate, nlpTemplates } from './nlp-templates';

export interface NlpResult {
  preferredTags: string[];
  avoidedTags: string[];
  preferredTypes: LiqourType[];
  confidence: number;
  responseTemplate: string;
  reasoning: string;
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

    // Extract information using the template extractors
    const preferredTags = bestMatch.template.extractors['preferredTags']?.(input) || [];
    const avoidedTags = bestMatch.template.extractors['avoidedTags']?.(input) || [];
    const preferredTypes = bestMatch.template.extractors['preferredTypes']?.(input) || [];
    // Generate reasoning
    let reasoning = `I detected that you ${Array.isArray(preferredTags) && preferredTags.length > 0 ? 'like ' + preferredTags.join(', ') : ''}`;
    if (Array.isArray(avoidedTags) && avoidedTags.length > 0) {
      reasoning += `${Array.isArray(preferredTags) && preferredTags.length > 0 ? ' and ' : ''}dislike ${avoidedTags.join(', ')}`;
    }
    if (Array.isArray(preferredTypes) && preferredTypes.length > 0) {
      reasoning += `. You seem interested in ${preferredTypes.join(', ')}`;
    }
    reasoning += '.';

    return {
      preferredTags: preferredTags as string[],
      avoidedTags: avoidedTags as string[],
      preferredTypes: preferredTypes as LiqourType[],
      confidence: bestMatch.confidence,
      responseTemplate: bestMatch.template.response,
      reasoning,
    };
  }

  public formatResponse(result: NlpResult): string {
    let response = result.responseTemplate;

    // Replace template variables
    response = response.replace('{preferredTags}', result.preferredTags.join(', ') || 'your preferences');
    response = response.replace('{avoidedTags}', result.avoidedTags.join(', ') || 'certain');
    response = response.replace('{preferredTypes}', result.preferredTypes.join(', ') || 'liquor');

    return response;
  }
}
