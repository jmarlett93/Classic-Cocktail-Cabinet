# Two-mode discovery surfaces

Slice of the end state: two-path entry (no taste-chat chrome), by-the-drink / by-the-bottle / flavor results, mode crossing, honest empties, and non-color flavor presentation.

Area: frontend · Internal ID: `PR-two-modal-discovery-004`

## Overview facets

- [Current-to-end discovery context](../architecture-overview.md#current-to-end-discovery-context)
- [Unlock and recommendation sequence](../architecture-overview.md#unlock-and-recommendation-sequence)
- [Session collection lifecycle](../architecture-overview.md#session-collection-lifecycle)

## Nominal flow

```text
landing offers drink-first and bottle-first (flavor feeds either)
→ drink detail: composed flavor + required bottles + cross to bottle/unlock
→ bottle detail: complete / one-away lists + unlock block + labeled flavor neighbors
   (effectiveHaveSet = owned ∪ focus)
→ flavor entry: labeled drinks then bottles; likely then possible
→ crossing keeps session collection/flavor; empties invent nothing
```

## Docs owned

`PRODUCT.md` landing/elevator/chat claims; `ARCHITECTURE.md` routes, critical path, UI surfaces (not entities/scoring/WebLLM).
