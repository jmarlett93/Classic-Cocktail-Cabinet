import { liquors } from '../models/recipe-book';
import {
  MIN_TOP_SCORE,
  extractWeightsFromUserText,
  rankLiquors,
} from './liquor-scoring';

describe('LiquorScoring', () => {
  it('returns identical order for same input (determinism)', () => {
    const input = 'I like bright and dry';
    const a = extractWeightsFromUserText(input);
    const b = extractWeightsFromUserText(input);
    const ra = rankLiquors(liquors, input, a.effectivePos, a.effectiveNeg, { limit: 8, minTopScore: MIN_TOP_SCORE });
    const rb = rankLiquors(liquors, input, b.effectivePos, b.effectiveNeg, { limit: 8, minTopScore: MIN_TOP_SCORE });
    expect(ra.map((x) => x.liquor.name)).toEqual(rb.map((x) => x.liquor.name));
  });

  it('only recommends catalog bottles with no duplicates', () => {
    const input = 'I like bright and dry';
    const w = extractWeightsFromUserText(input);
    const ranked = rankLiquors(liquors, input, w.effectivePos, w.effectiveNeg, { limit: 8, minTopScore: MIN_TOP_SCORE });
    const names = ranked.map((r) => r.liquor.name);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) {
      expect(liquors.some((l) => l.name === n)).toBe(true);
    }
  });

  it('for "I like bright and dry", top 3 each have bright-family or dry-family tag overlap', () => {
    const input = 'I like bright and dry';
    const w = extractWeightsFromUserText(input);
    const ranked = rankLiquors(liquors, input, w.effectivePos, w.effectiveNeg, { limit: 8, minTopScore: MIN_TOP_SCORE });
    expect(ranked.length).toBeGreaterThan(0);
    const brightOrCitrus = ['bright', 'citrus', 'zesty', 'crisp', 'clean', 'light', 'refreshing'];
    const dryish = ['dry', 'crisp', 'herbal', 'juniper', 'botanical', 'neutral', 'clean', 'bitter'];
    const top3 = ranked.slice(0, 3);
    for (const row of top3) {
      const tags = row.liquor.tags.map((t) => t.toLowerCase());
      const hasBright = tags.some((t) => brightOrCitrus.includes(t));
      const hasDry = tags.some((t) => dryish.includes(t));
      expect(hasBright && hasDry).withContext(row.liquor.name).toBe(true);
    }
  });

  it('for "I want dry but not sweet", rank 1 is not exclusively sweet liqueur profile', () => {
    const input = 'I want dry but not sweet';
    const w = extractWeightsFromUserText(input);
    const ranked = rankLiquors(liquors, input, w.effectivePos, w.effectiveNeg, { limit: 8, minTopScore: 0.15 });
    if (ranked.length === 0) {
      return;
    }
    const top = ranked[0].liquor;
    const tags = top.tags.map((t) => t.toLowerCase());
    const onlySweetProfile = tags.every((t) => ['sweet', 'syrupy', 'honey', 'creamy', 'chocolate', 'vanilla'].includes(t));
    expect(onlySweetProfile).toBe(false);
  });
});
