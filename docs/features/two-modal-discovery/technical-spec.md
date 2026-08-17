# Technical spec: Two-modal discovery

**Status:** clarification-required (proposed technical defaults await human nod)  
**Feature:** Two-modal discovery  
**Spec version:** 2 (successor of v1; remediates Ponytail pre-build)  
**Actors:** Anonymous browser visitor (home bartender stocking up; curious drinker; cabinet optimizer). No accounts.

## In scope

- Two discovery modes and crossing between them.
- Type-level bottle catalog: existing liquors migrated into weighted records; collection picker uses that catalog only.
- Drink catalog (~20 authored drinks) with bottle/staple joins, instructions, authored prep flavor — unlock credibility set.
- Dataset 3 staples catalog (non-bottle ingredients).
- Shared flavor vocabulary and synonym → weight mapping.
- Composed drink flavor = inherited bottle/staple contribution + authored prep/mixology/garnish.
- Session-persisted bottle **collection** (visit only).
- Weighted unlock: next bottles maximizing newly completable drinks with newly completable count, seed-as-lead, and user flavor factors (classic-ness deferred).
- On bottle detail, completeness and unlock share effective have-set `owned ∪ {focus}`.
- Possible vs likely recommendations for drinks and bottles given a bottle or flavor.
- Flavor entry shows labeled drinks and bottles, drinks first.
- Bottle mode lists complete drinks plus light one-bottle-away.
- Cameo dashes/rinses count as required shelf bottles.
- Honest empty states.
- Remove Taste-chat chrome and WebLLM boot preload.

## Out of scope

- Chat agent / embeddings-as-product / remote LLMs / WebLLM narration as the experience.
- Accounts, sync, commerce, store locators.
- Substitutions engine; k-bottle optimal kits.
- Cross-visit persistence; branded SKU unlock targets.
- Opaque mixed taste+unlock single score.
- Generated recipes or bottles.
- Authored classic-ness / classicBonus field for MVP.

## Triggers and surfaces

| Trigger | Outcome |
|---------|---------|
| Land on entry | Choose by-the-drink or by-the-bottle; flavor may feed either |
| Enter flavor with no mode | Labeled drinks group then bottles group; likely headline, possible as show-more |
| Open a drink | Composed flavor, bottle list with bottle flavors, path to unlock/missing bottles, nearby drinks |
| Open a bottle | Bottle flavors, possible/likely drinks (complete + one-away), unlock block, nearby bottles — completeness and unlock use owned ∪ focus |
| Edit collection | Add/remove owned bottle types from migrated weighted catalog for this visit; completeness and unlock update |
| No matches | Explicit empty copy; no fabricated entities |

## Behaviors by named requirement

### Models

**Type-level bottle catalog** (`MODEL-bottle-catalog`) — Existing liquor types migrated to weighted shelf-bottle records; picker and joins use those ids only; no tag-soup dual model.

**Drink catalog with joins** (`MODEL-drink-catalog`) — About twenty authored recipes naming required bottles and staples, description, instructions, authored flavor + compose rule. Derived inherited/composed not persisted. No classic-ness field for MVP.

**Non-bottle staples catalog** (`MODEL-staples-catalog`) — Citrus, syrups, garnishes, egg, etc. Assumed available for completeness; never unlock buy targets.

**Shared flavor vocabulary** (`MODEL-flavor-vocabulary`) — Frozen dimensions + synonym mapper so bottles, drinks, and flavor queries share one space.

### Contracts

**Catalog integrity** (`CONTRACT-catalog-integrity`) — Referential checks (ids, flavor keys, joins, collectable ⊆ weighted bottles) before discovery trusts data.

**Drink flavor composition** (`CONTRACT-flavor-compose`) — Deterministic inherited + composed views; bottles’ own profiles untouched; split available on demand.

**Drink completeness** (`CONTRACT-drink-completeness`) — Given effective have-set: complete, one-bottle-away, or further incomplete; cameos required; staples free; on bottle detail have-set = owned ∪ {focus}.

**Weighted unlock** (`CONTRACT-weighted-unlock`) — Rank next bottles with counts, names, and weighted score from count + seed-as-lead + flavor (classic-ness deferred); labeled separate from flavor picks; same have-set as completeness on bottle detail.

