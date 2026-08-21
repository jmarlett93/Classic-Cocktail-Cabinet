import { buildCatalogBundle } from '../catalog/catalog-bundle';
import { composeDrinkFlavorV1 } from './compose-drink-flavor';
import { CatalogBundle, DrinkRecord, FlavorWeights } from '../../models/catalog-types';
import { clamp01, compactVector, roundTo } from './vector-math';

const ROLE_FACTOR_BY_INGREDIENT_ROLE: Record<string, number> = {
  base: 1.0,
  modifier: 0.85,
  bitter: 0.9,
  sweetener: 0.7,
  citrus: 0.8,
  lengthener: 0.2,
  accent: 0.25,
  rinse: 0.1,
  garnish: 0,
};

const STAPLE_FACTOR = 1;

function inheritedExpected(drink: DrinkRecord, bundle: CatalogBundle): FlavorWeights {
  const sums: Record<string, number> = {};
  let denom = 0;

  for (const row of drink.ingredients) {
    const roleFactor = ROLE_FACTOR_BY_INGREDIENT_ROLE[row.role] ?? 0;
    const countsMultiplier = row.componentKind === 'bottle' ? 1 : STAPLE_FACTOR;
    const contrib = row.amountMl * roleFactor * countsMultiplier;
    if (contrib <= 0) continue;

    denom += contrib;

    const profile = row.componentKind === 'bottle'
      ? bundle.bottles.find((b) => b.id === row.componentId)
      : bundle.staples.find((s) => s.id === row.componentId);

    for (const [dim, w] of Object.entries(profile?.flavor ?? {})) {
      sums[dim] = (sums[dim] ?? 0) + (w as number) * contrib;
    }
  }

  const inherited: FlavorWeights = {};
  if (denom <= 0) return inherited;

  for (const [dim, sum] of Object.entries(sums)) {
    const value = roundTo(sum / denom, 2);
    if (value > 0) {
      inherited[dim as keyof FlavorWeights] = value;
    }
  }
  return inherited;
}

function composedExpected(drink: DrinkRecord, bundle: CatalogBundle): FlavorWeights {
  const inherited = inheritedExpected(drink, bundle);
  const authored = drink.flavor.authored;

  const dimUnion = new Set<string>([...Object.keys(inherited), ...Object.keys(authored)]);
  const out: FlavorWeights = {};

  for (const dim of dimUnion) {
    const iw = inherited[dim as keyof FlavorWeights] ?? 0;
    const aw = authored[dim as keyof FlavorWeights] ?? 0;
    const clamped = roundTo(clamp01(iw + aw), 2);
    if (clamped > 0) out[dim as keyof FlavorWeights] = clamped;
  }

  return compactVector(out);
}

describe('Drink flavor composition (v1)', () => {
  const bundle = buildCatalogBundle();

  it('computes inherited + composed exactly for Negroni', () => {
    const drink = bundle.drinks.find((d) => d.id === 'drink-negroni');
    expect(drink).toBeDefined();

    const beforeCampari = JSON.parse(JSON.stringify(bundle.bottles.find((b) => b.id === 'bottle-campari')!.flavor));

    const actual = composeDrinkFlavorV1(drink!, bundle);
    const expectedInherited = inheritedExpected(drink!, bundle);
    const expectedComposed = composedExpected(drink!, bundle);

    expect(actual.inherited).toEqual(expectedInherited);
    expect(actual.composed).toEqual(expectedComposed);

    // Bottle profile immutability: membership must not mutate bottle vectors.
    const afterCampari = bundle.bottles.find((b) => b.id === 'bottle-campari')!.flavor;
    expect(afterCampari).toEqual(beforeCampari);

    // Authored deltas must change at least bright + citrus for this seeded drink.
    expect((actual.composed.bright ?? 0)).toBeGreaterThan(actual.inherited.bright ?? 0);
    expect((actual.composed.citrus ?? 0)).toBeGreaterThan(actual.inherited.citrus ?? 0);
  });
});
