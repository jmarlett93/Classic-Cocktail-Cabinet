# Liquor taste scoring (deterministic)

## Inputs

- `userInput`: raw user message (normalized inside extractors).
- Optional **Stage 2**: pre-merged `effectivePos` / `effectiveNeg` maps from `preference-profile.ts` instead of only `extractWeightsFromUserText(userInput)`.

## Vocabulary

- Canonical **families** live in [`taste-vocabulary.ts`](./taste-vocabulary.ts) (`tasteTags`).
- Each family maps to concrete **liquor tags** via `tasteFamilyToLiquorTags` (subset of strings used on `liquors[].tags`).

## Steps

1. **Positive families:** substring match of any keyword in `tasteTags[family]` against the lowercased input → family is active.
2. **Negative families:** triggers like `not`, `don't`, `avoid`, `too`, `nothing` before a taste word → penalize that family’s liquor tags.
3. **Family → tag weights:** each active positive family adds `+1` to each mapped liquor tag; negatives add `+1.2` to a separate negative map (slightly stronger penalty).
4. **Contradiction merge:** for each liquor tag key `t`, if `neg[t] >= pos[t]`, only the net negative `(neg - pos)` is kept; else net positive `(pos - neg)`.
5. **Per-bottle score:** sum of `effectivePos[t]` for each tag `t` on the bottle, minus sum of `effectiveNeg[t]` for tags on the bottle, plus small boosts:
   - **Name hint:** user mentions `gin` and bottle name contains `gin` → `+0.45` (once per matched token).
   - **Type hint:** user text maps to `LiqourType` via `liquorTypeKeywords` and bottle matches type → `+0.35`.
6. **Sort:** descending score, tie-breaker `liquor.name` ascending.
7. **Threshold:** if `topScore < MIN_TOP_SCORE` (0.35 in code), return **no** recommendations (empty list).

## Outputs

- `RankedLiquor[]`: each entry includes `matchedSignals` (liquor tags that received positive weight) for UI / narration.

Ranking is **never** produced by an LLM; Stages 2–3 only change how `effectivePos` / `effectiveNeg` are built or how text is phrased.
