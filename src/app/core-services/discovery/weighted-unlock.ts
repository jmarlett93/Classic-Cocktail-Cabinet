import { CatalogBundle, FlavorWeights } from '../../models/catalog-types';
import { composeDrinkFlavorV1 } from './compose-drink-flavor';
import { dotProduct, clamp01, roundTo } from './vector-math';

const KNOWN_COMPOSE_RULES = new Set(['v1']);

const LEAD_ROLES = new Set(['base', 'modifier', 'bitter']);

export interface WeightedUnlockCandidate {
  bottleId: string;
  unlockCount: number;
  seedAsLeadCount: number;
  avgFlavorFit: number;
  weightedScore: number;
  unlockedDrinkIds: string[];
}

export interface RankWeightedUnlockParams {
  ownedBottleIds: readonly string[];
  focusBottleId: string;
  userFlavorVector?: FlavorWeights;
  limit?: number;
}

function effectiveHaveSet(owned: readonly string[], focusBottleId: string): Set<string> {
  return new Set<string>([...owned, focusBottleId]);
}

function getSeedBottle(bundle: CatalogBundle, focusBottleId: string) {
  const seed = bundle.bottles.find((b) => b.id === focusBottleId);
  return seed;
}

function getBottleName(bundle: CatalogBundle, bottleId: string): string {
  const bottle = bundle.bottles.find((b) => b.id === bottleId);
  return bottle?.names?.[0] ?? bottleId;
}

function getRequiredBottleIdsForDrink(bundle: CatalogBundle, drinkId: string): string[] {
  const drink = bundle.drinks.find((d) => d.id === drinkId);
  if (!drink) return [];
  const required = new Set<string>();
  for (const row of drink.ingredients) {
    if (row.componentKind === 'bottle') {
      required.add(row.componentId);
    }
  }
  return [...required].sort((a, b) => a.localeCompare(b));
}

function isSeedAsLeadForDrink(bundle: CatalogBundle, drinkId: string, seedBottleId: string): boolean {
  const drink = bundle.drinks.find((d) => d.id === drinkId);
  if (!drink) return false;

  for (const row of drink.ingredients) {
    if (row.componentKind !== 'bottle') {
      continue;
    }
    if (row.componentId !== seedBottleId) {
      continue;
    }
    return LEAD_ROLES.has(row.role);
  }

  return false;
}

function computeSimilarityVectorForUnlock(bundle: CatalogBundle, seedBottleId: string, userFlavorVector?: FlavorWeights): FlavorWeights {
  const seedBottle = getSeedBottle(bundle, seedBottleId);
  if (!seedBottle) {
    return {};
  }
  return (userFlavorVector && Object.keys(userFlavorVector).length > 0) ? userFlavorVector : seedBottle.flavor;
}

/**
 * Weighted unlock ranking: stable + deterministic.
 * - unlockCount = newly complete drinks if candidate is added
 * - seedAsLeadCount = newly complete drinks where seed/focus is a lead ingredient
 * - avgFlavorFit = average dot similarity between seed/user vector and composed drink flavor
 */
export function rankWeightedUnlockCandidatesV1(bundle: CatalogBundle, params: RankWeightedUnlockParams): WeightedUnlockCandidate[] {
  const { ownedBottleIds, focusBottleId, userFlavorVector } = params;
  const limit = params.limit ?? 5;

  const seedBottle = getSeedBottle(bundle, focusBottleId);
  if (!seedBottle) {
    return [];
  }

  // Precompute composed flavors once: derived from catalog data only (no membership dependency).
  const composedByDrinkId = new Map<string, FlavorWeights>();
  for (const drink of bundle.drinks) {
    if (!KNOWN_COMPOSE_RULES.has(drink.flavor.composeRule)) {
      continue;
    }
    composedByDrinkId.set(drink.id, composeDrinkFlavorV1(drink, bundle).composed);
  }

  const effective = effectiveHaveSet(ownedBottleIds, focusBottleId);
  const seedVector = computeSimilarityVectorForUnlock(bundle, focusBottleId, userFlavorVector);

  const candidates = bundle.bottles
    .filter((b) => b.countsForUnlock)
    .filter((b) => !effective.has(b.id));

  if (candidates.length === 0) {
    return [];
  }

  // Evaluate each candidate against the same effective have-set.
  const evaluated: WeightedUnlockCandidate[] = candidates.map((b) => {
    const newlyUnlockedDrinkIds: string[] = [];
    let seedAsLeadCount = 0;
    let dotSum = 0;

    for (const drink of bundle.drinks) {
      const requiredBottleIds = getRequiredBottleIdsForDrink(bundle, drink.id);
      const missingBefore = requiredBottleIds.filter((id) => !effective.has(id));
      if (missingBefore.length === 0) {
        continue; // already complete
      }

      // Clearer computation:
      const effectiveAfter = new Set<string>([...effective, b.id]);
      const missingAfterClear = requiredBottleIds.filter((id) => !effectiveAfter.has(id));
      if (missingAfterClear.length === 0) {
        newlyUnlockedDrinkIds.push(drink.id);
        if (isSeedAsLeadForDrink(bundle, drink.id, focusBottleId)) {
          seedAsLeadCount += 1;
        }

        const composed = composedByDrinkId.get(drink.id) ?? {};
        // Keep flavor proximity on the same bounded/tied scale as possible/likely ranking.
        // (We clamp+round so unlock gentleness doesn't get dominated by raw dot-product magnitude.)
        const raw = dotProduct(seedVector, composed);
        const normalized = roundTo(clamp01(raw), 3);
        dotSum += normalized;
      }
    }

    const unlockCount = newlyUnlockedDrinkIds.length;
    const avgFlavorFit = unlockCount > 0 ? dotSum / unlockCount : 0;

    // Proposed tuning: count dominates, lead helps break ties, flavor provides gentle steering.
    const weightedScore = unlockCount * 1 + seedAsLeadCount * 2 + avgFlavorFit * 0.25;

    return {
      bottleId: b.id,
      unlockCount,
      seedAsLeadCount,
      avgFlavorFit,
      weightedScore,
      unlockedDrinkIds: newlyUnlockedDrinkIds,
    };
  });

  const maxUnlock = Math.max(0, ...evaluated.map((x) => x.unlockCount));
  if (maxUnlock === 0) {
    return [];
  }

  // Do not recommend zero-unlock when a better option exists.
  const best = evaluated.filter((x) => x.unlockCount > 0);
  best.sort((a, b) => {
    if (b.weightedScore !== a.weightedScore) {
      return b.weightedScore - a.weightedScore;
    }
    // Acceptance contract: tie-break after seed-as-lead.
    if (b.seedAsLeadCount !== a.seedAsLeadCount) {
      return b.seedAsLeadCount - a.seedAsLeadCount;
    }
    // Deterministic name tie-break.
    return getBottleName(bundle, a.bottleId).localeCompare(getBottleName(bundle, b.bottleId));
  });

  return best.slice(0, limit);
}

export function unlockDrinkNames(bundle: CatalogBundle, drinkIds: readonly string[]): string[] {
  return drinkIds
    .map((id) => bundle.drinks.find((d) => d.id === id)?.names?.[0] ?? id)
    .sort((a, b) => a.localeCompare(b));
}
