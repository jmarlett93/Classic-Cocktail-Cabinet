import { CatalogBundle, DrinkIngredient, DrinkRecord, FlavorWeights, BottleRecord, StapleRecord } from '../../models/catalog-types';
import { clamp01, compactVector, roundTo } from './vector-math';

const KNOWN_COMPOSE_RULES = new Set(['v1']);

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

// Dataset design default: staples are treated as diluted by their own role factors.
// In the example, soda contrib uses only roleFactor and amountMl (no extra staple downscale).
const STAPLE_FACTOR = 1;

function getComponentProfile(row: DrinkIngredient, bundle: CatalogBundle): BottleRecord | StapleRecord | undefined {
  if (row.componentKind === 'bottle') {
    return bundle.bottles.find((b) => b.id === row.componentId);
  }
  return bundle.staples.find((s) => s.id === row.componentId);
}

function requiredNonZeroFlavor(flavor: FlavorWeights): FlavorWeights {
  return compactVector(Object.keys(flavor).length ? flavor : {});
}

export function composeDrinkFlavorV1(drink: DrinkRecord, bundle: CatalogBundle): {
  inherited: FlavorWeights;
  composed: FlavorWeights;
} {
  if (!KNOWN_COMPOSE_RULES.has(drink.flavor.composeRule)) {
    throw new Error(`Unknown composeRule: ${drink.flavor.composeRule}`);
  }

  const totalContribByDim: Partial<Record<keyof FlavorWeights, number>> = {};
  const totalContribDen = { value: 0 };

  for (const row of drink.ingredients) {
    if (row.componentKind !== 'bottle' && row.componentKind !== 'staple') {
      continue;
    }

    const profile = getComponentProfile(row, bundle);
    const roleFactor = ROLE_FACTOR_BY_INGREDIENT_ROLE[row.role] ?? 0;
    const countsMultiplier = row.componentKind === 'bottle' ? 1 : STAPLE_FACTOR;
    const contrib = row.amountMl * roleFactor * countsMultiplier;
    if (contrib <= 0) {
      continue;
    }

    totalContribDen.value += contrib;

    if (!profile?.flavor) {
      continue;
    }

    for (const [dim, w] of Object.entries(profile.flavor)) {
      const dimKey = dim as keyof FlavorWeights;
      const prev = totalContribByDim[dimKey] ?? 0;
      const weight = typeof w === 'number' ? w : 0;
      totalContribByDim[dimKey] = prev + weight * contrib;
    }
  }

  const inherited: FlavorWeights = {};
  const denom = totalContribDen.value;
  if (denom > 0) {
    for (const [dim, sum] of Object.entries(totalContribByDim)) {
      const value = roundTo(sum as number / denom, 2);
      if (value > 0) {
        inherited[dim as keyof FlavorWeights] = value;
      }
    }
  }

  const composed: FlavorWeights = {};
  const authored = drink.flavor.authored;
  const dimUnion = new Set<string>([...Object.keys(inherited), ...Object.keys(authored)]);

  for (const dim of dimUnion) {
    const inheritedW = inherited[dim as keyof FlavorWeights] ?? 0;
    const authoredW = authored[dim as keyof FlavorWeights] ?? 0;
    const clamped = roundTo(clamp01(inheritedW + authoredW), 2);
    if (clamped > 0) {
      composed[dim as keyof FlavorWeights] = clamped;
    }
  }

  return {
    inherited: requiredNonZeroFlavor(inherited),
    composed: requiredNonZeroFlavor(composed),
  };
}

/**
 * Helper: returns composed flavors for all drinks once.
 * This stays pure and is safe as an in-memory cache.
 */
export function buildComposedDrinkFlavorIndex(bundle: CatalogBundle): Map<string, FlavorWeights> {
  const out = new Map<string, FlavorWeights>();
  for (const drink of bundle.drinks) {
    out.set(drink.id, composeDrinkFlavorV1(drink, bundle).composed);
  }
  return out;
}
