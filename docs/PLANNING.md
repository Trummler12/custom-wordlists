# Custom Wordlists — Project Planning

> Status: **Ready v4** — reviewed for consistency; all decisions & content questions answered (§0, §6.1, §10). Ready to start M0. Only remaining external input: the broader Reddit topic list must be pasted in for M4 (Reddit blocks automated fetch).
> Repo: `github.com/Trummler12/custom-wordlists` → GitHub Pages at `trummler12.github.io/custom-wordlists`
> Goal: A static, GitHub-Pages-hosted tool where a visitor picks topics/subtopics, tunes how many words they want, and copies a ready-to-paste custom word list for **skribbl.io** (and similar word games).

---

## 0. Decisions locked (v1)

| Area | Decision |
|---|---|
| **Stack** | **Vite + Svelte + TypeScript**, deployed via GitHub Actions. Svelte compiles to very lean JS ("as vanilla as possible" while keeping a real reactive preview). Word data is **fetched at runtime**, so adding words needs **no frontend-code build** — only a regenerated `data/index.json` (via `build-index`) plus the normal Pages redeploy. |
| **Data layout** | **One folder per topic.** Filenames encode the language: a **language code** (`de.json`, `en.json`) = a translated variant (e.g. `topics/pokemon/de.json`); any **content-named** file (`champions.json`) = a single **language-neutral** list (e.g. `topics/league-of-legends/champions.json`) — no extra `neutral.json` layer. |
| **Popularity / slider** | Sets are split into **ordered fame tiers** (roughly equal fame within a tier, tiers descending). The per-node slider **snaps to tier thresholds** (cumulative word counts), not every integer — no invented fine ordering. See §4.2. |
| **Launch scope** | **skribbl-only MVP** first (comma separator, its limits, copy-to-clipboard). Multi-game presets and shareable-URL configs are **deferred** to a later milestone. |

Remaining open items are content-level only — see §10 (Q6 popularity source, Q7 launch topics).

---

## 1. Executive summary

A **100% client-side** web app (no backend needed for GitHub Pages) that:

1. Loads a small **manifest** of available topics, then **lazy-loads** the word data for topics the user actually opens.
2. Renders topics as an **expandable tree** with checkboxes and per-node **fame-tier** sliders ("include the top *k* tiers").
3. Builds a **live, de-duplicated output** on the right/bottom, with copy-to-clipboard and a highlight of what your last action just added/removed.
4. Respects **per-game output rules** (separator, word-length and total-length limits), with live validation against skribbl's constraints.

The two hard problems to get right are (a) a **data model that stays maintainable as the corpus grows** and (b) the **live-highlight output**, which is trickier than it looks. Both are addressed below.

---

## 2. Target-game constraints (researched)

skribbl.io custom words (used to size limits and validation):

| Rule | Value | Source |
|---|---|---|
| Separator | **comma** `,` | skribbl UI + community docs |
| Min words | **10** | Fandom wiki (2026) |
| Max chars per word | **1–32** characters | Fandom wiki (2026) |
| Max total length | **20,000 characters** | Fandom wiki (2026) |

> ✅ **Verified (2026):** the most current source (Fandom wiki) confirms exactly these values; older "4 words / 30 chars" figures are outdated. Still treat them as **config constants** in `games.json` (one place to edit), not hardcoded across the UI, since skribbl may change them.

Design implication: the output panel must show a **live counter** (word count + total chars), **warn** below the minimum and above the maximum, and **flag/auto-exclude** any single word longer than the per-word limit.

Other games (Codenames, Sketchful.io, Gartic Phone, …) mostly differ only in **separator** and **limits** → modeled as selectable **game presets** (see §6.4).

---

## 3. Evaluation of your original ideas

| Your idea | Verdict | Notes / change |
|---|---|---|
| JSON-ish nested data `Topic → Subtopic → words` | ✅ Keep the *shape* | But the `{ "Aatrox", "Ahri" }` form is a set literal — not valid JSON. Words must be **arrays** (order matters, see below). |
| One file per top-level topic | ✅ **Strongly agree** | Best maintainability. Plus an **auto-generated** manifest so you never hand-maintain the topic list. |
| Language on the (2nd-)top level | ⚠️ **Reworked** | Language isn't cleanly "one level" — some topics are language-neutral (LoL champion names), some are fully translated (Pokémon: Bisasam vs. Bulbasaur). Resolved: **per-language files inside each topic folder** (`de.json`/`en.json`), or one content-named file for neutral topics. See §4.3. |
| Expandable topic tree with checkboxes | ✅ Keep | Core UX. |
| Sort top level by "popularity" desc + slider for "top N" | ✅ **Kept, refined to fame tiers** | Instead of a fragile per-word 1..N ranking, words sit in **fame tiers** (§4.2) and the slider snaps to tier thresholds. Keeps your "most-known first" intent without inventing a fine order. |
| "Include ALL Pokémon" / preset sub-sets per topic | ✅ Keep | Modeled as named **presets** inside a topic file (§4.2). |
| Output field like pvpivs.com (click = select all, copy) | ✅ Keep | But use a **styled element, not a `<textarea>`** — see next row. |
| Highlight last-changed words (green/red) in the output | ✅ Keep the intent, ⚠️ **change the mechanism** | A `<textarea>` **cannot** color individual words. We must render output as a styled container of per-word spans (contenteditable or a read-only div + Clipboard API). This is a real design constraint, flagged as a risk (§8). |
| Separator options at the top | ✅ Keep | Fold into "game presets" so separator + limits move together. |

