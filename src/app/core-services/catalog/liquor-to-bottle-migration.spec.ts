import { liquors } from '../../models/recipe-book';
import { liquorNameToBottleId, migrateLiquorToBottle } from './liquor-to-bottle-migration';

describe('Liquor to bottle migration', () => {
  it('derives stable type-level ids from legacy liquor names', () => {
    expect(liquorNameToBottleId('Dry Vermouth')).toBe('bottle-dry-vermouth');
    expect(liquorNameToBottleId("Pimm's No. 1")).toBe('bottle-pimms-no-1');
  });

  it('produces weighted flavor maps in (0, 1]', () => {
    const campari = liquors.find((l) => l.name === 'Campari')!;
    const bottle = migrateLiquorToBottle(campari);
    expect(bottle.id).toBe('bottle-campari');
    expect(bottle.flavor.bitter).toBeGreaterThan(0);
    expect(bottle.flavor.bitter!).toBeLessThanOrEqual(1);
    expect(bottle.countsForUnlock).toBe(true);
  });

  it('maps vermouth to vermouth kind rather than generic spirit', () => {
    const dry = migrateLiquorToBottle(liquors.find((l) => l.name === 'Dry Vermouth')!);
    expect(dry.kind).toBe('vermouth');
    expect(dry.spiritFamily).toBe('vermouth');
  });
});
