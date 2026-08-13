# Product brief: Two-modal discovery (by the drink / by the bottle)

**Status:** Proposed  
**Decision:** Direction B (taste-keyword liquor chatbot as the product) is **abandoned**.  
**Replaces:** [PRD-taste-keyword-liquor-recommendations.md](./PRD-taste-keyword-liquor-recommendations.md)  
**Aligns:** [PRODUCT.md](../PRODUCT.md) Direction A — recipe-led classic cabinet, narrowed to a **basic two-path discovery system**.  
**This document is product-only.** It does not specify implementation, APIs, or code.

---

## 1. Elevator pitch

Classic Cocktail Cabinet helps a home bartender answer two questions without a conversation bot:

1. **By the drink** — “What drinks fit this taste, and what bottles do they ask for?”
2. **By the bottle** — “What does this bottle open up, and what should I buy next so I can make the most drinks?”

Both paths are the same product. They share two catalogs (bottles and recipes) and a shared flavor language. A bottle is not a dead-end SKU; a drink is not an isolated card. Each is a way into the other.

---

## 2. Why this, and why not Direction B

Direction B optimized for **chat + ranked bottles from taste words**. That is a liquor-discovery assistant. It does not fulfill the product name, the landing promise (cabinet + recipes from what you have), or the “what should I buy so I can make more” job.

This brief commits to a **structured discovery product**, not a chatbot:

| Abandoned | Chosen |
|-----------|--------|
| Free-text chat as the core loop | Two explicit modes: drink-first and bottle-first |
| Ranked bottles as the main outcome | Drinks and bottles as equal, linked outcomes |
| Taste matching as the only intelligence | Taste matching **plus** mechanical recipe coverage (“unlock”) |
| Recipes out of scope | Recipes are a first-class catalog |

Chat, remote LLMs, and “describe a vibe → shortlist of SKUs” are **out of scope** for this product. Taste still matters; it is expressed as **flavor weights on data**, not as a conversational agent.

---

## 3. Who it is for

| Persona | State of mind | Job this product does |
|---------|---------------|------------------------|
| Home bartender stocking up | Shopping or planning, mildly time-pressed | “I have / I’m considering this bottle. What else should I get so I can actually make things?” |
| Curious drinker | Exploring, not expert | “I like *this* kind of taste. Show me drinks and the bottles behind them.” |
| Cabinet optimizer | Practical, one-more-bottle thinking | “Given this starting bottle, which next bottle unlocks the largest set of drinks?” |

They should feel **relieved** (a short, defensible list), **seen** (taste shows up on both drinks and bottles), and **slightly elevated** (classic-cabinet confidence, not a gimmick). Voice stays a warm expert: assured, sensorial, hospitable. No homework, no neon cocktail cliché, no chatbot chrome.

---

## 4. Product principle

**One starting point, two kinds of answer, always a way across.**

The user starts from a **drink**, a **bottle**, or a **flavor**. The system never returns a dead list. Every drink names its bottles. Every bottle names drinks it participates in and the next bottles that would complete more drinks. Flavor is the shared language that lets someone enter without knowing names.

Primary user action: **leave with a small set of drinks they might make and/or a small set of bottles worth buying**, with a plain reason for each.

---

## 5. The two discovery modes

These are **modes**, not separate apps. Same catalogs, same flavor space, different emphasis and first question.

### 5.1 By the drink

**Entry:** a drink name, a flavor, or “drinks like this.”

**The user is trying to:** pick something to make (or to shop toward), understand how it will taste, and see which bottles it depends on.

**What they get:**

- A drink (or a short ranked list of drinks) with a **drink-level flavor profile**.
- That profile is not only “the sum of its bottles.” It includes **preparation, mixology, and garnish** (see §7).
- The **bottle list** for that drink, each bottle showing its own flavor weights.
- Nearby drinks: similar drink-level flavor, or drinks that share a key bottle.
- If they do not own the full bottle set: a jump into the bottle path for “what would complete this” / “what else this bottle unlocks.”

**Success for this mode:** the user can explain, in one glance, *why this drink tastes the way it does* and *what they would need to make it*.

### 5.2 By the bottle

**Entry:** a bottle name, a flavor, or “I have / I’m buying this.”

**The user is trying to:** understand the bottle as a cabinet citizen — what it tastes like, what drinks it appears in, and what to buy next.

