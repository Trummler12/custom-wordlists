# Backlog

Small ideas parked for later; pick up when a related area is touched. Anything
big enough to discuss belongs in an issue instead.

- **Record what a list deliberately leaves out.** Some sources carry entries nobody
  could draw. `data/topics/gaming/pokemon/items.json` is the worst case: **300 of
  its 1330 entries are `★And390`-style decoration data** (22.6%), plus
  `Datenkarte01`…`27`, `Kupon 1`–`3`, `Briefpost 1`–`3`, `R1/R2/R4/R6-Schlüssel`
  and eighteen `X-… 2`–`6` variants of items whose base form is already in the list
  — roughly 355 entries, over a quarter of the topic. Deleting them is easy; the
  problem is that the next re-import silently brings them back, and that a reader
  can't tell a curated list from a careless one.

  A new group-level field, beside `words` / `tiers`, holding what was taken out and
  why. Sketch:

  ```json
  "omitted": [
    { "match": "★*", "reason": "unnamed decoration data" },
    { "match": "Datenkarte##", "as": { "en": "Data Card", "de": "Datenkarte" },
      "reason": "27 numbered copies of one drawable thing" },
    { "match": "X-* [2-6]", "reason": "stat-boost variants; the base items are listed" }
  ]
  ```

  Design notes, in the order they mattered while thinking it through:

  - **Patterns, not just names.** 300 literal `★…` strings would be worse than the
    problem. A plain string means one literal entry; an object means a rule. Whether
    the rule language is a glob (`★*`, `Datenkarte##`) or an anchored regex is the
    one thing to decide first — globs read better in JSON, since a regex needs
    `\\d` and full-match anchors; regexes handle the `X-… 2–6` family in one line.
  - **A rule matches an entry, not a string.** The junk is localized:
    `{ "en": "Data Card 01", "de": "Datenkarte01" }`. A pattern written in German
    would never see the English form, so an entry is omitted when *any* of its
    language forms matches — one rule per family, written in whichever language
    reads best. (The 300 `★And…` are plain strings, so language-neutral already.)
  - **A rule may name what stands for the family: `as`.** "Datenkarte", "Kupon" and
    "Briefpost" are perfectly drawable words that would otherwise vanish with their
    numbered variants — and the base form exists nowhere in the source, so it can't
    survive a regeneration by being an ordinary entry. Keeping it *inside* the rule
    beats a separate `added` list: the two halves are one editorial act ("collapse
    this family to its base name"), the tooltip line writes itself ("27 ×
    Datenkarte01–27 → Datenkarte"), and nothing has to correlate two fields to
    explain itself. `as` is a full word entry (`#/$defs/word`), since the name is
    missing in every language, not just one. Omit `as` where the base form is
    already in the source — the `X-… 2–6` variants, whose base items are listed.
  - **Where a replacement lands once tiers exist:** in the tier of the best-known
    entry it replaces, falling back to the last tier when none of them had one. The
    generator already knows which entries a rule matched, so this costs nothing, and
    it degrades correctly — a family of numbered junk lands at the bottom, while
    collapsing a famous family would keep its standing. Moot until the items list
    gets tiers at all (it is flat today), but it is the rule that stops a
    regeneration from having to guess.
  - **Enforce it in `validate-data`, not at load.** The obvious reading of "fallback
    filter" is to filter on load, but that runs a rule set over 1330 entries every
    time the topic opens, forever, to protect against a mistake made in a codemod.
    Better: `validate` errors when any entry matches an omission. Then a re-import
    that resurrects `★And390` fails CI instead of quietly shipping, the invariant is
    checked once, and the frontend stays as it is.
  - **The tooltip can't name what a pattern removed** — that's the price of not
    storing 300 strings. So its lines are of two kinds: a literal shows its name, a
    rule shows its reason and its count ("300 entries — unnamed decoration data"),
    which is what a reader actually wants at that size anyway. Needs a scrollable
    variant of `.tip-note`, which is currently a small box sized to a sentence.
  - **Not a bin for the button.** 🗑️ or 🚮 beside a row of checkboxes reads as
    "delete this", which is the one thing it must not suggest — and 🚮 is public
    signage that renders as a sign, not an object, on several platforms. 🧹 says the
    list was tidied, ✂️ that it was trimmed; both are honest about a past edit rather
    than offering a destructive one.
  - **No manifest change.** The tooltip renders from the loaded topic file, like the
    names dropdown, so `build-index` and `TopicSummary` stay out of it.
  - **Name it `omitted`, not `excluded`.** The output counter already says
    "excluded" for words over skribbl's 32-character limit — a different thing that
    happens to the same list, and two of them under one word would be confusing in
    both the code and the UI.
  - **Open:** whether the removed names are kept anywhere in full. `data-raw/` holds
    the source dumps already, so the honest answer may be that the raw file *is* the
    complete record and the topic file only needs the rules — with the tooltip
    pointing at the source rather than pretending to be exhaustive.
- **One matcher instead of two.** `scripts/validate-data.mjs` carries its own copy
  of `globToRegExp` and `entryForms`, mirroring the tested ones in
  `src/lib/omitted.ts`, because a `.mjs` script can't import TypeScript — the same
  reason `LANG_RE` is duplicated against the schema. Two ways out, neither urgent:
  raise CI's Node from 20 to 22+ and import the `.ts` directly via native
  type-stripping (which needs the module free of value imports, since stripping
  doesn't add extension resolution), or move the shared helpers into a plain `.mjs`
  both sides import. The second is smaller; the first would also let the other
  scripts share frontend logic, so it is worth deciding once rather than twice.
- **More inline markup in locale strings.** Once `src/locale/html/` exists (the
  `{br}` snippet), `{i}`…`{/i}` and `{b}`…`{/b}` are the obvious companions: a
  parser that turns a marked-up string into a list of parts, and one snippet per
  tag. Nothing needs them today — add a tag the first time a string actually wants
  it, not before.
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
- **Tests for `src/lib/`.** The split left five modules of plain functions with
  no runes and no DOM: `words`, `tree`, `fame`, `dom`, `skribbl`. That is all of
  the app's logic that can be tested without mounting anything, and
  `snapPositions` has already had one bug found by reading alone.
