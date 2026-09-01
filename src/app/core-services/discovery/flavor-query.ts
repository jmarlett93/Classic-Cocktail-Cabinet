import { FlavorWeights, TasteSynonym } from '../../models/catalog-types';
import { lookupFlavorQueryVector, mergeFlavorVectors } from '../catalog/flavor-vocabulary';

export type FlavorIntensityLevel = 'Low' | 'Medium' | 'High';

/** Map a sparse weight to Low / Medium / High for accessible flavor presentation. */
export function flavorIntensityLevel(weight: number): FlavorIntensityLevel {
  if (weight >= 0.7) {
    return 'High';
  }
  if (weight >= 0.4) {
    return 'Medium';
  }
  return 'Low';
}

/**
 * Resolve a free-text flavor query into a canonical weight vector.
 * Splits on commas / "and", looks up each token, and max-merges profiles.
 */
export function resolveFlavorQuery(
  query: string,
  synonyms: readonly TasteSynonym[],
): FlavorWeights | undefined {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  const tokens = normalized
    .split(/,|\band\b/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (tokens.length === 0) {
    return undefined;
  }

  const vectors: FlavorWeights[] = [];
  for (const token of tokens) {
    const vector = lookupFlavorQueryVector(token, synonyms);
    if (vector && Object.keys(vector).length > 0) {
      vectors.push(vector);
    }
  }

  if (vectors.length === 0) {
    // Fall back to whole-string synonym match (e.g. "not sweet").
    return lookupFlavorQueryVector(normalized, synonyms);
  }

  return mergeFlavorVectors(vectors);
}

/** Case-insensitive fuzzy name match against display names and aliases. */
export function fuzzyMatchNames(query: string, names: readonly string[]): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return names.some((name) => name.toLowerCase().includes(needle));
}
