import { buildCatalogBundle } from '../catalog/catalog-bundle';
import { rankWeightedUnlockCandidatesV1 } from './weighted-unlock';

describe('Weighted unlock ranking', () => {
  const bundle = buildCatalogBundle();

  it('returns sweet vermouth as the top unlock for Campari-only', () => {
    const candidates = rankWeightedUnlockCandidatesV1(bundle, {
      ownedBottleIds: ['bottle-campari'],
      focusBottleId: 'bottle-campari',
      limit: 5,
    });

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0].bottleId).toBe('bottle-sweet-vermouth');

    const top = candidates[0];
    expect(top.unlockCount).toBeGreaterThanOrEqual(1);
    expect(top.unlockedDrinkIds).toContain('drink-americano');

    // Sweet vermouth alone cannot complete Negroni without gin.
    expect(top.unlockedDrinkIds).not.toContain('drink-negroni');

    // Unlock candidates are bottle types only; staples (e.g. lemon juice) are never buy targets.
    expect(candidates.some((c) => c.bottleId.startsWith('staple-'))).toBe(false);
  });

  it('returns empty when focus bottle id is not in the catalog', () => {
    const candidates = rankWeightedUnlockCandidatesV1(bundle, {
      ownedBottleIds: [],
      focusBottleId: 'bottle-does-not-exist',
      limit: 5,
    });

    expect(candidates).toEqual([]);
  });
});
