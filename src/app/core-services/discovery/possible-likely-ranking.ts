import { CatalogBundle, FlavorWeights } from '../../models/catalog-types';
import { composeDrinkFlavorV1 } from './compose-drink-flavor';
import { dotProduct, compactVector, clamp01, roundTo } from './vector-math';

const KNOWN_COMPOSE_RULES = new Set(['v1']);

export const POSSIBLE_SIMILARITY_FLOOR = 0.25;
export const LIKELY_SIMILARITY_FLOOR = 0.35;
export const LIKELY_LIMIT = 5;

export type ReasonedEntity = {
  id: string;
  names: string[];
  primaryName: string;
  score?: number;
  reasons: string[];
};

export interface PossibleLikelyResult {
  possibleDrinks: ReasonedEntity[];
  likelyDrinks: ReasonedEntity[];
  possibleBottles: ReasonedEntity[];
  likelyBottles: ReasonedEntity[];
}

function primaryName(names: readonly string[] | undefined, id: string): string {
  return (names && names[0]) ? names[0] : id;
}

function uniqueSortedIds(ids: string[]): string[] {
  return [...new Set(ids)].sort((a, b) => a.localeCompare(b));
}

function buildComposedByDrinkId(bundle: CatalogBundle): Map<string, FlavorWeights> {
  const out = new Map<string, FlavorWeights>();
  for (const drink of bundle.drinks) {
    if (!KNOWN_COMPOSE_RULES.has(drink.flavor.composeRule)) {
      continue;
    }
    out.set(drink.id, composeDrinkFlavorV1(drink, bundle).composed);
  }
  return out;
}

function buildBottleById(bundle: CatalogBundle): Map<string, typeof bundle.bottles[number]> {
  const out = new Map<string, typeof bundle.bottles[number]>();
  for (const b of bundle.bottles) {
    out.set(b.id, b);
  }
  return out;
}

function similarityScore(query: FlavorWeights, vector: FlavorWeights): number {
  // Keep deterministic and bounded-ish: dot products are naturally in [0,1] for our v1 weights.
  const dot = dotProduct(query, vector);
  // Round to 3 decimals for stable tie-breaking in test snapshots.
  return roundTo(clamp01(dot), 3);
}

function rankEntities<T extends ReasonedEntity>(
  entities: readonly T[],
  pickLimit?: number,
): T[] {
  const sorted = [...entities].sort((a, b) => {
    const as = a.score ?? 0;
    const bs = b.score ?? 0;
    if (bs !== as) {
      return bs - as;
    }
    return a.primaryName.localeCompare(b.primaryName);
  });

  if (pickLimit === undefined) {
    return sorted;
  }
  return sorted.slice(0, pickLimit);
}

function toReasonedEntity(bundle: CatalogBundle, kind: 'drink' | 'bottle', id: string, score: number | undefined, reasons: string[]): ReasonedEntity {
  if (kind === 'drink') {
    const drink = bundle.drinks.find((d) => d.id === id);
    if (!drink) {
      // Should never happen for catalog-consistent callers.
      return { id, names: [id], primaryName: id, score, reasons: reasons };
    }
    return {
      id,
      names: drink.names,
      primaryName: primaryName(drink.names, id),
      score,
      reasons,
    };
  }

  const bottle = bundle.bottles.find((b) => b.id === id);
  if (!bottle) {
    return { id, names: [id], primaryName: id, score, reasons: reasons };
  }

  return {
    id,
    names: bottle.names,
    primaryName: primaryName(bottle.names, id),
    score,
    reasons,
  };
}

