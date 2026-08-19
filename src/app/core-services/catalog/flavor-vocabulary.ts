import { FlavorWeights, TasteSynonym } from '../../models/catalog-types';
import { isFlavorDimensionId } from '../../models/flavor-dimensions';

export function buildSynonymTermIndex(synonyms: readonly TasteSynonym[]): Map<string, TasteSynonym> {
  const index = new Map<string, TasteSynonym>();
  const entries: { term: string; synonym: TasteSynonym }[] = [];

  for (const synonym of synonyms) {
    for (const term of synonym.terms) {
      entries.push({ term: term.toLowerCase(), synonym });
    }
  }

  entries.sort((a, b) => b.term.length - a.term.length);

  for (const { term, synonym } of entries) {
    if (!index.has(term)) {
      index.set(term, synonym);
    }
  }

  return index;
}

export function lookupFlavorQueryVector(
  query: string,
  synonyms: readonly TasteSynonym[],
): FlavorWeights | undefined {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  const index = buildSynonymTermIndex(synonyms);

  for (const [term, synonym] of index.entries()) {
    if (normalized.includes(term)) {
      return { ...synonym.profile };
    }
  }

  return index.get(normalized)?.profile;
}

export function mergeFlavorVectors(vectors: FlavorWeights[]): FlavorWeights {
  const merged: FlavorWeights = {};
  for (const vector of vectors) {
    for (const [dim, weight] of Object.entries(vector)) {
      if (!isFlavorDimensionId(dim) || weight === undefined) {
        continue;
      }
      const existing = merged[dim] ?? 0;
      merged[dim] = Math.min(1, Math.max(existing, weight));
    }
  }
  return merged;
}