**What they get:**

- The bottle’s **flavor weights**.
- **Possible drinks:** recipes that include this bottle (completable only if other required bottles are treated as available, or clearly marked as incomplete).
- **Likely drinks:** a tighter set — classics or strong flavor-fit drinks where this bottle plays a meaningful role (base or defining modifier, not a dash-of-bitters cameo unless bitters *are* the point).
- **Unlock recommendations:** further bottles that, if purchased, complete the **largest additional set of drinks** given this starting bottle (see §8).
- Nearby bottles: similar flavor weights, or bottles that frequently co-occur in recipes with this one.

**Success for this mode:** the user can say “if I get this, I can make *these*, and the smartest next bottle is *that* because it unlocks *N* more drinks.”

### 5.3 Crossing the modes

| Starting from | Natural next beat |
|---------------|-------------------|
| A drink | Its bottles; missing-bottle unlock; similar drinks |
| A bottle | Drinks it enables; next bottles to buy; similar bottles |
| A flavor | Candidate drinks **and** candidate bottles, labeled as such, then into either mode |

Flavor is an **entry key**, not a third mode. It must not dump an unlabelled mix of drinks and bottles; the user should see two labeled groups (drinks vs bottles) or be asked which path they mean. Default if unspecified: **show both**, drinks first when the flavor feels like a “what to sip tonight” cue, bottles first when it feels like “what to put on the shelf” — exact default is an open question.

---

## 6. Data: two catalogs, maybe a third

The product is **data-shaped**. Discovery quality is bounded by catalog quality. Intelligence is ranking and counting over explicit records, not generating bottles or recipes.

### 6.1 Dataset 1 — Bottles (liquors)

Each **bottle** is a catalog liquor the user might buy or already own.

Minimum product fields (conceptual, not schema):

- Identity: name, optional brand, type/family (spirit, whiskey, amaro, liqueur, bitters, …).
- **Description:** short summary or context (authored free text).
- **Flavor weights:** a map of flavor dimensions → intensity (not a bag of unweighted tags).
- Enough identity to join to recipes (stable id / name).

Flavor weights on a bottle describe **the liquid in the bottle**, not how it behaves in a particular drink.

### 6.2 Dataset 2 — Drinks (recipes)

Each **drink** is a recipe the user might make.

Minimum product fields:

- Identity: name, optional classic aliases / variants.
- **Description:** short summary or context (authored free text).
- **Required bottles:** which catalog bottles go into it (the join that makes unlock math possible).
- **Instructions:** free-text how-to.
- **Drink-level flavor weights:** how the finished drink tastes.
- Preparation / mixology / garnish notes at whatever fidelity is needed to **justify** the drink-level flavors (shaken sour vs stirred spirit-forward vs built highball; egg white; lengthening; twist vs cherry, etc.).
- Optional: similar drinks, variants — useful, not required for MVP ranking.

Drink-level flavor is **not** a copy of its bottles. It is composed (see §7).

### 6.3 Dataset 3 (candidate) — Non-bottle ingredients

Recipes are not only liquors. Citrus, syrups, soda, egg, salt, and garnishes change taste and completeness.

This third set is **recommended if** we want honest “can I make this?” answers. Without it, either:

- every lemon and simple syrup is pretended to be a “bottle” (pollutes unlock and shopping), or
- non-bottle ingredients are ignored (unlock over-claims “you can make a Daiquiri” from rum alone).

**Product stance for a *basic* system:** treat **shelf bottles** (Dataset 1) as the scarce, buy-decision objects. Treat citrus, syrups, soda, ice, and common garnishes as **kitchen staples** — assumed available unless we later model a pantry. That keeps MVP to **two catalogs** plus a **shared flavor vocabulary** (a taxonomy, not a third browseable catalog).

Promote Dataset 3 to a real catalog when:

- staple vs scarce is causing bad advice (e.g. orgeat, Falernum, or a rare garnish treated as “you already have this”), or
- garnish/prep flavor cannot be authored cleanly on the drink without ingredient rows.

Until then, rare modifiers that *are* bottles (Chartreuse, Campari, orange bitters if we sell them as bottles) live in Dataset 1.

### 6.4 Shared flavor vocabulary (not a third catalog)

