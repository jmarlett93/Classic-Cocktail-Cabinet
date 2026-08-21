import { CatalogBundle } from '../../models/catalog-types';

export type DrinkCompletenessClass = 'complete' | 'oneBottleAway' | 'incomplete';

export interface DrinkCompletenessResult {
  drinkId: string;
  class: DrinkCompletenessClass;
  missingBottleIds: string[];
}

function computeEffectiveHaveSet(ownedBottleIds: readonly string[], focusBottleId?: string): Set<string> {
  const effective = new Set<string>(ownedBottleIds);
  if (focusBottleId) {
    effective.add(focusBottleId);
  }
  return effective;
}

function requiredBottleIdsForDrink(bundle: CatalogBundle, drinkId: string): string[] {
  const drink = bundle.drinks.find((d) => d.id === drinkId);
  if (!drink) {
    return [];
  }

  const required = new Set<string>();
  for (const row of drink.ingredients) {
    if (row.componentKind !== 'bottle') {
      continue;
    }
    required.add(row.componentId);
  }

  // Stable ordering for deterministic UI + test fixtures.
  return [...required].sort((a, b) => a.localeCompare(b));
}

/**
 * Given an effective have-set (owned, plus optional focus when querying bottle-detail),
 * classify each drink as complete / one-bottle-away / further incomplete.
 */
export function computeDrinkCompleteness(
  bundle: CatalogBundle,
  params: {
    ownedBottleIds: readonly string[];
    focusBottleId?: string;
  },
): DrinkCompletenessResult[] {
  const effective = computeEffectiveHaveSet(params.ownedBottleIds, params.focusBottleId);

  return bundle.drinks
    .map((drink) => {
      const required = requiredBottleIdsForDrink(bundle, drink.id);
      const missing = required.filter((id) => !effective.has(id));

      if (missing.length === 0) {
        return {
          drinkId: drink.id,
          class: 'complete' as const,
          missingBottleIds: [],
        };
      }

      if (missing.length === 1) {
        return {
          drinkId: drink.id,
          class: 'oneBottleAway' as const,
          missingBottleIds: missing,
        };
      }

      return {
        drinkId: drink.id,
        class: 'incomplete' as const,
        missingBottleIds: missing,
      };
    })
    .sort((a, b) => a.drinkId.localeCompare(b.drinkId));
}
