# Session collection cabinet

Slice of the end state: visit-scoped owned bottles, focus, and flavor query, plus a picker that only offers migrated weighted catalog ids.

Area: frontend · Internal ID: `PR-two-modal-discovery-003`

## Overview facets

- [Session collection](../architecture-overview.md#session-collection)
- [Session collection / navigation](../architecture-overview.md#session-collection--navigation)
- [Session collection lifecycle](../architecture-overview.md#session-collection-lifecycle)

## Nominal flow

```text
user toggles "I have this" on a catalog bottle id
→ store validates id ⊆ bottle catalog
→ persist ownedBottleIds (+ flavor) to sessionStorage
→ expose owned and focus for owned ∪ focus consumers
→ new browser session starts empty
```

## Docs owned

`ARCHITECTURE.md` CabinetStore / session-persistence note only.
