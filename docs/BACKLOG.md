# Backlog (local notes, not tracked)

Small ideas parked for later; pick up when a related area is touched.

- ~~**Type-check the config project in CI.**~~ Done in Häppchen 4: `validate.yml`
  runs `npm run typecheck:node` (`tsc -p tsconfig.node.json --noEmit`).
- ~~**Serve `data/` as static assets on Pages (M1).**~~ Done in Häppchen 5: the
  `serveData()` plugin in `vite.config.ts` serves `/data/*` in dev and copies
  `data/` into `dist/data/` on build; `build`/`dev` run `build:index` first, so
  the manifest is generated in every Pages build. `data/` stays at repo root
  (§4.1); not moved to `public/`.
- **UI language switch + localized category names/icons.** Needed before category
  titles can "follow the language". Two parts: (1) a global de/en toggle — today
  `pickFile` always prefers `en`, so the German topic variants aren't reachable in
  the UI at all; the toggle would drive `pickFile` and any UI strings. (2) A place
  to store localized category/subcategory display names + optional icons (today
  they're slug-derived via `formatCategory`, English-only). Candidate storage: a
  per-category `_category.json` ({de, en, icon}) that `build-index` folds into the
  manifest, or a central `data/categories.json` map. Own feature PR; keep it out
  of the content PR.
- **Football by country/continent (re-groupable list).** The complex part of the
  sports idea, deferred. Under a future `sports/football/`, football players should
  default to a by-continent split (classic fame slider per continent), toggleable
  via checkbox to one slider per country. Needs a data shape for "same list,
  re-groupable along a chosen dimension" — design later. (Done already, not backlog:
  `sports/olympia/athletes/` neutral athletes list and `sports/olympia/sports/`
  de+en disciplines list.)
- **Use the screen width better on wide viewports.** `main { max-width: 60rem }`
  leaves a lot of unused space left & right on large windows. Ideas: a wider (or
  fluid) max-width; a wider topic column and/or multi-column category tree; keep
  the output panel a sensible fixed width so it doesn't stretch too far. UI is
  functional as-is, so this is polish — revisit when doing a layout pass.
- **Tooling for the `lastUpdated` / `lastChecked` fields.** The schema now has
  optional ISO-date fields per topic (set on LoL so far). Follow-ups: (1) a
  `scripts/stale-check.mjs` (or a `validate` warning) that lists topics sorted by
  `lastChecked` — oldest / undated first — so we see which lists are due for a
  currency re-check. (2) Have `build-index` emit the dates into the manifest if
  the frontend should later surface them. Also: backfill dates on existing topics
  as we touch them (localized topics get them in both de/en files).
