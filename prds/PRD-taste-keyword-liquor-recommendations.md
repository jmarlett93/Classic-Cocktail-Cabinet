# PRD: Taste-keyword chat → correct ranked liquor recommendations

**Status:** Draft  
**Owner:** Product / Engineering  
**Aligned doc:** [PRODUCT.md](../PRODUCT.md) (Direction B — liquor discovery assistant)  
**Scope:** Single value proposition only; no recipes, cabinet, or accounts.

---

## Value proposition (one sentence)

**As a curious but clueless user, I can chat using plain taste language (for example, “I like bright and dry”) and receive a rank-ordered list of liquors from the in-app catalog where the order is valid, explainable, and consistent with those taste signals.**

---

## Problem

Novice drinkers do not think in bottle names or categories. They think in words like *bright*, *dry*, *bitter*, *smooth*. The app already exposes a chat experience and a static `liquors` catalog with flavor `tags`, but ranking quality and “correctness” are not guaranteed: pipeline quirks (for example, NLP operating on synthetic prompt text rather than the user’s words) and duplicated taste vocabularies can produce lists that feel arbitrary or misaligned with the user’s stated preferences.

---

## Goals

| ID | Goal |
|----|------|
| G1 | User can submit **free-text messages** dominated by **taste / mouthfeel keywords** and receive a **ranked** response (best match first). |
| G2 | Rank order is **correct** relative to an explicit, documented scoring model tied to **catalog data** (`Liqour.tags`, `LiqourType`, and shared taste vocabulary). |
| G3 | The UI presents **at least the top N** recommendations (N ≥ 5 unless the catalog yields fewer) with **stable ordering** for the same input (deterministic). |
| G4 | Each bot turn that includes recommendations gives a **short “why ordered this way”** note grounded in overlapping tags or dimensions (no fabricated bottles). |

## Non-goals

- Recipes, cabinet inventory, ecommerce, auth, backend APIs, or remote LLMs for ranking.
- Medical, legal, or “safe to drive” advice.
- Coverage of every possible English phrasing; focus on **taste-keyword** utterances and a defined **synonym map** for them.

---

## Primary user story

**As a** curious but clueless user,  
**I want to** type taste-oriented phrases in chat (e.g. “I like bright and dry”),  
**So that** I get a **correct, rank-ordered** set of liquor suggestions from the app’s catalog without needing prior bottle knowledge.

### Secondary stories (in scope if trivial)

- User refines in a follow-up message (“more bitter, less sweet”); ranking updates **from the latest message** (multi-turn behavior defined in open questions).

---

## Definitions

| Term | Definition |
|------|------------|
| **Catalog** | The static `liquors` array shipped with the app; recommendations **must** be subset of this set. |
| **Correct rank order** | Order induced by a **single scoring function** documented in engineering notes: higher score = better match to **positive** taste signals and stronger penalty for **negative** or avoided signals when detected. Ties broken by deterministic secondary keys (e.g. name). |
| **Valid** | Every recommended item exists in the catalog; no duplicates; scores computed from declared tags/vocab only. |

---

## Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR1 | Chat accepts arbitrary text; taste-style inputs produce a bot message containing an **ordered list** of `Liqour` entries (name + type + relevant tags surfaced in UI). | P0 |
| FR2 | Scoring uses **user utterance** (normalized text), not internal LangChain prompt boilerplate, as the primary signal for taste extraction. | P0 |
| FR3 | Documented **synonym / negation** behavior: e.g. “bright”, “dry”, “not sweet”, “avoid herbal” affect scores predictably. | P0 |
| FR4 | Ranked list length: default **8** candidates returned, ordered; UI may collapse with “show more.” | P1 |
| FR5 | If no item scores above a **minimum threshold**, respond with an honest empty/low-confidence state and a prompt to rephrase (no random bottles). | P1 |
| FR6 | Example phrase **“I like bright and dry”** must rank spirits that materially match *bright* and *dry* in catalog tags **above** clearly sweet-only or heavy-dessert liqueurs in acceptance tests. | P0 |

---

## Acceptance criteria (testable)

1. **AC — Catalog integrity:** For 20 golden inputs (including “I like bright and dry”), every ID in the ranked list exists in `liquors` and appears at most once.
2. **AC — Bright + dry:** For input exactly `I like bright and dry`, the top 3 results each include at least one tag from the **bright** family and one from the **dry** family per the documented synonym→tag mapping (or an explicitly documented equivalent, e.g. citrus+zesty+crisp for “bright”).
3. **AC — Determinism:** Same input twice in a fresh session yields **identical** ordered lists and scores.
4. **AC — Negation:** Input `I want dry but not sweet` does not place liqueurs whose tags are exclusively sweet profile at rank 1 unless no better catalog match exists (document exception).
5. **AC — UX:** User sees rank position or implicit order (top = best); loading state does not reorder results after display.

---

## Success metrics (MVP)

| Metric | Target |
|--------|--------|
| Golden-set pass rate | 100% on AC1–AC3 for the curated golden set before release |
| Qualitative review | 3/3 blind internal reviewers agree top 3 for “bright and dry” feel “on brief” |

---

## Dependencies and constraints

- **Data:** Quality of ranking is bounded by `liquors[].tags`; gaps in tagging are **data bugs**, not model magic. PRD assumes permission to **tag-adjust** catalog entries where golden phrases expose holes.
- **Code:** `LiquorRecommendationAgentChainService`, `FlavorProfileEmbeddings`, `CustomNlpProcessor`, `liquor-chatbot` store/UI; consolidate duplicated `tasteTags` where it affects correctness.
- **Dependencies:** LangChain pieces may remain for orchestration; scoring correctness must not rely on undocumented side effects.

---

## Open questions

1. Should **multi-turn** chat **accumulate** preferences across messages or **only** use the latest user message for ranking? (Recommend: latest-only for MVP clarity.)
2. Minimum score threshold and copy for “no strong match” states.
3. Whether to show **numeric match score** to users (transparency vs. noise).

---

## Out of scope (explicit)

Landing page rewrite, recipe book, cabinet inventory, persistence across browser sessions, paid data providers, and marketing claims beyond “taste-based liquor suggestions from our catalog.”

---

## References

- [PRODUCT.md](../PRODUCT.md) — Direction B, capability gaps  
- [ARCHITECTURE.md](../ARCHITECTURE.md) — entities, recommendation sequence, NLP-input risk  
