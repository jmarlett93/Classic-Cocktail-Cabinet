# Style guide: Angular client vs agentic (LangGraph) code

This document defines **where code lives**, **what patterns each side uses**, and **how they may touch** so LangGraph-style orchestration stays maintainable in the same repo as an Angular SPA.

---

## 1. Two zones, one contract

| Zone | Purpose | Thrives on |
|------|---------|------------|
| **Angular client** | UI, routing, a11y, lifecycle, DI, change detection | `@Injectable`, `inject()`, components, signal stores, Angular Material |
| **Agentic layer** | Multi-step reasoning, optional LLM calls, graph control flow | **Pure functions**, an explicit **state object** (or reducer pattern), **no DI**, no Angular imports |

**Rule of thumb:** If you need `inject()`, `@Component`, or `ChangeDetectionStrategy`, you are in the **Angular zone**. If you need `StateGraph`, `Send`/`interrupt`, or node functions `(state) => Partial<State>`, you are in the **agent zone**.

---

## 2. Folder layout (recommended)

Keep agents **outside** `src/app/` so tree-shaking and mental boundaries stay clear:

```text
src/
  app/                    ← Angular only: UI, shells, thin facades
  lib/                    ← Optional: shared **pure** TS (no Angular), e.g. scoring math
  agents/                 ← LangGraph / LangChain orchestration only
    graphs/               ← Compiled graphs, graph definitions
    nodes/                ← Node implementations (pure where possible)
    state/                ← State types, reducers, initial state factories
    providers/            ← Model providers (WebLLM, fetch-to-Ollama, mock)
    adapters/             ← Boundary glue: NOT Angular; maps DTO ↔ graph I/O
  contracts/              ← Optional: JSON-serializable DTOs shared **as types** only
```

**Do not** put LangGraph graphs under `src/app/core-services/` unless you are willing to treat that subtree as “agent-only” and forbid Angular imports there—a split folder is clearer for reviewers and tooling.

---

## 3. LangGraph / agentic conventions

### State

- One **canonical graph state** type (e.g. `TasteAgentState`) in `src/agents/state/`.
- Nodes return **partial updates** or immutably merged patches; avoid mutating a shared singleton.
- Prefer **serializable** fields (strings, numbers, plain objects, arrays) so you can log, replay, or persist later.

### Nodes

- Implement as **pure functions** when possible: `(state: TasteAgentState) => Promise<Partial<TasteAgentState>>` or sync where appropriate.
- Side effects (HTTP, WebLLM, `localStorage`) live in **dedicated nodes** or behind **interfaces** passed in via **factory arguments**, not Angular DI:

  ```ts
  // Good: explicit deps for tests
  export function createNarrationNode(deps: { completeChat: (messages: ChatMessageDto[]) => Promise<string> }) {
    return async (state: TasteAgentState): Promise<Partial<TasteAgentState>> => { /* ... */ };
  }
  ```

- **No** `@Injectable`, **no** `inject()`, **no** imports from `@angular/*`.

### Orchestration

- **LangGraph** owns branching, cycles, memory checkpoints, and “which node next.”
- Angular **does not** subscribe to internal graph events directly; it awaits a **single entry** API (see §5).

### Browser vs Node LangGraph (`@langchain/langgraph/web`)

- In **Angular / esbuild / browser** builds, import graph primitives from **`@langchain/langgraph/web`**, not the package root `@langchain/langgraph`.
- The root entry initializes Node-only tracing hooks (`node:async_hooks`); the **`/web`** export is the supported **browser-safe** graph surface (`StateGraph`, `Annotation`, `START`, `END`, checkpoint helpers, etc.) and aligns with **in-browser** models such as **WebLLM** (same runtime: WebGPU / WASM, no Node).
- Server-side or CLI tooling can keep using the default entry; **SPA code under `src/agents/` should default to `/web`.**

### Model providers (WebLLM, Ollama, etc.)

- Place under `src/agents/providers/`.
- Each provider exposes a **narrow interface** (e.g. `ChatCompletionPort`) implemented without Angular.
- Swapping models = swapping construction at graph compile time or passing a provider into the graph factory—still **not** DI in the Angular sense.

---

## 4. Angular client conventions

### Responsibilities

- Render chat, forms, loading, errors.
- Own **user session UX** (signals, stores, router).
- Call **one** facade method to run the agent (e.g. `tasteAgentFacade.runTurn(input)`).

### What Angular must not do

- **Must not** import `src/agents/**` from templates or from deep component trees in a scattered way—only from a **small set of facades** (ideally one per feature).
- **Must not** put LangGraph `StateGraph` construction inside a component constructor—graph build belongs in `src/agents/` and runs behind the facade.

### Thin facades (the only allowed bridge)

A **facade** is an Angular `@Injectable` that:

1. Accepts UI-friendly arguments (strings, DTOs).
2. Maps them to **agent input state** (plain objects).
3. Invokes `invokeGraph(...)` (or similar) from `src/agents/`.
4. Maps **agent output state** back to UI models / signals.

The facade may import **pure** helpers from `src/lib/` that the graph also uses (e.g. normalization). It **must not** pull graph nodes into DI as “services.”

---

## 5. Crossing the boundary (allowed vs forbidden)

| Allowed | Forbidden |
|---------|-----------|
| Facade calls a **single exported function** `runTasteAgent(input: AgentInput): Promise<AgentOutput>` from `src/agents/` | Agent code imports `LiquorChatbotStore` or any `providedIn: 'root'` Angular service |
| Shared **types** in `src/contracts/` or re-exported from `src/agents/state/` consumed by Angular for typing only | Shared **Angular services** imported from `src/agents/` |
| Shared **pure functions** in `src/lib/` imported by both agents and facades | LangGraph nodes that call `inject(HttpClient)` |
| Agent receives **callbacks / ports** via factory parameters for IO | Component directly mutates global graph singletons |

---

## 6. Data and errors

- **DTOs** at the boundary should be **plain interfaces** / classes with no Angular metadata.
- Surface **agent failures** as discriminated unions (`{ ok: true, output } | { ok: false, code, message }`) so the facade can map to user-visible copy without leaking stack traces from the graph.

---

## 7. Testing

| Layer | How |
|-------|-----|
| **Agents** | Unit-test nodes as pure functions with fixture state; integration-test graph with mocked `ChatCompletionPort`. No `TestBed`. |
| **Angular** | `TestBed` + component/store tests; mock the **facade** only, not individual nodes. |

---

## 8. Naming

- Prefix or namespace graph-related types: `TasteAgentState`, `runTasteAgent`, `buildTasteGraph`.
- Avoid generic names like `AgentService` in Angular if it actually runs LangGraph—prefer `TasteAgentFacade` or `LangGraphTasteRunner` so code search shows the boundary.

---

## 9. Summary one-liners

- **Angular** = DI, components, signals, **one facade** per agentic feature.
- **LangGraph** = **state + pure nodes + providers**, **no Angular**, **no DI**; orchestration and optional LLMs live here.
- **Shared** = **pure TS** and **types** only; never Angular services inside `src/agents/`.

---

## Related docs

- [ARCHITECTURE.md](../ARCHITECTURE.md) — system context and LangGraph target section  
- [PRODUCT.md](../PRODUCT.md) — product direction  
