import { Injectable } from '@angular/core';
import { Liqour } from '../models/recipe-book';
import { CustomNlpProcessor } from './custom-nlp-processor';
import { findLiquorsByTags, findLiquorsByType } from './liquor-store';

export interface RecommendationResult {
  recommendations: Liqour[];
  reasoning: string;
  confidence: number;
  response: string;
}

@Injectable({
  providedIn: 'root',
})
export class LiquorRecommendationAgentService {
  private nlpProcessor: CustomNlpProcessor;

  constructor() {
    this.nlpProcessor = new CustomNlpProcessor();
  }

  public getRecommendations(userInput: string): RecommendationResult {
    console.log('getRecommendations', userInput);
    // Process the user input with our custom NLP
    const nlpResult = this.nlpProcessor.processInput(userInput);

    // Get recommendations based on tags
    let recommendations: Liqour[] = [];

    if (nlpResult.preferredTags.length > 0) {
      recommendations = findLiquorsByTags(nlpResult.preferredTags);
    }

    // Filter by type if specified
    if (nlpResult.preferredTypes.length > 0) {
      const typeRecommendations = nlpResult.preferredTypes.flatMap((type) => findLiquorsByType(type));

      // If we already have tag-based recommendations, intersect the lists
      if (recommendations.length > 0) {
        recommendations = recommendations.filter((liquor) => typeRecommendations.some((r) => r.name === liquor.name));
      } else {
        recommendations = typeRecommendations;
      }
    }

    console.log('recommendations', recommendations);

    // Filter out avoided tags
    if (nlpResult.avoidedTags.length > 0) {
      recommendations = recommendations.filter(
        (liquor) => !liquor.tags.some((tag) => nlpResult.avoidedTags.includes(tag)),
      );
    }

    // If we still don't have recommendations, try to get some based on the most common tags
    if (recommendations.length === 0) {
      const commonTags = ['smooth', 'sweet', 'herbal'];
      recommendations = findLiquorsByTags(commonTags).slice(0, 3);
    }

    console.log('recommendations after filtering', recommendations);

    // Limit to top 5 recommendations
    recommendations = recommendations.slice(0, 5);

    // Format the response
    const response = this.nlpProcessor.formatResponse(nlpResult);

    return {
      recommendations,
      reasoning: nlpResult.reasoning,
      confidence: nlpResult.confidence,
      response,
    };
  }
}
