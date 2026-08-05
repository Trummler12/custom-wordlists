# Contributing

Thanks for helping make the word lists better! There are two ways in — **Option A (issues)** is preferred for almost everything.

## What's worth contributing

- A **new word list** for a topic that isn't covered yet.
- An existing list that's **incomplete or has incorrect entries**.
- **Fame groups** that don't match how well-known the entries actually are.
- A **missing language**, or a wrong/awkward translation.

## Option A — propose via an issue (preferred)

You don't need to touch any code.

1. Open an issue with a template: **Word list** (a new list or a full rework) or **Correction / small fix** (a wrong/missing entry, a fame-group tweak, a missing translation).
2. For a small fix, just describe it. For a whole list, follow the format in the template: entries grouped by fame under `### FG 1`, `### FG 2`, … (most iconic first, ~10 in FG 1), **one entry per line**. Write just the English name when it's the same everywhere; add `de: …; es: …;` **only** for languages that differ from English. Give the **fullest** name a character has (`Eric Cartman`, not just `Cartman`) — the short form is derived from it, whereas the reverse would mean looking up every surname by hand.
3. **Discuss it.** Others (and the maintainer) may spot mistakes or suggest better fame ordering right in the issue thread — refine the proposal together before it's turned into a pull request. A maintainer converts an accepted proposal into the data files.

See issue **#17** for a full worked example.

## Option B — fork & pull request

Prefer to edit the data yourself:

1. Fork the repo and create a branch.
2. Word lists live in `data/topics/**` — **one JSON file per topic**, described by [`schema/topic.schema.json`](schema/topic.schema.json).
   - A folder is a category; a single JSON file (loose in a category, or alone in a folder named after the topic) is a topic.
   - An entry is a plain string, a `{ "short": …, "long": … }` name pair, or localizes at the leaf: `{ "en": …, "de": … }` — only the part that differs from English carries a language map. See `data/topics/animation/south-park.json` for the full range.
   - A topic may declare `"languages"` (the languages it fully supports) and per-language `"titles"` for its display name.
3. Validate before opening the PR:
   ```bash
   npm install
   npm run validate   # data against the schema + cross-checks
   npm run check      # frontend type-check
   ```
4. Open the PR against `main`. The maintainer reviews and merges.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/ (also regenerates data/index.json)
```

## Questions & discussion

Not sure whether something fits, or want a second opinion before writing a full proposal? Open a plain issue and ask — discussion is welcome.
