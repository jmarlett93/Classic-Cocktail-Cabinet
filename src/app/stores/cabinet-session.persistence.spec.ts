import { buildCatalogBundle } from '../core-services/catalog/catalog-bundle';
import {
  CABINET_SESSION_STORAGE_KEY,
  clearCabinetSessionStorage,
  computeEffectiveHaveSet,
  parseCabinetSessionSnapshot,
  readCabinetFromSessionStorage,
  sanitizeCabinetSnapshot,
  writeCabinetToSessionStorage,
  type SessionStorageLike,
} from './cabinet-session.persistence';

describe('Cabinet session persistence', () => {
  let validIds: Set<string>;
  let memory: Map<string, string>;
  let storage: SessionStorageLike;

  beforeEach(() => {
    const bundle = buildCatalogBundle();
    validIds = new Set(bundle.bottles.map((bottle) => bottle.id));
    memory = new Map<string, string>();
    storage = {
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => {
        memory.set(key, value);
      },
      removeItem: (key) => {
        memory.delete(key);
      },
    };
  });

  it('rejects unknown owned and focus ids when sanitizing', () => {
    const sanitized = sanitizeCabinetSnapshot(
      {
        ownedBottleIds: ['bottle-campari', 'bottle-not-real'],
        focusBottleId: 'bottle-unknown',
        flavorTerms: ['dry'],
      },
      validIds,
    );

    expect(sanitized.ownedBottleIds).toEqual(['bottle-campari']);
    expect(sanitized.focusBottleId).toBeNull();
    expect(sanitized.flavorTerms).toEqual(['dry']);
  });

  it('restores persisted state within the same session storage bucket', () => {
    writeCabinetToSessionStorage(
      {
        ownedBottleIds: ['bottle-campari'],
        focusBottleId: 'bottle-dry-vermouth',
        flavorTerms: ['bitter'],
      },
      storage,
    );

    const restored = readCabinetFromSessionStorage(validIds, storage);
    expect(restored.ownedBottleIds).toEqual(['bottle-campari']);
    expect(restored.focusBottleId).toBe('bottle-dry-vermouth');
    expect(restored.flavorTerms).toEqual(['bitter']);
  });

  it('starts empty when session storage is missing', () => {
    const restored = readCabinetFromSessionStorage(validIds, storage);
    expect(restored.ownedBottleIds).toEqual([]);
    expect(restored.focusBottleId).toBeNull();
  });

  it('drops corrupt session payloads instead of throwing', () => {
    storage.setItem(CABINET_SESSION_STORAGE_KEY, '{not-json');
    const restored = readCabinetFromSessionStorage(validIds, storage);
    expect(restored.ownedBottleIds).toEqual([]);
  });

  it('exposes owned union focus for consumers', () => {
    expect(
      computeEffectiveHaveSet(['bottle-campari'], 'bottle-dry-vermouth'),
    ).toEqual(['bottle-campari', 'bottle-dry-vermouth']);
    expect(computeEffectiveHaveSet(['bottle-campari'], null)).toEqual(['bottle-campari']);
  });

  it('parses and clears session snapshots', () => {
    const parsed = parseCabinetSessionSnapshot({
      ownedBottleIds: ['bottle-campari'],
      focusBottleId: null,
      flavorTerms: [],
    });
    expect(parsed?.ownedBottleIds).toEqual(['bottle-campari']);

    writeCabinetToSessionStorage(
      {
        ownedBottleIds: ['bottle-campari'],
        focusBottleId: null,
        flavorTerms: [],
      },
      storage,
    );
    clearCabinetSessionStorage(storage);
    expect(storage.getItem(CABINET_SESSION_STORAGE_KEY)).toBeNull();
  });
});
