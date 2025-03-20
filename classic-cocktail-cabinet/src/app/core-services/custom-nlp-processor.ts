import { LiqourType } from '../models/recipe-book';
import { FlavorProfileEmbeddings } from './embeddings/flavor-profile-embeddings';
import { NlpTemplate, nlpTemplates } from './nlp-templates';

export interface NlpResult {
  keywords: string[];
  negativeKeywords: string[];
  liquorTypes: LiqourType[];
  confidence: number;
  responseTemplate: string;
  reasoning: string;
}

export class CustomNlpProcessor {
  private templates: NlpTemplate[];
  private flavorKeywords: string[];

  constructor(templates = nlpTemplates) {
    this.templates = templates;
    // Get flavor dimensions from FlavorProfileEmbeddings
    const flavorEmbeddings = new FlavorProfileEmbeddings();
    this.flavorKeywords = flavorEmbeddings.getFlavorDimensions();
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

    // Extract keywords and intent without filtering
    const keywords = bestMatch.template.extractors['preferredTags']?.(input) || [];
    const negativeKeywords = bestMatch.template.extractors['avoidedTags']?.(input) || [];
    const liquorTypes = bestMatch.template.extractors['preferredTypes']?.(input) || [];

    // Extract additional keywords from the input
    const extractedKeywords = this.extractKeywordsFromInput(input);
    const allKeywords = [...new Set([...keywords, ...extractedKeywords])];

    // Generate reasoning
    let reasoning = `I detected these key terms: ${allKeywords.join(', ')}`;
    if (negativeKeywords.length > 0 && typeof negativeKeywords !== 'string') {
      reasoning += ` and these negative terms: ${negativeKeywords.join(', ')}`;
    }
    if (liquorTypes.length > 0 && typeof liquorTypes !== 'string') {
      reasoning += `. You seem interested in: ${liquorTypes.join(', ')}`;
    }
    reasoning += '.';

    return {
      keywords: allKeywords,
      negativeKeywords: negativeKeywords as string[],
      liquorTypes: liquorTypes as LiqourType[],
      confidence: bestMatch.confidence,
      responseTemplate: bestMatch.template.response,
      reasoning,
    };
  }

  private extractKeywordsFromInput(input: string): string[] {
    const words = input.toLowerCase().split(/\s+/);
    return words.filter((word) => this.flavorKeywords.includes(word));
  }

  public formatResponse(result: NlpResult): string {
    let response = result.responseTemplate;

    // Ensure keywords is an array and join it safely
    const keywords = Array.isArray(result.keywords)
      ? result.keywords.join(', ')
      : result.keywords || 'your preferences';

    // Ensure negativeKeywords is an array and join it safely
    const negativeKeywords = Array.isArray(result.negativeKeywords)
      ? result.negativeKeywords.join(', ')
      : result.negativeKeywords || 'certain';

    // Ensure liquorTypes is an array and join it safely
    const liquorTypes = Array.isArray(result.liquorTypes)
      ? result.liquorTypes.join(', ')
      : result.liquorTypes || 'liquor';

    // Replace template variables
    response = response.replace('{preferredTags}', keywords);
    response = response.replace('{avoidedTags}', negativeKeywords);
    response = response.replace('{preferredTypes}', liquorTypes);

    return response;
  }
}
