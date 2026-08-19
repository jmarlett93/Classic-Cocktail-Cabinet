import { buildCatalogBundle, loadCatalogBundle } from './catalog-bundle';
import { assertCatalogIntegrity, validateCatalogIntegrity } from './catalog-integrity';
import {
  LEGACY_LIQUOR_NAMES,
  liquorNameToBottleId,
  migrateLegacyLiquors,
} from './liquor-to-bottle-migration';

describe('Catalog integrity', () => {
  const bundle = buildCatalogBundle();

  it('passes integrity on the shipped catalog bundle', () => {
    expect(() => assertCatalogIntegrity(bundle)).not.toThrow();
    expect(validateCatalogIntegrity(bundle).ok).toBe(true);
  });

  it('ships at least twenty authored drinks with resolvable joins', () => {
    expect(bundle.drinks.length).toBeGreaterThanOrEqual(20);
    const negroni = bundle.drinks.find((d) => d.id === 'drink-negroni');
    expect(negroni).toBeDefined();
    const bottleIds = negroni!.ingredients
      .filter((row) => row.componentKind === 'bottle')
      .map((row) => row.componentId);
    expect(bottleIds.every((id) => bundle.bottles.some((b) => b.id === id))).toBe(true);
  });

  it('marks staples as not counting for unlock', () => {
    expect(bundle.staples.length).toBeGreaterThan(0);
    expect(bundle.staples.every((s) => s.countsForUnlock === false)).toBe(true);
  });

  it('migrates every legacy liquor into a weighted bottle record', () => {
    const migrated = migrateLegacyLiquors();
    expect(migrated.length).toBe(LEGACY_LIQUOR_NAMES.length);
    for (const name of LEGACY_LIQUOR_NAMES) {
      const id = liquorNameToBottleId(name);
      const bottle = migrated.find((b) => b.id === id);
      expect(bottle).withContext(name).toBeDefined();
      expect(Object.keys(bottle!.flavor).length).toBeGreaterThan(0);
      expect(bottle!.countsForUnlock).toBe(true);
    }
  });

  it('flags duplicate bottle ids even when display names differ', () => {
    const broken = structuredClone(bundle);
    broken.bottles = [
      ...broken.bottles,
      {
        ...broken.bottles[0],
        names: ['Completely Distinct Alias'],
      },
    ];
    const result = validateCatalogIntegrity(broken);
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.rule === 'unique-ids')).toBe(true);
  });

  it('flags duplicate drink ids even when display names differ', () => {
    const broken = structuredClone(bundle);
    broken.drinks = [
      ...broken.drinks,
      {
        ...broken.drinks[0],
        names: ['Another Drink Entirely'],
      },
    ];
    const result = validateCatalogIntegrity(broken);
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.rule === 'unique-ids')).toBe(true);
  });

  it('flags illegal flavor keys on bottles', () => {
    const broken = structuredClone(bundle);
    broken.bottles[0] = {
      ...broken.bottles[0],
      flavor: { ...broken.bottles[0].flavor, rogueAxis: 0.5 } as typeof broken.bottles[0]['flavor'],
    };
    const result = validateCatalogIntegrity(broken);
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.rule === 'bottle-flavor')).toBe(true);
  });

  it('flags drinks missing unlock bottles', () => {
    const broken = structuredClone(bundle);
    broken.drinks[0] = {
      ...broken.drinks[0],
      ingredients: broken.drinks[0].ingredients.filter((row) => row.componentKind !== 'bottle'),
    };
    const result = validateCatalogIntegrity(broken);
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.rule === 'unlock-bottle')).toBe(true);
  });

  it('flags unresolved recipe component ids', () => {
    const broken = structuredClone(bundle);
    broken.drinks[0] = {
      ...broken.drinks[0],
      ingredients: [
        ...broken.drinks[0].ingredients,
        {
          componentKind: 'bottle',
          componentId: 'bottle-missing',
          role: 'base',
          amountMl: 30,
        },
      ],
    };
    const result = validateCatalogIntegrity(broken);
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.rule === 'component-resolution')).toBe(true);
  });

  it('loadCatalogBundle returns a cached singleton', () => {
    const first = loadCatalogBundle();
    const second = loadCatalogBundle();
    expect(first).toBe(second);
  });
});
