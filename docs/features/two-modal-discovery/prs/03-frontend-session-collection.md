# Session collection cabinet

Slice of the end state: visit-scoped owned bottles, focus, and flavor query, plus a picker that only offers migrated weighted catalog ids.

Area: frontend · Internal ID: `PR-two-modal-discovery-003`

## Overview facets

- [Session collection](../architecture-overview.md#session-collection)
- [Session collection / navigation](../architecture-overview.md#session-collection--navigation)
- [Session collection lifecycle](../architecture-overview.md#session-collection-lifecycle)

## Nominal flow

```text
user opens /cabinet
→ picker lists loadCatalogBundle().bottles ids only
→ user toggles "I have this" on a catalog bottle id
→ CabinetStore validates id ⊆ bottle catalog
→ persist ownedBottleIds (+ focus, flavor) to sessionStorage
→ expose effectiveHaveSet (owned ∪ focus) for consumers
→ tab refresh restores within visit; new browser session starts empty
```

## Route

Inspect collection UI at `/cabinet` before PR-04 wires discovery screens.

## Docs owned

`ARCHITECTURE.md` CabinetStore / session-persistence note only.