### Things you didn't mention that we should add
- **De-duplication** across overlapping selections (e.g., two topics share a word).
- **Shareable config** via URL hash and/or `localStorage` (so a group can share "our settings").
- **Live validation** against the game's limits (min/max, per-word length, illegal chars incl. the separator appearing inside a word).
- **Optional shuffle** and **alphabetical vs. popularity** display toggle.
- **Search/filter** box once the corpus grows.
- **Data validation in CI** (JSON Schema) so contributions can't break the site.

---

## 4. Data model (the important part)

### 4.1 Layout: one folder per topic, one file per language + generated manifest

```
data/
  topics/
    league-of-legends/
      champions.json      # language-neutral → content-named file, no lang code
    pokemon/
      de.json             # translated → one file per language code
      en.json
  index.json              # GENERATED — never hand-edited
schema/
  topic.schema.json       # JSON Schema; validated in CI
```

- Each **topic** = one **folder**. **Filename convention:** a **language code** (`de.json`, `en.json`) marks a translated variant; any **other filename** (`champions.json`) marks a single **language-neutral** list. `build-index` derives a topic's languages from the filenames — no redundant `neutral.json` wrapper.
- `index.json` is **built by a script** that scans `data/topics/*/*.json` and emits a lightweight list `{ id, title, langs, files, groupCount, wordCount, icon }` so the frontend renders the tree *without* downloading every topic. `files` lists the topic folder's JSON filenames so the frontend can fetch a neutral topic whose file is content-named (`champions.json`), not `<id>.json`. The chosen language file is fetched only when the user expands/selects that topic → fast first load, scales to hundreds of topics.
- A `validate-data` script cross-checks that a topic's language files share the **same group/tier structure** (same ids, same tier counts) so translations can't silently drift (the known downside of per-language files).

### 4.2 Topic file structure — groups + fame tiers

A topic file (one language) has **groups** (your subtopics). Each group is either a flat `words` array **or**, for large sets, an ordered list of **fame tiers** — words of roughly equal fame within a tier, tiers descending in fame. The slider then snaps to tier boundaries (see below). `presets` express your "Include ALL" / sensible-default idea declaratively.

```jsonc
{
  "id": "pokemon",
  "lang": "de",
  "title": "Pokémon",
  "icon": "🐾",
  "description": "Pokémon-Namen nach Generation, plus Items.",
  "groups": [
    {
      "id": "gen1",
      "title": "Generation 1",
      // ordered fame tiers (tier 0 = most famous). Slider snaps to cumulative sizes.
      "tiers": [
        ["Pikachu", "Glumanda", "Schiggy", "Bisasam"],
        ["Enton", "Rossana", "Habitak"],
        ["Sleima", "Smogon", "Kwaks"]
      ]
    },
    {
      "id": "items",
      "title": "Items",
      "words": ["Pokéball", "Trank", "..."]   // small set → flat, no tiers needed
    }
  ],
  "presets": [
    { "id": "all",      "title": "Alle Pokémon",  "groups": ["gen1", "gen2", "..."] },
    { "id": "starters", "title": "Nur Starter",   "groups": ["starters"] }
  ]
}
```

Rationale:
- **Fame tiers, not a fine order.** Within a tier order is irrelevant; tiers are ordered by fame. The per-node slider offers only the **cumulative thresholds** (`|T0|`, `|T0|+|T1|`, …) → "give me the top *k* tiers". Honest about the fact that many Pokémon are equally (un)famous, and far less tedious to curate than a strict 1..N ranking.
- **`groups`** = your subtopics; the smallest checkbox unit. A group with `tiers` gets a tier-snapping slider; a flat `words` group is all-or-nothing (or a single implicit tier).
- **Tier index is topic-wide.** Because a topic-level "fame depth" slider applies the same `k` across all groups (§6.1), **tier `n` should mean roughly the same fame level in every group of a topic** (gen1 tier 0 ≈ gen2 tier 0 in fame). Curation guideline to note in `CONTRIBUTING.md`. Groups may have different tier *counts*; a group simply contributes nothing beyond its last tier.
- **`presets`** = named bundles of groups → "Include ALL", "Starters only", etc., kept in data (not code) so each topic defines its own.
- Words stay **plain strings** for now. If we later need alternates/hints, the schema can allow `{ "w": "Mr. Mime", "alt": ["Mister Mime"] }` — but we start simple.

