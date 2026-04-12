import { Injectable } from '@angular/core';
import { Liqour, liquors } from '../models/recipe-book';
import { CustomNlpProcessor } from './custom-nlp-processor';
import { buildReasoningLine, MIN_TOP_SCORE, rankLiquors } from './liquor-scoring';
import { buildPreferenceProfile } from './preference-profile';

export interface RecommendationResult {
  recommendations: Liqour[];
  reasoning: string;
  confidence: number;
  response: string;
  /** Deterministic line about recency / contradiction (Stage 2). */
  profileSummary?: string;
  /** For narration / transparency (same order as recommendations). */
  rankedMeta?: { name: string; score: number; matched: string[] }[];
}

@Injectable({ providedIn: 'root' })
export class TasteRecommendationService {
  private readonly nlp = new CustomNlpProcessor();

  /**
   * Rank liquors from taste language. Uses full `userTurns` when provided (Stage 2 memory);
   * otherwise treats the latest line as the only turn (Stage 1 equivalent).
   */
  async recommend(userInput: string, options?: { userTurns?: string[] }): Promise<RecommendationResult> {
    const trimmed = userInput.trim();
    if (!trimmed) {
      return {
        recommendations: [],
        reasoning: '',
        confidence: 0,
        response: 'What flavors do you enjoy — for example bright, dry, herbal, or fruity?',
        rankedMeta: [],
      };
    }

    const nlpResult = this.nlp.processInput(trimmed);
    const turns =
      options?.userTurns?.length && options.userTurns.some((t) => t.trim().length > 0)
        ? options.userTurns.map((t) => t.trim()).filter(Boolean)
        : [trimmed];

    const profile = buildPreferenceProfile(turns, { windowK: 10, latestBoost: 1.2 });
    const ranked = rankLiquors(liquors, trimmed, profile.effectivePos, profile.effectiveNeg, {
      limit: 8,
      minTopScore: MIN_TOP_SCORE,
    });

    const recommendations = ranked.map((r) => r.liquor);
    const rankedMeta = ranked.map((r) => ({
      name: r.liquor.name,
      score: Math.round(r.score * 100) / 100,
      matched: r.matchedSignals,
    }));
    const reasoningParts = [profile.summaryLine, buildReasoningLine(ranked, trimmed), nlpResult.reasoning].filter(
      (p): p is string => Boolean(p && p.trim()),
    );
    const reasoning = reasoningParts.join(' ');

    const responseParts = [nlpResult.response];
    if (profile.summaryLine) {
      responseParts.push(profile.summaryLine);
    }
    const response = responseParts.join(' ').trim();

    return {
      recommendations,
      reasoning,
      confidence: nlpResult.confidence,
      response: response || nlpResult.response,
      profileSummary: profile.summaryLine,
      rankedMeta,
    };
  }
}
