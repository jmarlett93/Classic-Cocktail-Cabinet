import { buildCatalogBundle } from '../catalog/catalog-bundle';
import { computeDrinkCompleteness } from './drink-completeness';

describe('Drink completeness query', () => {
  const bundle = buildCatalogBundle();

  it('classifies Americano as oneBottleAway with Campari-only ownership', () => {
    const results = computeDrinkCompleteness(bundle, {
      ownedBottleIds: ['bottle-campari'],
    });

    const americano = results.find((r) => r.drinkId === 'drink-americano');
    expect(americano).toBeDefined();
    expect(americano!.class).toBe('oneBottleAway');
    expect(americano!.missingBottleIds).toEqual(['bottle-sweet-vermouth']);
  });

  it('classifies Negroni as incomplete with Campari-only ownership', () => {
    const results = computeDrinkCompleteness(bundle, {
      ownedBottleIds: ['bottle-campari'],
    });

    const negroni = results.find((r) => r.drinkId === 'drink-negroni');
    expect(negroni).toBeDefined();
    expect(negroni!.class).toBe('incomplete');
    expect(negroni!.missingBottleIds.sort()).toEqual(['bottle-gin', 'bottle-sweet-vermouth'].sort());
  });

  it('uses focus bottle as owned on bottle-detail queries', () => {
    const results = computeDrinkCompleteness(bundle, {
      ownedBottleIds: ['bottle-campari'],
      focusBottleId: 'bottle-sweet-vermouth',
    });

    const americano = results.find((r) => r.drinkId === 'drink-americano');
    expect(americano).toBeDefined();
    expect(americano!.class).toBe('complete');
    expect(americano!.missingBottleIds).toEqual([]);
  });
});
