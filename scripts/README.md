# Build & maintenance scripts

The tooling that turns the raw dumps in [`data-raw/**`](../data-raw) into the curated lists under [`data/topics/**`](../data/topics), plus the manifest the app loads. **None of it ships to the site** — the app reads only `data/topics/**` and the generated `data/index.json`; everything here runs at author time.

Two kinds of script, marked in the headings below:

- 🔧 **Everyday** — wired to an `npm run` script and part of the normal dev / contribution loop. Safe to run any time.
- 🔒 **Maintainer** — regenerates a topic's data from an external source (Wikidata, PokéAPI, CLDR, …) or is a one-off codemod. Run rarely, usually needs `--write`, and re-running can overwrite hand-tuned tiers — read the script's own header first.

Contributors almost never need a 🔒 script: proposing or fixing a list goes through [CONTRIBUTING.md](../CONTRIBUTING.md), and a maintainer regenerates the data from the source.

## Contents

- [🔧 Everyday](#-everyday) — npm-wired, safe any time
- [🔒 Geography, languages & plates](#-geography-languages--plates) — the `dump` / `check:data` / `build:data` pipeline
- [🔒 Other topic pipelines](#-other-topic-pipelines) — elements, Pokémon
- [🔒 One-off codemods & analysis](#-one-off-codemods--analysis)
- [Shared library](#shared-library)

## 🔧 Everyday

| script | npm | what it does |
| --- | --- | --- |
| `build-index.mjs` | `build:index` | Scans `data/topics/**` into `data/index.json`, the light manifest the frontend loads first. Runs automatically before `dev` and `build`. |
| `validate-data.mjs` | `validate` | Checks every topic against the schema plus the cross-checks it can't express — inherited tier bands, duplicate words, declared languages, omission rules still live. Run before opening a PR. |
| `check-wraps.mjs` | `check:wraps` | Flags mid-sentence line breaks in the project's Markdown (house style). Only reports, never fails. |

## 🔒 Geography, languages & plates

Three npm scripts drive the geography-family topics — Continents & Plates, Languages, Countries & Capitals — end to end. The raw dumps and the override / abbreviation files live under [`data-raw/geography/`](../data-raw/geography).

| step | npm | scripts |
| --- | --- | --- |
| dump | `dump` | `dump-plate-data` · `dump-language-names` · `dump-country-data` — (re)harvest the raw name and number files from the plate sources, umpirsky/CLDR and Wikidata. |
| check | `check:data` | `report-name-quality` — writes `data-raw/geography/name-quality-report.md`, a worklist of Wikidata issues to fix at the source. |
| build | `build:data` | `build-continents` · `build-languages` · `build-country-data` — fill the topic JSONs from the dumps (`--write` to persist). |

Supporting, not run directly:

- `bucket-names.mjs` — the shared rule that turns one entity's flagged Wikidata names (`rdfs:label` / P1448 official / P1813 short) into the `{ pref, short?, long?, others? }` shape. Imported by the country dump, build and report.

The country / capital names also draw on two raw-data files, kept as data rather than inline so they can be edited by hand:

- `data-raw/geography/countries/name-overrides.json` — where Wikidata's label is a formal/realm title or missing outright.
- `data-raw/geography/countries/name-abbreviations.json` — which code-like names are genuine abbreviations to keep (`USA`, `UK`) versus ISO/technical codes to drop (`NG`, `EC`).

## 🔒 Other topic pipelines

Per topic, run individually — no umbrella npm script.

| scripts | what they do |
| --- | --- |
| `science/dump-element-names` · `science/build-elements` | Chemical elements: dump names per language from Wikidata, then fill `elements.json` (names only — tiers stay editorial). |
| `pokemon/dump-names` · `pokemon/enrich-names` · `pokemon/romanize-names` | Pokémon lists from PokéAPI: dump per language, join every language onto a flat list by English name, and bake or strip `ja-Latn` romaji. |

## 🔒 One-off codemods & analysis

Kept for the next list that needs them, not part of any routine.

| script | what it does |
| --- | --- |
| `tier-by-fame` | Orders a flat list into fame tiers from a quiz result (`data-raw/**/Fame.txt`). Writes only with `--write`, and won't be re-run once a list's tiers are hand-nudged. |
| `omission-report` | Shows what each omission rule actually catches and leaves behind — the *right?* companion to validate's *valid?*. |
| `dissolve-groups` · `flatten-topics` | Structural codemods left over from the topic-format migrations. |

## Shared library

Not executable on their own — imported by the scripts above.

- `lib/serialize.mjs` — the one house-style serializer every codemod writes through, so none can round-trip a topic file into a smaller one than it read.
- `lib/omissions.mjs` — omission-rule matching for the scripts, mirroring the tested `src/lib/omitted.ts` (a `.mjs` can't import the TypeScript).
