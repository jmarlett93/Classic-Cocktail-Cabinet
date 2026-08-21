import { FlavorWeights } from '../models/catalog-types';
import {
  CABINET_SESSION_STORAGE_KEY,
  CabinetSessionSnapshot,
  emptyCabinetSessionSnapshot,
} from './cabinet-session.types';

export { CABINET_SESSION_STORAGE_KEY } from './cabinet-session.types';

export interface SessionStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Effective have-set for completeness and unlock: owned ∪ { focus }. */
export function computeEffectiveHaveSet(
  ownedBottleIds: readonly string[],
  focusBottleId: string | null | undefined,
): string[] {
  const effective = new Set<string>(ownedBottleIds);
  if (focusBottleId) {
    effective.add(focusBottleId);
  }
  return [...effective].sort((a, b) => a.localeCompare(b));
}

export function isKnownBottleId(bottleId: string, validBottleIds: ReadonlySet<string>): boolean {
  return validBottleIds.has(bottleId);
}

/** Drop unknown ids; clear focus when it is not in the catalog. */
export function sanitizeCabinetSnapshot(
  snapshot: CabinetSessionSnapshot,
  validBottleIds: ReadonlySet<string>,
): CabinetSessionSnapshot {
  const ownedBottleIds = snapshot.ownedBottleIds.filter((id) => validBottleIds.has(id));
  const focusBottleId =
    snapshot.focusBottleId && validBottleIds.has(snapshot.focusBottleId)
      ? snapshot.focusBottleId
      : null;

  return {
    ownedBottleIds,
    focusBottleId,
    flavorTerms: [...snapshot.flavorTerms],
    flavorVector: snapshot.flavorVector ? { ...snapshot.flavorVector } : undefined,
  };
}

function isFlavorWeights(value: unknown): value is FlavorWeights {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every((v) => typeof v === 'number' && Number.isFinite(v));
}

export function parseCabinetSessionSnapshot(raw: unknown): CabinetSessionSnapshot | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record['ownedBottleIds'])) {
    return null;
  }
  if (!record['ownedBottleIds'].every((id) => typeof id === 'string')) {
    return null;
  }

  const focus = record['focusBottleId'];
  if (focus !== null && focus !== undefined && typeof focus !== 'string') {
    return null;
  }

  const flavorTerms = record['flavorTerms'];
  if (flavorTerms !== undefined && (!Array.isArray(flavorTerms) || !flavorTerms.every((t) => typeof t === 'string'))) {
    return null;
  }

  const flavorVector = record['flavorVector'];
  if (flavorVector !== undefined && !isFlavorWeights(flavorVector)) {
    return null;
  }

  return {
    ownedBottleIds: [...(record['ownedBottleIds'] as string[])],
    focusBottleId: (focus as string | null | undefined) ?? null,
    flavorTerms: flavorTerms ? [...(flavorTerms as string[])] : [],
    flavorVector: flavorVector ? { ...(flavorVector as FlavorWeights) } : undefined,
  };
}

export function readCabinetFromSessionStorage(
  validBottleIds: ReadonlySet<string>,
  storage: SessionStorageLike = sessionStorage,
  key: string = CABINET_SESSION_STORAGE_KEY,
): CabinetSessionSnapshot {
  const raw = storage.getItem(key);
  if (!raw) {
    return emptyCabinetSessionSnapshot();
  }

  try {
    const parsed = parseCabinetSessionSnapshot(JSON.parse(raw));
    if (!parsed) {
      return emptyCabinetSessionSnapshot();
    }
    return sanitizeCabinetSnapshot(parsed, validBottleIds);
  } catch {
    return emptyCabinetSessionSnapshot();
  }
}

export function writeCabinetToSessionStorage(
  snapshot: CabinetSessionSnapshot,
  storage: SessionStorageLike = sessionStorage,
  key: string = CABINET_SESSION_STORAGE_KEY,
): void {
  storage.setItem(key, JSON.stringify(snapshot));
}

export function clearCabinetSessionStorage(
  storage: SessionStorageLike = sessionStorage,
  key: string = CABINET_SESSION_STORAGE_KEY,
): void {
  storage.removeItem(key);
}
