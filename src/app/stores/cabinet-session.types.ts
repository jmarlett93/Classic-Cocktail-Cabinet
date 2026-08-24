import { FlavorWeights } from '../models/catalog-types';

/** Visit-scoped cabinet state persisted for the current browser session only. */
export interface CabinetSessionSnapshot {
  ownedBottleIds: string[];
  focusBottleId: string | null;
  flavorTerms: string[];
  flavorVector?: FlavorWeights;
}

export const CABINET_SESSION_STORAGE_KEY = 'ccc.cabinet.session.v1';

export const emptyCabinetSessionSnapshot = (): CabinetSessionSnapshot => ({
  ownedBottleIds: [],
  focusBottleId: null,
  flavorTerms: [],
  flavorVector: undefined,
});