**Possible and likely ranking** (`CONTRACT-possible-likely`) — Membership/low-bar possible; short ranked likely; never invent rows or swap unlock for taste.

### State

**Session collection** (`STATE-session-collection`) — Owned bottle type ids (catalog-only) + flavor/seed for the browser session; cleared across visits; exposes focus for ∪ consumers.

**Discovery navigation** (`STATE-discovery-navigation`) — Mode/detail navigation preserves session cabinet and flavor within the visit.

### Frontend behaviors

**Two-mode entry** (`BEHAVIOR-two-mode-entry`) — Primary path is drink or bottle discovery, not taste chat.

**Retire taste-chat chrome** (`BEHAVIOR-retire-chat`) — Nav and landing describe cabinet + recipes + two ways in only.

**By-the-drink discovery** (`BEHAVIOR-by-the-drink`) — Ranked drinks, why it tastes that way, bottles needed, path across.

**By-the-bottle discovery** (`BEHAVIOR-by-the-bottle`) — Flavors, drinks, unlock with N and names, nearby bottles; focus∪owned consistent on screen.

**Flavor dual-entry** (`BEHAVIOR-flavor-entry`) — Labeled groups, drinks first, likely then possible.

**Mode crossing** (`BEHAVIOR-mode-crossing`) — Natural next beats without dead-end lists.

**Honest empty states** (`BEHAVIOR-empty-states`) — Explicit no-match messaging.

**Collection UI** (`BEHAVIOR-collection-ui`) — Light “I have this” over migrated weighted catalog only.

**Flavor accessibility** (`BEHAVIOR-flavor-a11y`) — Intensities understandable without color alone; no lab-truth claim.

### Infrastructure

**Static catalog assets** (`INFRA-catalog-assets`) — Catalogs ship as static SPA assets (no API), including migrated bottles.

**Remove WebLLM boot preload** (`INFRA-remove-webllm-boot`) — Cold start does not load chat model CDN.

## Empty, loading, and failure cases

| Case | Expected |
|------|----------|
| Flavor matches nothing | Empty state; no invented bottles/drinks |
| Unlock has no improving bottle | Honest empty or only weaker options withheld per honesty rules |
| Catalog integrity fail in tests | Fail closed with concrete violations |
| Collection empty on bottle detail | Completeness and unlock both use `{focus}` as the effective have-set (owned ∪ focus) |
| Session ends | Collection and flavor cleared |
| Legacy chat URL | Not a primary path; chrome must not promote it |
| Non-catalog liquor id | Rejected — not collection-eligible |

## Acceptance (product-observable)

1. First productive path offers drink-first and bottle-first; primary CTA is not “open taste chat.”
2. Drink detail shows required bottles and composed flavor; inspect shows from-bottles vs from-how-made.
3. From a collection/seed bottle, unlock shows additional drink count and names; labeled apart from flavor picks; score omits classic-ness.
4. Flavor entry shows labeled drinks then bottles; likely headline with possible as show-more.
5. Bottle mode shows complete drinks plus one-bottle-away; same screen uses owned ∪ focus for completeness and unlock.
6. Forced empty inputs never fabricate catalog rows.
7. Collection edits in a visit change completeness/unlock; picker only offers migrated weighted bottle ids; new browser session starts empty.
8. App boots without WebLLM preload.

## Locked product decisions

Remove taste-chat chrome; bottle collection; session persistence; type-level catalogs; one-bottle-away; flavor both drinks-first; weighted unlock; cameos required; Dataset 3 required; ~20 drinks for unlock credibility; defer classic-ness (`DEC-unlock-classic-deferred`); migrate liquors into weighted bottle catalog (`DEC-collection-universe`); focus∪owned on bottle detail.

## Proposed technical defaults (human checkpoint)

Compose rule v1 and flavor space v1 from Dataset design; possible/likely gates (0.25 / top 5 / 0.35); unlock score weights without classic-ness + top 5 + name tie-break after seed-as-lead; nearby by flavor distance; Low/Medium/High text flavor levels; `sessionStorage` store sync; `data/*.json` catalog layout.

Still open without blocking math tests: substitutions honesty copy (brief Q12).

## Related

- [Systems summary](./README.md)
- [Architecture overview](./architecture-overview.md)
- Product brief: `prds/PRODUCT-BRIEF-two-modal-discovery.md`
- Candidate data contract: `docs/DATASET-DESIGN.md`
