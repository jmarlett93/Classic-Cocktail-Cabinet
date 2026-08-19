import { FLAVOR_DIMENSION_IDS_V1 } from '../../models/flavor-dimensions';
import { buildCatalogBundle } from './catalog-bundle';
import { lookupFlavorQueryVector, mergeFlavorVectors } from './flavor-vocabulary';

describe('Flavor vocabulary', () => {
  const bundle = buildCatalogBundle();

  it('freezes eighteen canonical v1 dimensions', () => {
    expect(FLAVOR_DIMENSION_IDS_V1.length).toBe(18);
    expect(bundle.dimensions.length).toBe(18);
  });

  it('maps bitter through synonyms into the shared flavor space', () => {
    const vector = lookupFlavorQueryVector('bitter', bundle.synonyms);
    expect(vector).toEqual({ bitter: 1.0 });
  });

  it('prefers longest synonym term match for citrus queries', () => {
    const vector = lookupFlavorQueryVector('something zesty please', bundle.synonyms);
    expect(vector?.citrus).toBeGreaterThan(0);
    expect(vector?.bright).toBeGreaterThan(0);
  });

  it('merges vectors by per-dimension max', () => {
    const merged = mergeFlavorVectors([{ bitter: 0.5 }, { bitter: 0.8, citrus: 0.4 }]);
    expect(merged.bitter).toBe(0.8);
    expect(merged.citrus).toBe(0.4);
  });
});