### 4.3 Multilingual — resolved: per-language files in per-topic folders

Decided (§0): **per-language files** (`topics/pokemon/de.json`, `topics/pokemon/en.json`); a **language-neutral** topic uses a single content-named file (`topics/league-of-legends/champions.json`) — no `neutral.json` wrapper. The drift risk of parallel lists is mitigated by the `validate-data` structural cross-check (§4.1). Launch languages: **de + en**.

---

## 5. Architecture & tech stack

GitHub Pages serves **static files only** — no server code. All logic runs in the browser.

### 5.1 Decision
**Vite + Svelte + TypeScript**, deployed via GitHub Actions. **Word data is fetched at runtime** (`data/**` served as static assets), so adding/editing words never requires a rebuild — only frontend code changes do. Svelte compiles away, keeping the runtime close to hand-written vanilla JS while still giving real reactivity for the "controls → derived output" flow.

### 5.2 Alternatives considered (rejected)
- **No-build vanilla (HTML/CSS/ES-modules):** cheapest to host, but the reactive UI (sliders ↔ live output ↔ diff-highlight) becomes a lot of manual DOM wiring. Rejected for DX; Svelte gives nearly the same lean output.
- **React + Vite + TS:** familiar from `M294-Frontend`, but heavier bundle and more ceremony than this small tool needs.

### 5.3 Deployment
GitHub Actions workflow builds the site and deploys to Pages (**Pages source = GitHub Actions**, not a branch folder). See `.github/workflows/pages.yml` (§7).

---

## 6. Frontend UX specification

### 6.1 Layout
- **Top bar:** game preset (skribbl/Codenames/custom…) → sets separator + limits; UI language (de/en); global search.
- **Left / main:** topic tree. Each topic row expands to groups. Controls:
  - **Topic-level "fame depth" slider** — one control per topic that applies the same tier depth *k* to **all** its groups: `k=1` includes tier 0 of every group, `k=2` tiers 0–1, etc. This preserves the original "one slider for the N most-known" feel.
  - **Per-group override** (optional, shown when a group is expanded): a group's own tier slider that overrides the topic depth for that group only.
  - **checkbox** per group/topic to include/exclude it entirely (a flat, tier-less group is just a checkbox).
  - topic-level **presets** as quick chips ("Include ALL" = all groups at max depth, "Starters only", …).
- **Right (desktop) / below (mobile):** the **output panel** — live list, counters, warnings, copy button.
- Fully **responsive**; the two-column layout collapses to stacked on mobile.

### 6.2 Output panel
- Rendered as a **styled read-only container of per-word chips/spans** (not a textarea), so we can color words.
- **Click anywhere → select all**, plus an explicit **Copy** button (Clipboard API) with a "Copied!" confirmation.
- **Live highlight of the last change:** words just **added** flash green, words just **removed** flash red before disappearing. Implemented by diffing the previous vs. new word set on each control change.
- **Counters + validation:** `words: 137 · chars: 1,842 / 20,000`; red state when `< minWords` or `> maxTotal`; any word longer than `maxWordLen` gets a warning badge and is excluded from output.

### 6.3 Output options
- Separator (from game preset; overridable): comma / newline / custom.
- De-duplicate (default on), case handling (as-is / Title / lower), optional **shuffle**, sort display **popularity ↔ alphabetical**.
- Guard: if a word contains the active separator, escape or drop it (and warn).

### 6.4 Game presets *(structure designed now; only `skribbl` active in v1 — see §0)*
```jsonc
{
  "skribbl":   { "separator": ",", "minWords": 10, "maxWordLen": 32, "maxTotal": 20000 },
  "codenames": { "separator": "\n", "...": "tbd" },
  "custom":    { "separator": ",", "limits": "off" }
}
```

### 6.5 Persistence & sharing *(deferred past v1 — see §0)*
- **Planned (post-MVP):** encode the current selection (topics, groups, tier depths, options) into the **URL hash** → shareable link, mirrored to `localStorage` for return visits. Not built in v1; the data model already carries stable `id`s so a config encoding can be added later without migration.

---

## 7. Proposed repository structure

