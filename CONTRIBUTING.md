# Contributing

Thanks for helping make the word lists better!

## What's worth contributing

- A **new word list** for a topic that isn't covered yet.
- An existing list that's **incomplete or has incorrect entries**.
- **Fame groups** that don't match how well-known the entries actually are.
- A **missing language**, or a wrong/awkward translation.
- Anything about the **tool itself** — a bug, or an idea for how it could work better.

The [topic tracker](docs/Topic-Progress.md) shows what's already covered and what's planned — worth a look before proposing a new list.

## Option A — propose via an issue (preferred)

You don't need to touch any code.

1. [Open an issue](https://github.com/Trummler12/custom-wordlists/issues) with a template: **Word list** (a new list or a full rework), **Correction / small fix** (a wrong/missing entry, a fame-group tweak, a missing translation), or **Bug** / **Improvement** (anything about the app rather than a list).
2. For a small fix, just describe it. For a whole list, follow the format in the [worked example](https://github.com/Trummler12/custom-wordlists/issues/17): entries sorted into **fame groups** — `### FG 1`, `### FG 2`, … — most iconic first, around 10 in FG 1, **one entry per line**. Write just the English name when it's the same everywhere; add `de: …; es: …;` **only** for languages that differ from English. Give the **fullest** name a character has (`Eric Cartman`, not just `Cartman`) — an optional short form can be derived from it.
3. **Discuss it.** Others (and the maintainer) may spot mistakes or suggest better fame ordering right in the issue thread — refine the proposal together before it's turned into a pull request. A maintainer converts an accepted proposal into the data files.

See [issue #17](https://github.com/Trummler12/custom-wordlists/issues/17) for a full worked example.

## Option B — fork & pull request

Prefer to edit the data yourself:

1. Fork the repo and create a branch.
2. Word lists live in [`data/topics/**`](https://github.com/Trummler12/custom-wordlists/tree/main/data/topics) — **one JSON file per topic**, described by [`schema/topic.schema.json`](schema/topic.schema.json).
   - A folder is a category; a single JSON file (loose in a category, or alone in a folder named after the topic) is a topic. Give a topic its own folder when you expect it to be split into subtopics later — the app keeps such a topic expandable, while a topic that is just a file shows its one group on its own row.
   - An entry is a plain string, a `{ "short": …, "long": … }` name pair, or localizes at the leaf: `{ "en": …, "de": … }` — only the part that differs from English carries a language map. See `data/topics/animation/south-park.json` for the full range.
   - A topic may declare `"languages"` (the languages it fully supports) and per-language `"titles"` for its display name. Every language an entry uses must be listed there, and `"en"` is always part of it — so if you add a `"de"` translation, add `"de"` to `"languages"` too.
   - Entries must be unique within a topic, and the topic's `"id"` must match its file stem (or, for a topic alone in its own folder, the folder name).
   - `"sources"` (where the entries came from) and `"credits"` (who compiled them) are optional and free-form — a single string or a list. A label may precede the link, e.g. `"German: https://…"`. Please fill in `"sources"` for a new list.
   - A **fame group** (`FG 1`, `FG 2`, … in a proposal) is one entry of a group's `"tiers"` array — the schema and the app call these *tiers* (`FG 1` = tier 0). Careful: `"groups"` in the JSON means something else entirely, namely the subtopic that carries its own checkbox (e.g. "Characters").
3. Validate before opening the PR:
   ```bash
   npm install
   npm run validate   # data against the schema + the cross-checks above
   npm run check      # frontend type-check
   ```
4. Open the PR against `main`. The maintainer reviews and merges.

## Local development

```bash
npm install
npm run dev        # dev server (runs build:index first, then vite)
npm run build      # production build → dist/ (also runs build:index)
```

## Questions & discussion

Not sure whether something fits, or want a second opinion before writing a full proposal? Open a plain issue and ask — discussion is welcome.
