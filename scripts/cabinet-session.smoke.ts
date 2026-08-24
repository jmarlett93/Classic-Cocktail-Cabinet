/**
 * Node smoke for PR-03 cabinet session persistence (no Karma/Chrome required).
 * Run: npx tsx scripts/cabinet-session.smoke.ts
 */
import { buildCatalogBundle } from '../src/app/core-services/catalog/catalog-bundle';
import {
  CABINET_SESSION_STORAGE_KEY,
  clearCabinetSessionStorage,
  computeEffectiveHaveSet,
  readCabinetFromSessionStorage,
  sanitizeCabinetSnapshot,
  writeCabinetToSessionStorage,
  type SessionStorageLike,
} from '../src/app/stores/cabinet-session.persistence';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function memoryStorage(): SessionStorageLike {
  const memory = new Map<string, string>();
  return {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => {
      memory.set(key, value);
    },
    removeItem: (key) => {
      memory.delete(key);
    },
  };
}

function run(): void {
  const bundle = buildCatalogBundle();
  const validIds = new Set(bundle.bottles.map((bottle) => bottle.id));
  const campariId = bundle.bottles.find((b) => b.names[0] === 'Campari')!.id;
  const vermouthId = bundle.bottles.find((b) => b.names[0] === 'Dry Vermouth')!.id;

  assert(validIds.has(campariId), 'catalog includes Campari id');
  assert(!validIds.has('bottle-not-real'), 'fake id absent from catalog');

  const sanitized = sanitizeCabinetSnapshot(
    {
      ownedBottleIds: [campariId, 'bottle-not-real'],
      focusBottleId: 'bottle-unknown',
      flavorTerms: ['dry'],
    },
    validIds,
  );
  assert(sanitized.ownedBottleIds.length === 1 && sanitized.ownedBottleIds[0] === campariId, 'unknown owned stripped');
  assert(sanitized.focusBottleId === null, 'unknown focus cleared');

  const storage = memoryStorage();
  writeCabinetToSessionStorage(
    {
      ownedBottleIds: [campariId],
      focusBottleId: vermouthId,
      flavorTerms: ['bitter'],
    },
    storage,
  );
  const restored = readCabinetFromSessionStorage(validIds, storage);
  assert(restored.ownedBottleIds[0] === campariId, 'tab refresh restores owned');
  assert(restored.focusBottleId === vermouthId, 'tab refresh restores focus');

  const freshStorage = memoryStorage();
  const empty = readCabinetFromSessionStorage(validIds, freshStorage);
  assert(empty.ownedBottleIds.length === 0, 'new session starts empty');

  const effective = computeEffectiveHaveSet([campariId], vermouthId);
  assert(effective.includes(campariId) && effective.includes(vermouthId), 'effective have-set is owned union focus');

  clearCabinetSessionStorage(storage);
  assert(storage.getItem(CABINET_SESSION_STORAGE_KEY) === null, 'clear removes session key');

  console.log('OK: PR-03 cabinet session smoke passed');
}

run();
