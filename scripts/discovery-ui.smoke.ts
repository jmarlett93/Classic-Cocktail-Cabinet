/**
 * Node smoke for PR-04 two-mode discovery surfaces (no Karma/Chrome required).
 * Covers flavor query, compose split, completeness∪focus, unlock, and possible/likely empties.
 * Run: npx tsx scripts/discovery-ui.smoke.ts
 */
import { buildCatalogBundle } from '../src/app/core-services/catalog/catalog-bundle';
import { composeDrinkFlavorV1 } from '../src/app/core-services/discovery/compose-drink-flavor';
import { computeDrinkCompleteness } from '../src/app/core-services/discovery/drink-completeness';
import {
  fuzzyMatchNames,
  resolveFlavorQuery,
  flavorIntensityLevel,
} from '../src/app/core-services/discovery/flavor-query';
import { rankPossibleLikelyByFlavorVector } from '../src/app/core-services/discovery/possible-likely-ranking';
import {
  rankWeightedUnlockCandidatesV1,
  unlockDrinkNames,
} from '../src/app/core-services/discovery/weighted-unlock';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function run(): void {
  const bundle = buildCatalogBundle();
  assert(bundle.drinks.length >= 20, 'drink catalog populated for unlock credibility');
  assert(bundle.bottles.length > 0, 'bottle catalog populated');

  const negroni = bundle.drinks.find((d) => d.id === 'drink-negroni' || d.names[0] === 'Negroni');
  assert(!!negroni, 'Negroni exists');
  const composed = composeDrinkFlavorV1(negroni!, bundle);
  assert(Object.keys(composed.composed).length > 0, 'composed flavor non-empty');
  assert(Object.keys(composed.inherited).length > 0, 'inherited flavor derived');

  const campari = bundle.bottles.find((b) => b.names[0] === 'Campari')!;
  assert(!!campari, 'Campari exists');

  const completeness = computeDrinkCompleteness(bundle, {
    ownedBottleIds: [],
    focusBottleId: campari.id,
  });
  const involving = completeness.filter((row) => {
    const drink = bundle.drinks.find((d) => d.id === row.drinkId);
    return drink?.ingredients.some(
      (ing) => ing.componentKind === 'bottle' && ing.componentId === campari.id,
    );
  });
  assert(involving.length > 0, 'Campari participates in at least one drink');
  assert(
    involving.some((row) => row.class === 'complete' || row.class === 'oneBottleAway' || row.class === 'incomplete'),
    'completeness classes assigned',
  );

  const unlock = rankWeightedUnlockCandidatesV1(bundle, {
    ownedBottleIds: [],
    focusBottleId: campari.id,
    limit: 5,
  });
  assert(Array.isArray(unlock), 'unlock returns an array');
  if (unlock.length) {
    assert(unlock[0].unlockCount > 0, 'top unlock improves coverage');
    const names = unlockDrinkNames(bundle, unlock[0].unlockedDrinkIds);
    assert(names.length === unlock[0].unlockedDrinkIds.length, 'unlock drink names resolve');
  }

  const bitter = resolveFlavorQuery('bitter', bundle.synonyms);
  assert(!!bitter && (bitter.bitter ?? 0) > 0, 'bitter synonym resolves');
  const ranked = rankPossibleLikelyByFlavorVector(bundle, bitter!);
  assert(ranked.likelyDrinks.length + ranked.possibleDrinks.length > 0, 'bitter yields drink candidates');
  assert(ranked.likelyBottles.length + ranked.possibleBottles.length > 0, 'bitter yields bottle candidates');

  const empty = resolveFlavorQuery('xyzzy-not-a-flavor', bundle.synonyms);
  assert(empty === undefined, 'unknown flavor does not invent a vector');
  const emptyRank = rankPossibleLikelyByFlavorVector(bundle, {});
  assert(
    emptyRank.likelyDrinks.length === 0 && emptyRank.likelyBottles.length === 0,
    'empty vector invents nothing',
  );

  assert(fuzzyMatchNames('negr', ['Negroni']), 'fuzzy drink name match');
  assert(flavorIntensityLevel(0.9) === 'High', 'intensity High');
  assert(flavorIntensityLevel(0.45) === 'Medium', 'intensity Medium');
  assert(flavorIntensityLevel(0.1) === 'Low', 'intensity Low');

  console.log('OK: PR-04 discovery UI smoke passed');
}

run();
