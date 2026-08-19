# Catalog assets and WebLLM boot

Slice of the end state: versioned static catalogs in the SPA deliverable, and cold start without WebLLM CDN preload — local and hosted static builds.

Area: infrastructure · Internal ID: `PR-two-modal-discovery-005`

## Overview facets

- [Static catalog assets](../architecture-overview.md#static-catalog-assets)
- [Boot runtime delta](../architecture-overview.md#boot-runtime-delta)

## Nominal flow

```text
author data/*.json (or equivalent) per PROP-data-json
→ wire Angular assets / imports into local ng serve and production build
→ remove provideAppInitializer WebLLM preload from app config
→ verify: catalogs in dist; boot network has no WebLLM model fetch
```

## Local and hosted config duties

| Duty | Acceptance |
|------|------------|
| Local | `npm start` / `npm run build` / `npm test` load catalogs; no WebLLM boot fetch |
| Hosted | Static `dist` includes catalog assets; same no-preload boot (host platform unknown, non-blocking) |

## Docs owned

`ARCHITECTURE.md` WebLLM boot section and `data/` / file-index layout.
