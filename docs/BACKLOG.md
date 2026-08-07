# Backlog

Small ideas parked for later; pick up when a related area is touched. Anything
big enough to discuss belongs in an issue instead.

- **Split `src/App.svelte`.** At 700+ lines it holds the whole app: state, the
  selection model, the fame-depth slider, the topic tree and the output panel.
  Break it up into `src/components/{layout,output,topics}/` — one component per
  concern, in the style Vue projects use. Own refactor PR; behaviour-neutral, so
  it wants a careful before/after comparison rather than new tests.
- **More inline markup in locale strings.** Once `src/locale/html/` exists (the
  `{br}` snippet), `{i}`…`{/i}` and `{b}`…`{/b}` are the obvious companions: a
  parser that turns a marked-up string into a list of parts, and one snippet per
  tag. Nothing needs them today — add a tag the first time a string actually wants
  it, not before.
- **The ⚠️ warning reads wrong in English.** A topic without a `languages` field
  warns in every language including English, which is correct — those lists
  aren't finished in English either. But `langUnsupported` is written for the
  other case: "English is used where a translation is missing" describes a
  fallback that, with English selected, there is nothing to fall back *from*.
  The marker needs a second string for `lang === "en"` — same warning, without
  the translation clause. Worth doing together with `{br}`, which the sentence
  wants anyway.
- **A topic with a single group has one level too many.** "Chemical Elements"
  holds exactly one group, "Elements", whose fame slider is the only thing worth
  reaching — but it sits behind the topic's expander, so the topic behaves like a
  folder even though it doesn't look like one, and the level it opens repeats its
  own name. Same shape wherever a topic has one group. Likely fix: render the sole
  group inline on the topic row (slider and all) and drop the expander; the
  checkbox already derives from that group, so only the presentation changes. Look
  at it properly first — `groupCount` is in the manifest, so the decision can be
  made before the topic loads.
- **Two nits in the issue chooser.** The contribution-guide contact link points
  at `blob/main/CONTRIBUTING.md`; `?tab=contributing-ov-file` renders it in the
  repo's own tab instead. And the charity divider's `name` (one 🌳) is much
  shorter than its `about` (twelve) — 8 or 9 would balance the two lines.
- **Football by country/continent (re-groupable list).** The complex part of the
  sports idea, deferred. Under a future `sports/football/`, football players should
  default to a by-continent split (classic fame slider per continent), toggleable
  via checkbox to one slider per country. Needs a data shape for "same list,
  re-groupable along a chosen dimension" — design later. (Done already, not backlog:
  `sports/olympia/athletes/` neutral athletes list and `sports/olympia/sports/`
  de+en disciplines list.)
- **Use the screen width better on wide viewports.** `--content-max` (60rem)
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
  as we touch them (localized topics get them in both de/en files) — and `sources`
  along with them, wherever a list has one worth naming.