Bottles and drinks must speak the **same flavor dimensions** (e.g. bitter, sweet, dry, bright, herbal, smoky, citrus, rich). Weights are intensities on that shared list. Synonyms (“zesty” → bright/citrus) belong to the vocabulary, not to one-off tags per record.

If the two catalogs use incompatible tag soups, neither mode can recommend “given a flavor.”

### 6.5 What is *not* a dataset in this brief

- User accounts, cloud inventory, or purchase history.
- A live liquor-store catalog or prices.
- Generated recipes or generated bottles.
- Chat transcripts as source of truth.

A **session cabinet** (the bottles the user says they have or are considering) is **state**, not a third catalog. For MVP it can be as small as “the one bottle I started from.”

---

## 7. How a drink gets its flavor

A drink’s flavor weights come from **two layers**. Both are first-class. Neither is optional in the product story.

### 7.1 Inherited from bottles

The liquors in the drink contribute their flavor weights into the drink.

Product intent:

- A Negroni should taste of gin, Campari, and sweet vermouth in a recognizable way.
- A drink that is mostly soda and a small measure of amaro should not taste like a neat pour of that amaro.
- Cameo ingredients (a dash of bitters, a rinse) should not dominate inheritance unless the drink is *defined* by that cameo.

The exact mix rule (volume-weighted, role-weighted base vs modifier vs accent, caps so three bitter bottles do not explode “bitter”) is an **open question**. The product requirement is: **inheritance is explainable** — the UI can say this drink is herbal *because* of these bottles, in roughly this balance.

### 7.2 Authored from preparation, mixology, and garnish

Technique and finishing change the drink independently of the bottles:

| Source | What it does to flavor (examples) |
|--------|-----------------------------------|
| Preparation | Shaking with citrus → brighter, colder, more dilute; stirring spirit-forward → richer, more alcoholic; blending / crushed ice → softer, longer. |
| Mixology | Egg white → texture and muted edges; lengthening with soda or tonic → drier/lighter; sugar or liqueur balance → sweeter; salt/saline → amplified. |
| Garnish | Citrus oils → bright/aromatic; cherry or liqueur float → sweeter/richer; herb slap → herbal/green; smoke or expressed peel → a distinct top note. |

These weights are **authored on the drink** (or derived from structured prep/garnish fields). They are not inferred by a model at runtime in this product.

### 7.3 Composed drink profile

**Finished drink flavor = inherited bottle contribution + authored prep/mixology/garnish contribution.**

Users should be able to see a simple split when they care: “from the bottles” vs “from how it’s made.” Default view can be the composed profile only; the split is for trust.

Bottles keep their own profiles untouched. A bottle of rye does not become “sour” because it appears in a whiskey sour; the **drink** becomes sour.

---

## 8. Mechanical pathway: unlock (what to buy next)

This is the cabinet-optimizer loop. It is **counting and coverage**, not taste poetry. Taste can *rank* which unlocked drinks are more appealing; it must not invent coverage.

### 8.1 Given a single bottle

**Assume:** the user has (or will have) bottle *B*, and kitchen staples as defined in §6.3. They do not yet have the rest of the shelf.

**Ask:** which additional catalog bottle *X* maximizes the number of drinks that become **complete** (all required shelf bottles present) if the user also had *X*?

Output:

- Top next bottles, each with **how many additional drinks** they unlock, and the **names of those drinks**.
- Optionally a second line: drinks that would still be one more bottle away after buying *X* (stretch, not the headline).

“Largest combination of drinks” means **largest count of newly completable recipes** in the catalog. Not revenue, not rarity, not “most interesting” unless we later add a quality weight (open question).

### 8.2 Why “given a single bottle” is the basic version

A full cabinet (many owned bottles) is the same math with a larger “already have” set. MVP can run unlock from **one seed bottle**. Expanding to “I have these three” is the same product, more state.

### 8.3 Honesty rules

- Do not count a drink as unlocked if a required **shelf bottle** is still missing.
- Do not treat staples as unlock targets.
- Do not recommend a bottle that unlocks zero additional drinks when better options exist.
- If several bottles unlock the same count, break ties in a stable, explainable way (e.g. more drinks where *B* is a lead ingredient, then classic-ness, then name). Tie-break details are an open question.
- Unlock lists are **candidates to buy**, not a shopping cart or affiliate grid.

