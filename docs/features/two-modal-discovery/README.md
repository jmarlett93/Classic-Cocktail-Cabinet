# Two-modal discovery

Classic Cocktail Cabinet becomes a **structured two-path discovery** product: find drinks by taste or name, find bottles by what they unlock, and always cross between the two. Taste chat is retired as the product surface.

## Systems touched

| System | Change |
|--------|--------|
| Angular SPA shell and routes | Drink-first and bottle-first entry; chat chrome removed |
| In-browser catalogs | Migrated weighted type-level bottles, ~20 authored drinks, staples (Dataset 3), shared flavor vocabulary |
| Domain services | Flavor composition, completeness (`owned ∪ {focus}` on bottle detail), possible/likely ranking, weighted unlock (count + seed-as-lead + flavor; classic-ness deferred) |
| Session state | Bottle collection + flavor persisted for the browser visit |
| Boot/runtime | WebLLM preload removed from app startup |
| Static assets | Versioned catalog JSON (or equivalent) in the SPA bundle |

## End state (plain language)

A visitor chooses **by the drink** or **by the bottle**, or enters a **flavor** and sees labeled drink and bottle groups (drinks first). Every drink shows composed flavor and required bottles. Every bottle shows drinks it participates in (complete and one-bottle-away), nearby bottles, and a separate **most unlocking** list. The visit’s **collection** draws only from the migrated weighted bottle catalog and drives completeness and unlock. No chatbot, no invented catalog rows, no silent mix of taste and unlock scores, no classic-ness field until a later brief authors it.

## Review pack

| Document | Purpose |
|----------|---------|
| [Technical spec](./technical-spec.md) | Behaviors, acceptance, failures, named requirements |
| [Architecture overview](./architecture-overview.md) | End-state models, contracts, diagrams |
| [PR sequence](./sequence.md) | Order, dependency DAG, coverage (awaiting-human-review) |
| [01 Domain catalogs and integrity](./prs/01-backend-catalogs-and-integrity.md) | Backend catalog bundle |
| [02 Discovery ranking services](./prs/02-backend-discovery-services.md) | Backend compose / completeness / unlock / rank |
| [03 Session collection cabinet](./prs/03-frontend-session-collection.md) | Frontend session collection |
| [04 Two-mode discovery surfaces](./prs/04-frontend-two-mode-discovery.md) | Frontend two-path UI |
| [05 Catalog assets and WebLLM boot](./prs/05-infrastructure-catalog-assets-and-webllm.md) | Infra static assets + boot |

## Evidence footnote

Planning evidence for run `RUN-20260817-1826-two-modal-discovery` lives under `.universal-flow/runs/20260817-1826-two-modal-discovery/` (gitignored machinery). Requirements pack version 2 remediates Ponytail pre-build.
