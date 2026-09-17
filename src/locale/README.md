# Locale

Translatable text in this project lives in three places, deliberately kept apart. This folder holds two of them — the app chrome (§1) and the topic prose (§2). The third, the topic titles, lives next to the data that owns it (§3), and this README is the map to where.

## 1. App chrome — here, in `src/locale/`

Everything the app itself renders: headers, the topic tree, control labels, tooltips, settings, the footer. Keyed by a string id, consumed by the Svelte components, resolved at runtime.

- `index.ts` — the `UIStrings` interface (the id namespace, grouped by place or feature), the `UI` registry, `strings(lang)` (falls back to English via `FALLBACK_LANG`), `CONTENT_LANGS` (the 🌐 picker's languages) and helpers like `langWarning`.
- `en.ts` `de.ts` `es.ts` `fr.ts` `it.ts` `ja.ts` `ko.ts` — one dictionary per locale, each implementing `UIStrings`. English is the fallback every other locale falls back to.
- `variants.ts` — the written-two-ways languages (Romaji, Latin-American Spanish) and the toggle that switches the tag consulted first.
- `html/` — `Msg.svelte` / `markup.ts` / `plain.ts` render a string that carries `{br}` and `[text](url)` markup, as HTML or as a plain string.

## 2. Topic prose — here, in `src/locale/topics/`

The tier conditions, ruler tooltips, number-band words, and the `reason` on an omission rule describe a *topic* rather than the app, but they are still enumerable text a new interface language should be able to fill in one place. So they are centralized here, in a dictionary kept **separate from `UIStrings`** (the coverage entry loads `UIStrings` and never renders this prose, so folding it in would only grow that bundle). The topic data carries a bare **id** or **token**, resolved at runtime against this dictionary.

- `topics/index.ts` — the `TopicProse` interface (the id namespace: sovereignty / coverage / language-type reasons, sign-languages, ancient-plates, the continent tiers and their note, the ruler hovers, the number `bands` and the `more` / `aboveZero` formats), `topicProse(lang)` (English fallback), `resolveProse("a.b.c", lang)` (a stale id resolves to itself, so it fails visibly), `resolveCondition(token, lang)` (a band key ⇒ `more(bands[key])`, `FLOOR` ⇒ `aboveZero`, an `id@noteId` ⇒ a folded note, else a prose id).
- `topics/en.ts` … `topics/ru.ts` — one dictionary per interface language (`en de es fr it ja ko zh-Hans zh-Hant ru`), each implementing `TopicProse`; English is the fallback.
- Consumed by `resolveReason` (`src/lib/words.ts`, for a rule's bare-string `reason` — a language map instead, like the Pokémon one-offs, resolves in place; a `wd` Q-id on the rule wraps the resolved label in its Wikidata link), by `resolveCondition` for `tierConditions` tokens, and by `resolveProse` for `rulerTooltip.text`/`empty` (composed by `rulerTip` in `src/lib/fame.ts`).

## 3. Topic titles — NOT here, with the build that bakes them

The only topic text still baked into the data is the **titles** — topic and category names. They already carry every planned language (a new interface language needs no work here), so they were left with the build rather than centralized. Computed by the geography build scripts, baked into the topic JSON under `data/topics/geography/`, and resolved by `resolveStr` (`src/lib/words.ts`) with an English fallback — the same shape a Pokémon name has.

- **`scripts/geography/build-continents.mjs`** — `TITLE` (and the per-continent category names).
- **`scripts/geography/build-languages.mjs`** — `TITLE`.
- **`scripts/geography/build-country-data.mjs`** — `T_COUNTRIES`, `T_CAPITALS`, and the inline empty-list `*crickets*` title.
- **`data/topics/geography/**/*.json`** — the baked output: each topic's `title` (plus the prose ids / condition tokens from §2). Generated, not hand-edited — change the build script, then `npm run build:data`.

The `NAME_LANGS` / `LANG_SRC` / `LANGS` maps in those same scripts are language *tags*, not translatable text — they route Wikidata terms into name buckets and do not belong to any tier here.