### 8.4 Relationship to taste

Unlock answers “what completes the most drinks?”  
Flavor recommendations answer “what fits this taste?”

A basic product **shows both**, labeled:

- **Most unlocking** — mechanical.
- **Also fits this flavor** — among unlocking bottles, or among drinks, those closest to the user’s flavor or to bottle *B*’s flavor.

Do not silently mix the two scores into one mysterious rank in MVP. Mixed rank is an open question for later.

---

## 9. Recommendations: given a bottle *or* a flavor

This is the other intelligence loop: **possible** vs **likely** candidates. It applies in both modes.

### 9.1 Given a bottle

| Kind | Meaning |
|------|---------|
| Possible drinks | Recipes that include this bottle. |
| Likely drinks | Possible drinks where the bottle is structurally important and/or the drink’s composed flavor sits near the bottle’s flavor (a Campari drink should feel like Campari belongs). |
| Possible bottles | Bottles that co-occur in recipes with this one, or sit nearby in flavor space. |
| Likely bottles | Unlock leaders (§8) and/or close flavor neighbors that a drinker of *B* would recognize as “in the same family.” |

### 9.2 Given a flavor

A flavor may be one dimension (“bitter”) or a small set (“bright and dry”).

| Kind | Meaning |
|------|---------|
| Possible drinks | Drinks whose composed flavor has material weight on the requested dimensions. |
| Likely drinks | Highest alignment; not merely “has a bit of citrus somewhere.” |
| Possible bottles | Bottles with material weight on those dimensions. |
| Likely bottles | Strongest alignment; useful as *buy* or *start here* suggestions, then hand off to bottle mode (drinks + unlock). |

**Possible** = membership / above a low bar (honest recall).  
**Likely** = short, ranked, decisive (the hospitable expert’s picks).

The UI should prefer **likely** as the headline and keep **possible** available as “show more,” so the product feels like guidance rather than a dump of the catalog.

### 9.3 What must never happen

- Recommend a drink or bottle that is not in the catalogs.
- Attribute a flavor the records do not support.
- Pretend a mechanical unlock is a taste match, or the reverse.
- Use chat paraphrasing as the source of ranks.

---

## 10. Basic product surface (scope of “basic”)

Not a UX spec. Enough shape that the two modes are a product, not a pile of queries.

**Entry:** one clear choice — discover by drink or by bottle — plus flavor as a filter/entry that can feed either.

**Results:** a short ranked list with the answer first (drink or bottle), flavor readable at a glance, and one obvious next step (see bottles / see drinks / see what to buy next).

**Detail:** one drink or one bottle at a time; composed flavor; inheritance vs prep only if the user looks; lists of linked entities; unlock block on bottle detail.

**Cabinet:** MVP may be “the bottle on this page” or a light “I have this” toggle. Full inventory management is later.

**Not in the basic surface:** chatbot, multi-turn preference memory as the product, accounts, commerce, social, user-generated recipes.

Landing copy must match this: cabinet + recipes + two ways in. No promise of a liquor-only chat.

---

## 11. In scope vs out of scope

### In scope (this brief)

- Two discovery modes and crossing between them.
- Two catalogs (bottles with flavor weights; drinks with bottle joins + composed flavor).
- Shared flavor vocabulary and weighted flavors (not unweighted tag bags).
- Drink flavor from **inheritance + authored prep/mixology/garnish**.
- Unlock: given one bottle, next bottles that complete the most drinks.
- Recommendations given a bottle or a flavor, split into possible vs likely, drinks vs bottles.
- Honest empty states when nothing matches.

### Out of scope (until a later brief)

- Direction B chat agent, embeddings-as-product, remote LLMs, WebLLM narration as the experience.
- Accounts, sync, paid catalogs, store locators, checkout.
- Full pantry modeling, ABV/legal/health advice, “safe to drive.”
- User-authored recipes as the catalog of record.
- Substitutions engine (bourbon for rye, etc.), except as a later adjunct to unlock.
- Multi-bottle shopping lists optimized as a set cover beyond “best next one bottle” (k-bottle optimal kits are later).

---

## 12. Success (how we know this is working)

North-star: **time to a defensible next action** — a drink they would make, or a bottle they would buy, with a reason that matches the data.

Supporting checks (product, not analytics instrumentation):

