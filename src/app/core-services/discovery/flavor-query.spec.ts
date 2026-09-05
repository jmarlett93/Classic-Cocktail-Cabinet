import { resolveFlavorQuery, flavorIntensityLevel, fuzzyMatchNames } from './flavor-query';
import { loadCatalogBundle } from '../catalog/catalog-bundle';

describe('flavor-query', () => {
  const synonyms = loadCatalogBundle().synonyms;

  it('maps weights to Low / Medium / High', () => {
    expect(flavorIntensityLevel(0.2)).toBe('Low');
    expect(flavorIntensityLevel(0.4)).toBe('Medium');
    expect(flavorIntensityLevel(0.7)).toBe('High');
  });

  it('resolves a single taste synonym to a vector', () => {
    const vector = resolveFlavorQuery('bitter', synonyms);
    expect(vector?.bitter).toBe(1);
  });

  it('merges multi-term flavor queries', () => {
    const vector = resolveFlavorQuery('bright and dry', synonyms);
    expect(vector?.bright).toBe(1);
    expect(vector?.dry).toBe(1);
  });

  it('returns undefined for unknown flavor language', () => {
    expect(resolveFlavorQuery('xyzzy-not-a-flavor', synonyms)).toBeUndefined();
  });

  it('fuzzy-matches bottle and drink names', () => {
    expect(fuzzyMatchNames('negr', ['Negroni', 'negroni'])).toBe(true);
    expect(fuzzyMatchNames('campari', ['Gin'])).toBe(false);
    expect(fuzzyMatchNames('', ['Gin'])).toBe(true);
  });
});
