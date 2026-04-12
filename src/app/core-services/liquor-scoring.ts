import { Injectable } from '@angular/core';
import { Liqour, LiqourType, liquors } from '../models/recipe-book';
import {
  extractLiquorTypesFromText,
  extractNegativeTasteFamilies,
  extractPositiveTasteFamilies,
  tasteFamilyToLiquorTags,
} from './taste-vocabulary';

/** Minimum top score to return recommendations (tunable). */
export const MIN_TOP_SCORE = 0.35;

export interface RankedLiquor {
  liquor: Liqour;
  score: number;
  matchedSignals: string[];
}

function addWeights(target: Map<string, number>, keys: readonly string[], delta: number): void {
  for (const k of keys) {
    target.set(k, (target.get(k) ?? 0) + delta);
  }
}

/**
 * Build per–liquor-tag weights from taste families (positive / negative).
 */
export function familiesToLiquorTagWeights(
  positiveFamilies: string[],
  negativeFamilies: string[],
): { positive: Map<string, number>; negative: Map<string, number> } {
  const positive = new Map<string, number>();
  const negative = new Map<string, number>();

  for (const f of positiveFamilies) {
    const tags = tasteFamilyToLiquorTags[f];
    if (tags) {
      addWeights(positive, tags, 1);
    }
  }
  for (const f of negativeFamilies) {
    const tags = tasteFamilyToLiquorTags[f];
    if (tags) {
      addWeights(negative, tags, 1.2);
    }
  }

  return { positive, negative };
}

/**
 * Net tag weights after contradiction: dislike wins when stronger for a tag.
 */
export function mergePositiveNegative(
  pos: Map<string, number>,
  neg: Map<string, number>,
): { effectivePos: Map<string, number>; effectiveNeg: Map<string, number> } {
  const effectivePos = new Map<string, number>();
  const effectiveNeg = new Map<string, number>();
  const keys = new Set([...pos.keys(), ...neg.keys()]);

  for (const k of keys) {
    const p = pos.get(k) ?? 0;
    const n = neg.get(k) ?? 0;
    if (n >= p) {
      if (n > 0) {
        effectiveNeg.set(k, n - p);
      }
    } else {
      effectivePos.set(k, p - n);
    }
  }
  return { effectivePos, effectiveNeg };
}

export function extractWeightsFromUserText(userInput: string): {
  effectivePos: Map<string, number>;
  effectiveNeg: Map<string, number>;
} {
  const posFamilies = extractPositiveTasteFamilies(userInput);
  const negFamilies = extractNegativeTasteFamilies(userInput);
  const { positive, negative } = familiesToLiquorTagWeights(posFamilies, negFamilies);
  return mergePositiveNegative(positive, negative);
}

function nameHintsType(input: string, liquor: Liqour): number {
  const lower = input.toLowerCase();
  const name = liquor.name.toLowerCase();
  let boost = 0;
  const tokens = ['gin', 'vodka', 'rum', 'tequila', 'mezcal', 'bourbon', 'scotch', 'rye', 'whiskey', 'whisky', 'amaro', 'vermouth', 'cognac', 'brandy'];
  for (const t of tokens) {
    if (lower.includes(t) && name.includes(t)) {
      boost += 0.45;
    }
  }
  return boost;
}

function typePreferenceBoost(input: string, liquor: Liqour): number {
  const wanted = extractLiquorTypesFromText(input);
  if (wanted.length === 0) {
    return 0;
  }
  return wanted.includes(liquor.type) ? 0.35 : 0;
}

/**
 * Deterministic score for one bottle given effective tag weights.
 */
export function scoreLiquor(
  liquor: Liqour,
  effectivePos: Map<string, number>,
  effectiveNeg: Map<string, number>,
  userInput: string,
): RankedLiquor {
  let score = 0;
  const matchedSignals: string[] = [];
  const tagSet = new Set(liquor.tags.map((t) => t.toLowerCase()));

  for (const [tag, w] of effectivePos) {
    if (w <= 0) {
      continue;
    }
    if (tagSet.has(tag.toLowerCase())) {
      score += w;
      matchedSignals.push(tag);
    }
  }
  for (const [tag, w] of effectiveNeg) {
    if (tagSet.has(tag.toLowerCase())) {
      score -= w;
    }
  }

  score += nameHintsType(userInput, liquor);
  score += typePreferenceBoost(userInput, liquor);

  return { liquor, score, matchedSignals: [...new Set(matchedSignals)] };
}

export function rankLiquors(
  catalog: readonly Liqour[],
  userInput: string,
  effectivePos: Map<string, number>,
  effectiveNeg: Map<string, number>,
  options: { limit: number; minTopScore: number },
): RankedLiquor[] {
  const ranked = catalog.map((l) => scoreLiquor(l, effectivePos, effectiveNeg, userInput));
  ranked.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.liquor.name.localeCompare(b.liquor.name);
  });
  const top = ranked[0]?.score ?? 0;
  if (top < options.minTopScore) {
    return [];
  }
  return ranked.slice(0, options.limit);
}

export function buildReasoningLine(ranked: RankedLiquor[], userInput: string): string {
  if (ranked.length === 0) {
    return 'No strong catalog matches for those taste words — try adding a spirit you enjoy or different flavor words.';
  }
  const top = ranked[0];
  const signals = top.matchedSignals.length ? top.matchedSignals.join(', ') : 'your words';
  return `Ranked by overlap with ${signals} from what you said (“${userInput.trim()}”). Best match: ${top.liquor.name} (${top.liquor.tags.join(', ')}).`;
}

@Injectable({ providedIn: 'root' })
export class LiquorScoringService {
  rankCatalog(
    userInput: string,
    effectivePos: Map<string, number>,
    effectiveNeg: Map<string, number>,
    options?: { limit?: number; minTopScore?: number },
  ): RankedLiquor[] {
    return rankLiquors(liquors, userInput, effectivePos, effectiveNeg, {
      limit: options?.limit ?? 8,
      minTopScore: options?.minTopScore ?? MIN_TOP_SCORE,
    });
  }

  extractWeights(userInput: string): { effectivePos: Map<string, number>; effectiveNeg: Map<string, number> } {
    return extractWeightsFromUserText(userInput);
  }
}
