import { FlavorWeights } from '../../models/catalog-types';

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Dot-product similarity between two sparse vectors. */
export function dotProduct(a: FlavorWeights, b: FlavorWeights): number {
  let sum = 0;
  // Iterate smaller map for efficiency.
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length <= bKeys.length) {
    for (const k of aKeys) {
      const av = a[k as keyof FlavorWeights];
      const bv = b[k as keyof FlavorWeights];
      if (typeof av === 'number' && typeof bv === 'number') {
        sum += av * bv;
      }
    }
  } else {
    for (const k of bKeys) {
      const av = a[k as keyof FlavorWeights];
      const bv = b[k as keyof FlavorWeights];
      if (typeof av === 'number' && typeof bv === 'number') {
        sum += av * bv;
      }
    }
  }

  return sum;
}

/**
 * Returns a normalized copy without 0/undefined values.
 * Useful when vectors come from typed JSON but may include zeros.
 */
export function compactVector(vector: FlavorWeights): FlavorWeights {
  const out: FlavorWeights = {};
  for (const [k, v] of Object.entries(vector)) {
    if (typeof v === 'number' && v > 0) {
      out[k as keyof FlavorWeights] = v;
    }
  }
  return out;
}