```
custom-wordlists/
  index.html                 # Vite entry
  src/                        # Svelte + TS frontend code
  data/
    topics/<topic>/<lang>.json  # one folder per topic, one file per language
    index.json               # GENERATED manifest
    games.json               # game presets (§6.4)
  schema/
    topic.schema.json        # JSON Schema for topic files
  scripts/
    build-index.mjs          # scans data/topics/*/*.json → data/index.json
    validate-data.mjs        # schema-validate + cross-check language files per topic
  docs/
    PLANNING.md              # this file
    CONTRIBUTING.md          # how to add a topic (for future you / others)
  .github/workflows/
    pages.yml                # build + deploy to GitHub Pages
    validate.yml             # run schema validation on PRs
```

---

## 8. Risks & mitigations

| Risk | Mitigation |
|---|---|
| **Textarea can't highlight words** | Custom styled output container with per-word spans + Clipboard API (§6.2). Prototype this early — it's the riskiest UI piece. |
| skribbl limits may change | Verified 2026 (§2); kept in `games.json` (single source); re-check before launch. Shown as guidance, not a hard block. |
| Data grows → slow load | Manifest + lazy per-topic fetch (§4.1). |
| Contributions break JSON | JSON Schema + CI validation (`validate.yml`). |
| Multilingual sync drift | Per-language files, kept aligned by the `validate-data` structural cross-check (same group/tier ids & counts) — CI fails on drift (§4.1). |
| Copyright/IP of names (Pokémon, LoL…) | Names as trivia words are low-risk, but add a disclaimer; keep it non-commercial. |

---

## 9. Roadmap (suggested milestones)

- **M0 — Skeleton:** repo scaffold, one sample topic (`topics/league-of-legends/champions.json`), schema, `build-index` + `validate` scripts, CI, Pages deploy of a "hello world".
- **M1 — Core loop:** manifest load → tree render → checkboxes + top-N slider → live plain-text output → copy button + counters/validation. (No highlight yet.)
- **M2 — Polish output:** last-change green/red highlighting, topic presets ("Include ALL"), output options (separator/case/de-dup/shuffle/sort). Game-preset *structure* in place, only skribbl active.
- **M3 — Scale & share:** lazy-loading, search/filter, multilingual (en alongside de), `CONTRIBUTING.md`. URL-hash sharing + localStorage land here too (deferred from v1).
- **M4 — Content:** flesh out Pokémon, LoL, and a few more topics from the Reddit list (to be pasted); re-verify skribbl limits; launch.

---

## 10. Open Questions

**Resolved (see §0):** Q1 multilingual → per-language files in per-topic folders, de+en · Q2/Q3 stack → Vite+Svelte+TS · Q4 Pages → GitHub Actions deploy · Q5 sharing → deferred past v1 · Q8 games → skribbl-only MVP.

**Resolved during review (v4):**
- **Slider composition:** topic-level "fame depth" slider applies tier depth *k* across all groups, with optional per-group override (§6.1).
- **Nesting depth:** 2 levels (topic → group; group → optional tiers) is assumed sufficient for launch topics. Revisit only if a topic genuinely needs deeper structure.

**Still open (content-level, answered inline below):**

6. **Tier granularity / source (Q6):** How do we decide the fame tiers for big sets? Options: (a) coarse **hand-drawn tiers** by gut feeling (e.g. 3–5 tiers per generation — quick, subjective); (b) a **data source** you trust (LoL pick-rates, a Pokémon popularity poll) that we bucket into tiers; (c) a **canonical fallback** (Pokédex number) as a single tier when no fame data exists. Which per topic type?
=> Im Grunde eine Mischung aus a und b; hand-drawn tiers, aber auf Basis handfester Daten; Starter, Pikachu, Evoli, Mewtu & co. beispielsweise gehören in den allerersten Bekanntheits-Bucket; Welche Daten wir dabei referenzieren wollen, dass belasse ich in *deiner* Hand; Vorerst darf uns auch etwas Grobes reichen.
7. **Launch content (Q7):** Which topics first for your group — LoL champions, Pokémon (which generations?), anything else? This sets what the MVP ships with.
=> Gerne was auf https://www.reddit.com/r/skribbl/comments/ia6ovy/german_wordlist_deutsche_w%C3%B6rterliste/?tl=de vorgeschlagen wurde und für eine solide, abgegrenzte Sammlungen sinnvoll ist; Pokémon & LoL-Champs sind dabei wirklich die besten Start-Themen.
8. **skribbl limits check (Q8-new):** Should I verify the current skribbl min-words / max-length values live (open the game) before we hardcode them into `games.json`, or are the §2 values good enough to start?
=> Ja, weitere Verifikationen sind nie verkehrt, mach das gerne!
