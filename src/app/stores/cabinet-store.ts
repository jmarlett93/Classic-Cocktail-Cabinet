import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';

import { loadCatalogBundle } from '../core-services/catalog/catalog-bundle';
import { FlavorWeights } from '../models/catalog-types';
import {
  clearCabinetSessionStorage,
  computeEffectiveHaveSet,
  isKnownBottleId,
  readCabinetFromSessionStorage,
  sanitizeCabinetSnapshot,
  writeCabinetToSessionStorage,
} from './cabinet-session.persistence';
import { CabinetSessionSnapshot, emptyCabinetSessionSnapshot } from './cabinet-session.types';

function catalogBottleIdSet(): Set<string> {
  return new Set(loadCatalogBundle().bottles.map((bottle) => bottle.id));
}

function toSnapshot(state: CabinetSessionSnapshot): CabinetSessionSnapshot {
  return sanitizeCabinetSnapshot(state, catalogBottleIdSet());
}

function persistSnapshot(snapshot: CabinetSessionSnapshot): void {
  writeCabinetToSessionStorage(toSnapshot(snapshot));
}

const initialState: CabinetSessionSnapshot = emptyCabinetSessionSnapshot();

type CabinetStoreSlice = {
  ownedBottleIds: () => string[];
  focusBottleId: () => string | null;
  flavorTerms: () => string[];
  flavorVector?: () => FlavorWeights | undefined;
};

function currentSnapshot(store: CabinetStoreSlice): CabinetSessionSnapshot {
  return {
    ownedBottleIds: store.ownedBottleIds(),
    focusBottleId: store.focusBottleId(),
    flavorTerms: store.flavorTerms(),
    flavorVector: store.flavorVector?.(),
  };
}

export const CabinetStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ ownedBottleIds, focusBottleId }) => ({
    effectiveHaveSet: computed(() => computeEffectiveHaveSet(ownedBottleIds(), focusBottleId())),
  })),
  withMethods((store) => ({
    toggleOwned(bottleId: string): boolean {
      const validIds = catalogBottleIdSet();
      if (!isKnownBottleId(bottleId, validIds)) {
        return false;
      }

      const owned = new Set(store.ownedBottleIds());
      if (owned.has(bottleId)) {
        owned.delete(bottleId);
      } else {
        owned.add(bottleId);
      }

      const next = toSnapshot({
        ...currentSnapshot(store),
        ownedBottleIds: [...owned].sort((a, b) => a.localeCompare(b)),
      });
      patchState(store, next);
      persistSnapshot(next);
      return true;
    },

    setOwned(bottleId: string, owned: boolean): boolean {
      const validIds = catalogBottleIdSet();
      if (!isKnownBottleId(bottleId, validIds)) {
        return false;
      }

      const ownedSet = new Set(store.ownedBottleIds());
      if (owned) {
        ownedSet.add(bottleId);
      } else {
        ownedSet.delete(bottleId);
      }

      const next = toSnapshot({
        ...currentSnapshot(store),
        ownedBottleIds: [...ownedSet].sort((a, b) => a.localeCompare(b)),
      });
      patchState(store, next);
      persistSnapshot(next);
      return true;
    },

    setFocus(bottleId: string | null): boolean {
      const validIds = catalogBottleIdSet();
      if (bottleId !== null && !isKnownBottleId(bottleId, validIds)) {
        return false;
      }

      const next = toSnapshot({
        ...currentSnapshot(store),
        focusBottleId: bottleId,
      });
      patchState(store, next);
      persistSnapshot(next);
      return true;
    },

    clearFocus(): void {
      const next = toSnapshot({
        ...currentSnapshot(store),
        focusBottleId: null,
      });
      patchState(store, next);
      persistSnapshot(next);
    },

    setFlavorTerms(flavorTerms: string[]): void {
      const next = toSnapshot({
        ...currentSnapshot(store),
        flavorTerms: [...flavorTerms],
      });
      patchState(store, next);
      persistSnapshot(next);
    },

    setFlavorVector(flavorVector: FlavorWeights | undefined): void {
      const next = toSnapshot({
        ...currentSnapshot(store),
        flavorVector: flavorVector ? { ...flavorVector } : undefined,
      });
      patchState(store, next);
      persistSnapshot(next);
    },

    resetSession(): void {
      const next = emptyCabinetSessionSnapshot();
      patchState(store, next);
      clearCabinetSessionStorage();
    },

    isOwned(bottleId: string): boolean {
      return store.ownedBottleIds().includes(bottleId);
    },
  })),
  withHooks({
    onInit(store) {
      const restored = readCabinetFromSessionStorage(catalogBottleIdSet());
      patchState(store, restored);
    },
  }),
);
