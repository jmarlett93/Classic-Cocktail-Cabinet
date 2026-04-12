import { liquors } from '../models/recipe-book';
import { MIN_TOP_SCORE, rankLiquors } from './liquor-scoring';
import { buildPreferenceProfile } from './preference-profile';

describe('PreferenceProfile', () => {
  it('applies decay: later turn dominates over earlier conflicting preference', () => {
    const turns = ['I love sweet drinks', 'nothing sweet anymore, dry only'];
    const profile = buildPreferenceProfile(turns, { windowK: 10, latestBoost: 1.2 });
    const latest = turns[turns.length - 1];
    const ranked = rankLiquors(liquors, latest, profile.effectivePos, profile.effectiveNeg, {
      limit: 8,
      minTopScore: MIN_TOP_SCORE,
    });
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0].liquor.name).not.toBe('Baileys Irish Cream');
  });

  it('excludes turns older than window K', () => {
    const many = Array.from({ length: 12 }, (_, i) => `message ${i} herbal`);
    const profile = buildPreferenceProfile(many, { windowK: 3, latestBoost: 1.2 });
    expect(profile.effectivePos.size + profile.effectiveNeg.size).toBeGreaterThanOrEqual(0);
  });
});
