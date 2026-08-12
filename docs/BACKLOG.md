# Backlog

Small ideas parked for later; pick up when a related area is touched. Anything
big enough to discuss belongs in an issue instead.

- **Legacy names for the League of Legends champions.** A few champions were
  introduced under one name and renamed later, and someone who stopped playing
  years ago knows only the old one. Both should be drawable, with the old ones off
  by default behind an "include legacy names" checkbox.

  **The machinery for that already exists.** An `omitted` rule is exactly this:
  entries that sit in the file, are filtered on the way into the list, and come
  back when the reader unticks them in the 🧹 panel. So this is data work — add the
  legacy names as ordinary entries, then one rule whose `match` is the list of
  them (a glob with no wildcards is a literal, and `match` already takes a list).
  No new field, no new UI.

  Two things to sort out when doing it: `data-raw/gaming/League of Legends/Champions
  by Fame.txt` has a column per champion, but it holds their *title* (`Darkin
  Blade` → Aatrox), so the legacy names have to come from somewhere else. And the
  file writes each tier on one line, unlike every other tiered list — worth
  expanding to one entry per line while it's open, which is what
  `scripts/lib/serialize.mjs` would do anyway.
- **One matcher instead of two.** The scripts now share `scripts/lib/omissions.mjs`,
  so what remains is the one copy that can't be helped: it mirrors the tested
  `src/lib/omitted.ts`, because a `.mjs` script can't import TypeScript — the same
  reason `LANG_RE` is duplicated against the schema. The way out is raising CI's
  Node from 20 to 22+ and importing the `.ts` directly via native type-stripping,
  which needs the module free of value imports (stripping doesn't add extension
  resolution). Worth doing when something else wants Node 22 anyway; not on its
  own.
- **More inline markup in locale strings.** `src/locale/html/` handles `{br}` and
  `[text](url)`; `{i}`…`{/i}` and `{b}`…`{/b}` are the obvious companions — a
  parser that turns a marked-up string into a list of parts, and one snippet per
  tag. Nothing needs them today — add a tag the first time a string actually wants
  it, not before.
- **Group the locale keys.** `UIStrings` is ~40 flat keys covering the header, the
  tree, the rulers, the output and the footer, and it only grows. Nesting them by
  area (`topics.wordsOf`, `output.copied`, …) would make both dictionaries
  readable at a glance and make a missing translation obvious. It is a mechanical
  rename across every component that reads `lang.ui.*`, so it wants a quiet moment
  and a PR of its own — never alongside a feature, where the two diffs would hide
  each other.
- **English entries *in addition* to the selected language.** The per-topic English
  toggle replaces a list's entries; a third state would add them, for a game where
  either name should count. What makes it worth building is the tooltip, which
  would rotate with the state it describes rather than label it — "Toggle to use
  English entries instead. / Toggle again to use English AND German entries", then
  "Now uses English entries instead. / Toggle to use English AND German entries. /
  Toggle again to only use German entries", then the third. Needs an answer first
  for what the counts mean and how a name that is identical in both languages is
  de-duplicated — neither of which the plain toggle has to face.
- **An interface language separate from the content language.** "Keep the interface
  in German while the lists are English" is the global half of the per-topic English
  toggle, and belongs in the settings popover beside it. Cheap once that exists:
  everything that renders words already asks `contentLang`. Its dropdown needs an
  explicit first option — *auto*, not a language — meaning "follow the language
  selector", which is today's behaviour and has to stay reachable once the two can
  diverge. It also re-earns the `${language}` placeholder in `langUsesEnglish`,
  which a locale can drop only while it is guaranteed to be describing its own
  language — and the same holds for `langUnsupported` and `languageLabel`.
- **Force a list to a language other than English.** The 🇬🇧 toggle hard-codes the
  one language every list has. But a German player might want a list in French, and
  `contentLang` already returns a per-topic code — only the control assumes English.
  Turning the toggle into a picker means deciding which languages to offer per
  topic (`languages` knows), and what the row's control becomes when the answer
  isn't a single flag. Worth doing when a list exists that anyone would want in a
  third language.
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
- **Tests for `dom` and `skribbl`.** Vitest covers `words`, `tree`, `fame`,
  `english`, `languages` and `omitted`; these two are what is left of the logic
  that can be tested without mounting anything. `snapPositions` in `dom` has
  already had one bug found by reading alone, which is the argument for it.
- **Latin-American Spanish where it actually differs.** PokéAPI ships `es-419`
  beside `es`, and how far apart they are depends entirely on the list: **5 names
  out of 1330 for the items, but 254 of 937 for the moves.** A quarter of the move
  names is not a rounding error — Latin America has its own vocabulary here.

  Still not worth a language: no locale, no entry in the picker, nothing in
  `usesEnglishFor`. Worth a toggle — with Spanish selected, a list carrying any
  `es-419` names offers to use them *instead of* `es`, the same shape as the 🧹
  rows. The dumps are committed (`data-raw/gaming/pokemon/{items,moves}/es-419.txt`),
  so the data half is one line in the enrichment's `TAG` map; do it when the toggle
  exists, not before, or entries gain an `es-419` in their `?` for no consumer.
- **A language tag the picker offers is not always the tag the data uses.** The
  Pokémon lists carry `zh-Hans` and `zh-Hant`, and `ja-Latn` beside `ja`. The
  picker offers `de` and `en` today, so nothing is wrong yet — but the moment it
  offers `zh`, `resolveStr` looks up `s["zh"]`, misses, and falls back to
  English, while `langSupport` reads `usesEnglishFor: ["*"]` and reports Chinese
  as an English-named list. Both are the same missing step: resolve a selected
  language to the closest tag the entry actually has before giving up on it.
