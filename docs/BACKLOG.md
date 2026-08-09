# Backlog

Small ideas parked for later; pick up when a related area is touched. Anything
big enough to discuss belongs in an issue instead.

- **More inline markup in locale strings.** Once `src/locale/html/` exists (the
  `{br}` snippet), `{i}`…`{/i}` and `{b}`…`{/b}` are the obvious companions: a
  parser that turns a marked-up string into a list of parts, and one snippet per
  tag. Nothing needs them today — add a tag the first time a string actually wants
  it, not before.
- **One shared *value* ruler for a whole category.** `hideRulersByDefault` already
  groups a category's topics under its control root (`controlledTopics` in
  `lib/rulers`) and toggles their rulers' *visibility* together. The next step is a
  single ruler on that same category row that moves all their *depths* together —
  for a category whose topics are variations of one list (the nine Pokémon
  generations). The children's tiers won't line up, so "move all to the same
  fraction" rounds each child up to its next snap point; the child rulers stay
  usable individually afterwards. Sizeable — writing many groups' depths from one
  control is a different shape from the visibility toggle, which only flips a
  boolean.
- **Frugal topic loading.** A flattened (solo) topic loads as soon as its row
  appears rather than when expanded — its ruler can't be drawn without the tiers it
  snaps to. Fine at 28 topics (`data/topics/` is ~240 KB total), but as the
  catalogue grows it's worth loading only what's on screen, or only what a ruler
  actually needs.
- **Ruler-toggle polish.** The 📏 visibility toggle has rough edges: it sits by the
  count on topic rows but right after the title on category rows (the category
  title isn't `flex:1`); the hidden state (opacity 0.3) is quiet enough to miss;
  and only a *solo* topic's ruler is gated — a foldered topic that opted in would
  need its group rulers gated in `GroupRow` too (none does today).
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
