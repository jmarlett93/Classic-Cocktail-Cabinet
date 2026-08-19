# Domain catalogs and integrity

Slice of the end state: type-level weighted bottles (migrated), ~20 drinks with joins, staples, shared flavor vocabulary, and load/test-time integrity — the catalog bundle other PRs consume.

Area: backend · Internal ID: `PR-two-modal-discovery-001`

## Overview facets

- [Bottle (type-level)](../architecture-overview.md#bottle-type-level)
- [Drink (recipe)](../architecture-overview.md#drink-recipe)
- [Staple (Dataset 3)](../architecture-overview.md#staple-dataset-3)
- [Flavor vocabulary](../architecture-overview.md#flavor-vocabulary)
- [Catalog integrity](../architecture-overview.md#catalog-integrity)

## Nominal flow

```text
load vocabulary + bottles + staples + drinks
→ validate unique ids, flavor keys ⊆ vocab, recipe joins resolve
→ ≥1 unlock bottle per drink; collectables ⊆ weighted bottles
→ export catalog bundle for domain services and UI (typed imports; Angular asset wiring in PR-05)
```

## Docs owned

`ARCHITECTURE.md` entity catalog sections only (bottles, recipes, staples, vocabulary).