export function rankPossibleLikelyByFlavorVector(bundle: CatalogBundle, queryVector: FlavorWeights): PossibleLikelyResult {
  const query = compactVector(queryVector);
  if (Object.keys(query).length === 0) {
    return {
      possibleDrinks: [],
      likelyDrinks: [],
      possibleBottles: [],
      likelyBottles: [],
    };
  }

  const composedByDrinkId = buildComposedByDrinkId(bundle);
  const bottleById = buildBottleById(bundle);

  const possibleDrinks: ReasonedEntity[] = [];
  const likelyDrinks: ReasonedEntity[] = [];

  for (const drink of bundle.drinks) {
    const composed = composedByDrinkId.get(drink.id) ?? {};
    const s = similarityScore(query, composed);
    if (s >= POSSIBLE_SIMILARITY_FLOOR) {
      possibleDrinks.push(
        toReasonedEntity(bundle, 'drink', drink.id, s, [`flavor similarity >= ${POSSIBLE_SIMILARITY_FLOOR}`]),
      );
    }
    if (s >= LIKELY_SIMILARITY_FLOOR) {
      likelyDrinks.push(
        toReasonedEntity(bundle, 'drink', drink.id, s, [`flavor similarity >= ${LIKELY_SIMILARITY_FLOOR}`]),
      );
    }
  }

  const possibleBottles: ReasonedEntity[] = [];
  const likelyBottles: ReasonedEntity[] = [];

  for (const bottle of bundle.bottles) {
    if (!bottle.countsForUnlock) {
      continue;
    }

    const s = similarityScore(query, bottle.flavor);
    if (s >= POSSIBLE_SIMILARITY_FLOOR) {
      possibleBottles.push(
        toReasonedEntity(bundle, 'bottle', bottle.id, s, [`flavor similarity >= ${POSSIBLE_SIMILARITY_FLOOR}`]),
      );
    }
    if (s >= LIKELY_SIMILARITY_FLOOR) {
      likelyBottles.push(
        toReasonedEntity(bundle, 'bottle', bottle.id, s, [`flavor similarity >= ${LIKELY_SIMILARITY_FLOOR}`]),
      );
    }
  }

  return {
    possibleDrinks: rankEntities(possibleDrinks),
    likelyDrinks: rankEntities(likelyDrinks, LIKELY_LIMIT),
    possibleBottles: rankEntities(possibleBottles),
    likelyBottles: rankEntities(likelyBottles, LIKELY_LIMIT),
  };
}

export function rankPossibleLikelyByBottleId(bundle: CatalogBundle, bottleId: string): PossibleLikelyResult {
  const bottleById = buildBottleById(bundle);
  const seed = bottleById.get(bottleId);
  if (!seed) {
    return {
      possibleDrinks: [],
      likelyDrinks: [],
      possibleBottles: [],
      likelyBottles: [],
    };
  }

  const composedByDrinkId = buildComposedByDrinkId(bundle);

  // Drinks: possible = membership; likely = similarity among those.
  const possibleDrinkIds = bundle.drinks
    .filter((d) => d.ingredients.some((row) => row.componentKind === 'bottle' && row.componentId === bottleId))
    .map((d) => d.id);

  const possibleDrinks: ReasonedEntity[] = [];
  const likelyDrinks: ReasonedEntity[] = [];

  for (const id of possibleDrinkIds) {
    const composed = composedByDrinkId.get(id) ?? {};
    const s = similarityScore(seed.flavor, composed);
    possibleDrinks.push(
      toReasonedEntity(bundle, 'drink', id, s, [`includes bottle:${bottleId}`]),
    );
    if (s >= LIKELY_SIMILARITY_FLOOR) {
      likelyDrinks.push(
        toReasonedEntity(bundle, 'drink', id, s, [`includes bottle:${bottleId}`, `flavor similarity >= ${LIKELY_SIMILARITY_FLOOR}`]),
      );
    }
  }

  // Bottles: possible = co-occurrence AND low-bar similarity; likely = similarity leaders.
  const coOccurBottleIds: string[] = [];
  for (const drink of bundle.drinks) {
    const includesSeed = drink.ingredients.some((row) => row.componentKind === 'bottle' && row.componentId === bottleId);
    if (!includesSeed) continue;

    for (const row of drink.ingredients) {
      if (row.componentKind === 'bottle' && row.componentId !== bottleId) {
        coOccurBottleIds.push(row.componentId);
      }
    }
  }

  const coOccurUnique = uniqueSortedIds(coOccurBottleIds);

  const possibleBottles: ReasonedEntity[] = [];
  const likelyBottles: ReasonedEntity[] = [];

  for (const id of coOccurUnique) {
    const bottle = bottleById.get(id);
    if (!bottle || !bottle.countsForUnlock) {
      continue;
    }

    const s = similarityScore(seed.flavor, bottle.flavor);

    // Possible bottle semantics: co-occurrence membership is necessary, but we still require the overlap floor.
    if (s < POSSIBLE_SIMILARITY_FLOOR) continue;

    possibleBottles.push(
      toReasonedEntity(
        bundle,
        'bottle',
        id,
        s,
        [`co-occurs with bottle:${bottleId}`, `flavor similarity >= ${POSSIBLE_SIMILARITY_FLOOR}`],
      ),
    );

    if (s >= LIKELY_SIMILARITY_FLOOR) {
      likelyBottles.push(
        toReasonedEntity(bundle, 'bottle', id, s, [`co-occurs with bottle:${bottleId}`, `flavor similarity >= ${LIKELY_SIMILARITY_FLOOR}`]),
      );
    }
  }

  // Keep likely list short; prefer stable sorting.
  return {
    possibleDrinks: rankEntities(possibleDrinks),
    likelyDrinks: rankEntities(likelyDrinks, LIKELY_LIMIT),
    possibleBottles: rankEntities(possibleBottles),
    likelyBottles: rankEntities(likelyBottles, LIKELY_LIMIT),
  };
}
