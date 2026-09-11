# Locale

Two kinds of translatable text live in this project, and they are deliberately kept apart. This folder holds the first kind. The second kind lives next to the data that owns it, and this README is the map to where.

## 1. App chrome — here, in `src/locale/`

Everything the app itself renders: headers, the topic tree, control labels, tooltips, settings, the footer. Keyed by a string id, consumed by the Svelte components, resolved at runtime.

- `index.ts` — the `UIStrings` interface (the id namespace, grouped by place or feature), the `UI` registry, `strings(lang)` (falls back to English via `FALLBACK_LANG`), `CONTENT_LANGS` (the 🌐 picker's languages) and helpers like `langWarning`.
- `en.ts` `de.ts` `es.ts` `fr.ts` `it.ts` `ja.ts` `ko.ts` — one dictionary per locale, each implementing `UIStrings`. English is the fallback every other locale falls back to.
- `variants.ts` — the written-two-ways languages (Romaji, Latin-American Spanish) and the toggle that switches the tag consulted first.
- `html/` — `Msg.svelte` / `markup.ts` / `plain.ts` render a string that carries `{br}` and `[text](url)` markup, as HTML or as a plain string.

## 2. Topic content — NOT here, with the build that bakes it

Titles, tier conditions, ruler tooltips, and the `reason` on an omission rule are translatable too, but they describe a *topic*, not the app. They are computed by the geography build scripts, baked into the topic JSON under `data/topics/geography/`, keyed by topic + field, and resolved by `resolveStr` (`src/lib/words.ts`) with an English fallback — the same shape a Pokémon name has.

This split is intentional. This text belongs to its data (the Node build cannot import a `.ts` chrome dictionary, and a per-topic string does not fit an id-keyed namespace); the later UI-language-expansion PR grows `CONTENT_LANGS` and these strings translate in place with everything else.

Where the scattered locale-like maps live, by source:

- **`scripts/geography/build-continents.mjs`** — `TITLE`, `TIER_CONDITIONS`, `RULER_TOOLTIP`, `TIER3_NOTE`, `NOTE_LABEL`, `ANCIENT_REASON`.
- **`scripts/geography/build-languages.mjs`** — `TITLE`, `RULER_TOOLTIP`, `NUM` (tier-threshold words), `MORE`, `ABOVE_ZERO`, each `TYPES[].reason` (the nine language-type inclusion labels, Wikidata-linked via `wd()`), `SIGN_LANGUAGES.reason`.
- **`scripts/geography/build-country-data.mjs`** — `T_COUNTRIES`, `T_CAPITALS`, `RULER_COUNTRIES`, `RULER_CAPITALS`, `NUM`, `MORE`, `ABOVE_ZERO`, each `CELLS[].reason` (the sovereignty matrix), `COVERAGE` (the geoguessr rules), and the inline empty-list `*crickets*` title.
- **`data/topics/geography/**/*.json`** — the baked output of the above: each topic's `title`, `tierConditions`, `rulerTooltip` and rule `reason`s. Generated, not hand-edited — change the build script, then `npm run build:data`.

The `NAME_LANGS` / `LANG_SRC` / `LANGS` maps in those same scripts are language *tags*, not translatable text — they route Wikidata terms into name buckets and do not belong to either tier here.