- From a seed bottle, unlock names real drinks that become complete if that next bottle is added.
- From a flavor, likely drinks and likely bottles are ones a hospitable bartender would defend using the recorded weights.
- From a drink, the user can see bottles required and that the drink’s flavor is not a raw dump of those bottles.
- Landing and navigation describe these two paths only; no leftover “liquor chatbot” promise.

---

## 13. Open questions

Unresolved on purpose. Implementers and later briefs should not invent silent answers.

1. **Flavor composition rule.** How do inherited bottle weights combine (volume, role, capped sum, max)? How are authored prep/garnish weights added — overlay, separate channels, or a documented blend? What is shown to the user by default?

2. **Weight scale and vocabulary size.** Bounded 0–1? Discrete low/med/high? How many dimensions in v1, and who owns the canonical list? Do drinks and bottles share every dimension, or do some (e.g. “silky”) exist only at drink level?

3. **Staples vs Dataset 3.** Is the “staples are free” rule acceptable for MVP, or do we need a third catalog immediately (citrus, syrups, garnishes, egg)? Which items are staples vs shelf bottles (orange bitters, orgeat, Falernum, maraschino cherries)?

4. **Possible vs likely thresholds.** What is “material” weight for possible? What ranking makes likely feel decisive rather than arbitrary? Do we show numeric scores to users?

5. **Unlock objective.** Pure drink count, or weighted by classic-ness / user flavor / whether the seed bottle is a lead ingredient? If two bottles unlock the same *N*, what is the tie-break? Do we show only the top 1, top 3, or a longer list?

6. **Seed set.** Is MVP strictly one bottle, or a small “I have these” set from the start? Does “I have this drink’s bottles except one” live in drink mode or bottle mode?

7. **Flavor entry default.** When the user starts from a flavor with no mode chosen, do we show drinks first, bottles first, or always both? How do we avoid an undifferentiated heap?

8. **Generic vs branded bottles.** Is “Gin” one catalog row or many SKUs? Does unlock target types (any dry vermouth) or specific brands? How do recipes point at a type vs a bottle?

9. **Incomplete drinks in bottle mode.** Do we list drinks the user *cannot* finish yet (with missing bottles), or only complete ones plus unlock? How aggressive is “you’re one bottle away” on a drink page?

10. **Cameo ingredients.** When does a dash of bitters or a rinse count as a required bottle for unlock? When is it ignored so Chartreuse rinses do not warp shopping advice?

11. **Catalog ambition for “basic.”** How many bottles and how many drinks make the unlock story feel real (too small a recipe book makes every next-bottle answer look fake)? Who writes drink-level authored flavors vs only inheriting from bottles in v1?

12. **Substitutions.** Out of scope for MVP, but does the product copy need to admit “we don’t substitute,” or will users assume rye ≈ bourbon and distrust unlock?

13. **Fate of the existing chat UI.** Product claims drop Direction B. Is the chatbot removed from the app surface in the same effort, or left as a hidden/legacy screen until the two modes ship?

14. **Session memory.** Does a flavor or seed bottle persist as the user crosses modes in one visit? Across visits? No persistence is valid for basic; it should be an explicit choice.

15. **Mix of taste and unlock.** Stay split in the UI forever, or later allow “best next bottle that also fits this flavor”? If later, what is the product rule so it does not become an opaque score?

16. **Variants and similar drinks.** Are they editorial (curated links) or computed from flavor distance? Needed for by-the-drink “nearby,” but the source of “similar” is unset.

17. **Accessibility of flavor.** Flavor will be colorful and sensorial in the brand. How do we present weights so they work without color and without implying a medical or objective tasting-lab truth?

---

## Related documents

- [PRODUCT.md](../PRODUCT.md) — current vs claimed capabilities; this brief is the chosen investment.
- [docs/DATASET-DESIGN.md](../docs/DATASET-DESIGN.md) — classified data contract (canonical flavor space, synonym→weights mapper, bottle/recipe/staple records). Proposed defaults for composition, vocab, and staples.
- [ARCHITECTURE.md](../ARCHITECTURE.md) — systems and entities; update when this brief is accepted (recipe behavior, cabinet/unlock, demote chat).
- [PRD-taste-keyword-liquor-recommendations.md](./PRD-taste-keyword-liquor-recommendations.md) — abandoned Direction B PRD.
