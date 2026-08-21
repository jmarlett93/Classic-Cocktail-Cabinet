import { buildCatalogBundle } from '../catalog/catalog-bundle';
import { lookupFlavorQueryVector } from '../catalog/flavor-vocabulary';
import {
  rankPossibleLikelyByBottleId,
  rankPossibleLikelyByFlavorVector,
  POSSIBLE_SIMILARITY_FLOOR,
} from './possible-likely-ranking';
import { clamp01, dotProduct, roundTo } from './vector-math';

describe('Possible and likely ranking', () => {
  const bundle = buildCatalogBundle();

  it('for flavor "bitter" ranks Campari above gin', () => {
    const vector = lookupFlavorQueryVector('bitter', bundle.synonyms);
    expect(vector).toBeDefined();

    const res = rankPossibleLikelyByFlavorVector(bundle, vector!);

    const campariIndex = res.likelyBottles.findIndex((e) => e.id === 'bottle-campari');
    const ginIndex = res.likelyBottles.findIndex((e) => e.id === 'bottle-gin');

    expect(campariIndex).toBeGreaterThanOrEqual(0);
    expect(ginIndex === -1 || campariIndex < ginIndex).toBe(true);
  });

  it('for flavor "bitter" includes Negroni in likely drinks', () => {
    const vector = lookupFlavorQueryVector('bitter', bundle.synonyms);
    const res = rankPossibleLikelyByFlavorVector(bundle, vector!);

    expect(res.likelyDrinks.some((e) => e.id === 'drink-negroni')).toBe(true);
  });

  it('for bottle Campari lists its joined drinks as possible', () => {
    const res = rankPossibleLikelyByBottleId(bundle, 'bottle-campari');

    const possibleIds = res.possibleDrinks.map((e) => e.id);
    expect(possibleIds).toContain('drink-negroni');
    expect(possibleIds).toContain('drink-americano');

    expect(res.likelyDrinks.length).toBeLessThanOrEqual(5);
  });

  it('for bottle Campari, possible bottles respect the similarity floor', () => {
    const seed = bundle.bottles.find((b) => b.id === 'bottle-campari');
    expect(seed).toBeDefined();
    const seedBottle = seed!;

    const res = rankPossibleLikelyByBottleId(bundle, 'bottle-campari');

    for (const e of res.possibleBottles) {
      const bottle = bundle.bottles.find((b) => b.id === e.id);
      expect(bottle).toBeDefined();
      const s = roundTo(clamp01(dotProduct(seedBottle.flavor, bottle!.flavor)), 3);
      expect(s).toBeGreaterThanOrEqual(POSSIBLE_SIMILARITY_FLOOR);
    }
  });

  it('empty flavor vector returns empty bags', () => {
    const res = rankPossibleLikelyByFlavorVector(bundle, {});
    expect(res.possibleDrinks).toEqual([]);
    expect(res.likelyDrinks).toEqual([]);
    expect(res.possibleBottles).toEqual([]);
    expect(res.likelyBottles).toEqual([]);
  });
});
