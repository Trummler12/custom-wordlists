# Backlog

Small ideas parked for later; pick up when a related area is touched. Anything
big enough to discuss belongs in an issue instead.

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
  own name. This is the rule rather than the exception: the Pokémon generations,
  items and moves, the Olympia athletes and disciplines, the elements. The
  multi-group topics are the deliberate ones — Simpsons, SpongeBob, Dragon Ball,
  the comics, film & TV — which all have further subtopics planned. Likely fix:
  render the sole group inline on the topic row (slider and all) and drop the
  expander; the checkbox already derives from that group, so only the presentation
  changes. `groupCount` is in the manifest, so the decision can be made before the
  topic loads.
- **Fame sliders hidden by default, per topic.** A new topic field —
  `hideRulerByDefault`, default `false` — plus a `[ ] ruler` checkbox on the level
  above ("Show fame rulers for all Pokémon generations") that reveals them all at
  once. Possibly one per generation as well; decide when building it. The reason
  is specific to lists like these: for most topics people know the entries to
  wildly differing depths, which is what the slider is for — but a very large
  group of people knows more or less *every* Pokémon by name, and for them the
  slider is nine near-identical controls in the way of a plain all-or-nothing
  checkbox. Depends on the single-group fix above, which decides where the
  slider lives in the first place.
- **Show what just changed in the output.** Ticking a topic or moving a fame
  slider changes the output silently, and on a long list the chips that appeared
  are usually below the fold. Two halves. (1) Scroll the output box so the gap
  between the last chip of the changed list and the next row lines up with the
  bottom edge of the scroll area — the changed list ends exactly at the fold.
  (2) Tint that list's chips green-to-red by the index of their fame group within
  the topic; if a checkbox one level up brought in several leaf topics at once,
  tint the whole batch. Together they answer "how many steps left does the slider
  need to drop the first entry I don't know?" by reading the output instead of
  guessing. Border in the stronger colour, background in a washed-out one, so the
  chip text keeps a clearly darker ground under it.
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
- **Scoped CSS per component.** `src/styles/app.css` stayed whole through the
  component split, so every rule is global and only the class names say which
  component owns it. Moving each block into its component's `<style>` would fix
  that, but two rules are coupled to TypeScript by comment (`--inset` ↔
  `INSET_PX`, `--footer-h` ↔ the output panel) and the tokens have to stay
  global — so it wants its own PR rather than a corner of another one.
- **Tests for `src/lib/`.** The split left five modules of plain functions with
  no runes and no DOM: `words`, `tree`, `fame`, `dom`, `skribbl`. That is all of
  the app's logic that can be tested without mounting anything, and
  `snapPositions` has already had one bug found by reading alone.
