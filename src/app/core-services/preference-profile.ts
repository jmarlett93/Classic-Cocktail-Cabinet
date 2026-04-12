import { familiesToLiquorTagWeights, mergePositiveNegative } from './liquor-scoring';
import {
  extractLiquorTypesFromText,
  extractNegativeTasteFamilies,
  extractPositiveTasteFamilies,
} from './taste-vocabulary';

/**
 * Raw family hits for a one-line UI summary (deterministic).
 */
export function summarizeProfileShift(turns: string[]): string | undefined {
  if (turns.length < 2) {
    return undefined;
  }
  const first = turns[0].toLowerCase();
  const last = turns[turns.length - 1].toLowerCase();
  const a = extractPositiveTasteFamilies(first);
  const b = extractPositiveTasteFamilies(last);
  const na = extractNegativeTasteFamilies(last);
  if (na.length) {
    return `Weighting later messages more: avoiding ${na.join(', ')} after your latest note.`;
  }
  const added = b.filter((x) => !a.includes(x));
  if (added.length) {
    return `Layering in ${added.join(', ')} from your latest message.`;
  }
  return undefined;
}

export interface PreferenceProfile {
  effectivePos: Map<string, number>;
  effectiveNeg: Map<string, number>;
  summaryLine?: string;
}

export interface PreferenceProfileConfig {
  windowK: number;
  latestBoost: number;
}

const DEFAULT_CFG: PreferenceProfileConfig = {
  windowK: 10,
  latestBoost: 1.2,
};

/**
 * Deterministic recency-weighted merge of user-only transcript lines.
 */
export function buildPreferenceProfile(userTurns: string[], cfg: Partial<PreferenceProfileConfig> = {}): PreferenceProfile {
  const { windowK, latestBoost } = { ...DEFAULT_CFG, ...cfg };
  const trimmed = userTurns.map((t) => t.trim()).filter(Boolean);
  const windowed = trimmed.slice(-windowK);
  const L = windowed.length;
  if (L === 0) {
    return { effectivePos: new Map(), effectiveNeg: new Map(), summaryLine: undefined };
  }

  const TP = new Map<string, number>();
  const TN = new Map<string, number>();

  for (let i = 0; i < L; i++) {
    const wBase = Math.pow(0.5, L - 1 - i);
    const w = L > 1 && i === L - 1 ? wBase * latestBoost : L === 1 ? 1 : wBase;
    const { positive, negative } = familiesToLiquorTagWeights(
      extractPositiveTasteFamilies(windowed[i]),
      extractNegativeTasteFamilies(windowed[i]),
    );
    const { effectivePos, effectiveNeg } = mergePositiveNegative(positive, negative);
    for (const [k, v] of effectivePos) {
      TP.set(k, (TP.get(k) ?? 0) + w * v);
    }
    for (const [k, v] of effectiveNeg) {
      TN.set(k, (TN.get(k) ?? 0) + w * v);
    }
  }

  const { effectivePos, effectiveNeg } = mergePositiveNegative(TP, TN);
  return {
    effectivePos,
    effectiveNeg,
    summaryLine: summarizeProfileShift(windowed),
  };
}

/** Type hints from the latest user line only (spirit names / categories). */
export function latestTypeHints(lastUserLine: string): ReturnType<typeof extractLiquorTypesFromText> {
  return extractLiquorTypesFromText(lastUserLine);
}
