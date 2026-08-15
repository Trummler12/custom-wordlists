# Contributing

Thanks for helping with the project!

## What's worth contributing

- A **new word list** for a topic that isn't covered yet.
- An existing list that's **incomplete or has incorrect entries**.
- **Fame groups** that don't match how well-known the entries actually are.
- A **missing language**, or a wrong/awkward translation.
- A **link to structured data** — an API, a dataset, a repo — that a list could be generated from.
- Anything about the **tool itself** — a bug, or an idea for how it could work better.

The [topic tracker](docs/Topic-Progress.md) shows what's already covered and what's planned — worth a look before proposing a new list.

## Before you type out a list

If your topic already exists as **structured data** — a public API, a Wikidata query, a CLDR export, a maintained list on GitHub — then please don't compile it by hand. The language list and the Pokémon lists were all built by script from sources like that, and a script does in one pass, in every language at once, what a spreadsheet does in an evening in one of them.

**A couple of links can be the entire contribution:** open a [Data source](https://github.com/Trummler12/custom-wordlists/issues/new?template=2-data-source.yml) issue and say what you found. Naming a source we can script beats a hand-typed list of the same topic — it arrives more complete, and it stays checkable against where it came from.

## Choose your Way of Contributing

- **[Option A — propose via an issue](#option-a--propose-via-an-issue-preferred)** — *preferred*
- **[Option B — fork & pull request](#option-b--fork--pull-request)** — *for the hands-on*
- **[Option C — help convert a list](#option-c--help-convert-a-list)** — *for the helpers*

## Option A — propose via an issue (preferred)

You don't need to touch any code. [Open an issue](https://github.com/Trummler12/custom-wordlists/issues) with a template:
- **Word list** (a new list or a full rework),
- **Data source** (links to structured data a list can be built from — see above),
- **Correction / small fix** (a wrong/missing entry, a fame-group tweak, a missing translation),
- or **Bug** / **Improvement** (anything about the app rather than a list).

For a small fix, just describe it.  
For a **whole list**, there are two ways to hand it over — pick whichever you're comfortable with:

<details>
<summary><strong>I'd like it simple</strong></summary>

Sort entries into **fame groups** — most iconic first, around 10 in FG 1, **one entry per line**.  
Write just the English name when it's the same everywhere; add `de: …; es: …;` **only** for languages that differ from English.  
Give the **fullest** name a character has (`Eric Cartman`, not just `Cartman`) — an optional short form can be derived from it.

This is the lowest-effort path; a maintainer turns it into the data file. See the [simple worked example (#17)](https://github.com/Trummler12/custom-wordlists/issues/17).
</details>

<details>
<summary><strong>I'd like to do it properly</strong> (preferred)</summary>

Provide the **entries** in JSON shape — `"plain strings"`, `{ "short", "long" }` name pairs and `{ "en", "de" }` language maps, grouped into fame-group arrays, **one entry per line**.  
You can skip the wrapper (`id`, `languages`, `titles`, …): it's derivable or ours to set. **Don't worry about indentation** either.  
A maintainer drops the entries straight in, so this saves the most work. See the [JSON worked example (#26)](https://github.com/Trummler12/custom-wordlists/issues/26) and, for the full entry format, [`schema/topic.schema.json`](schema/topic.schema.json).

For a **rework** or a **language** addition, JSON is the natural choice — the current list already *is* JSON, so you're editing rather than starting from scratch.
</details>
<br>

**Either way, discuss it.** Others (and the maintainer) may spot mistakes or suggest better fame ordering right in the issue thread — refine the proposal together before it's turned into a pull request. A maintainer converts an accepted proposal into the data files.

## Option B — fork & pull request

Prefer to edit the data yourself:

1. Fork the repo and create a branch.
2. Word lists live in [`data/topics/**`](https://github.com/Trummler12/custom-wordlists/tree/main/data/topics) — **one JSON file per topic**, described by [`schema/topic.schema.json`](schema/topic.schema.json).
   - A folder is a category; a single JSON file (loose in a category, or alone in a folder named after the topic) is a topic. Give a topic its own folder when you expect it to receive subtopics later — the app keeps such a topic expandable, while a topic that is just a file shows its one group on its own row.
   - An entry is a `"plain string"`, a `{ "short": …, "long": … }` name pair, or localizes at the leaf: `{ "en": …, "de": … }` — only the part that differs from English carries a language map. See `data/topics/animation/south-park/characters.json` for the full range.
   - A topic may declare `"languages"` (the languages it fully supports). Every language an entry uses must be listed there, and `"en"` is always part of it — so if you add a `"de"` translation, add `"de"` to `"languages"` too.
   - `"title"` has the same shape as an entry: a plain string, a `{ "en": …, "de": … }` map when the name translates, or a `{ "short": …, "long": … }` pair — the app puts `short` on the row and `long` in a hover, so a long name doesn't crowd the tree. Group and category titles work the same way.
   - `"usesEnglishFor"` names the languages among those whose entries simply *are* the English names — League of Legends champions are called the same in German. The app then shows an ℹ️ rather than leaving a reader to wonder why a German list is full of English words. Use `"*"` for a list that is English in every language you haven't named in `"languages"`.
   - Entries must be unique within a topic, and the topic's `"id"` must match its file stem (or, for a topic alone in its own folder, the folder name).
   - `"sources"` (where the entries came from) and `"credits"` (who compiled them) are optional and free-form — a single string or a list. A label may precede the link, e.g. `"German: https://…"`. Please fill in `"sources"` for a new list.
   - `"omitted"` lists families of entries the list hides from its source — junk nobody could draw, or numbered copies of one drawable thing. **The entries stay in the file**: they are filtered on the way into the list, so every rule is reversible and the app can show a 🧹 panel saying what was left out and offering it back.

     ```json
     "omitted": [
       { "id": "data-cards", "match": "Datenkarte[0-9]*",
         "as": { "en": "Data Card", "de": "Datenkarte" },
         "reason": { "en": "27 numbered [Data Cards](https://…), each recording a different statistic",
                     "de": "27 nummerierte [Datenkarten](https://…), die je eine andere Statistik festhalten" } }
     ]
     ```

     - `"id"` — kebab-case, unique within the group. It keys the reader's choice, so you may edit the glob without resetting it.
     - `"match"` — a whole-name glob (`*` any run, `?` one character, `[0-9]` a class), or a list of them where one family is named too differently across languages to share a pattern (`"X-* [2-6]"` and `"Angriffplus[0-9]"`). A rule matches an entry when **any** of its language forms does, so one glob covers `"Data Card 01"` and `"Datenkarte01"` alike — write it in whichever language reads best.
     - `"reason"` — one phrase, localized, shown beside the checkbox. It may carry `{br}` and `[text](url)` links (https only), so point at a wiki page for what you removed.
     - `"as"` — optional: a name that stands for the family, added in their place, for a family whose base form the source never had. Leave it out where the base is already an entry of its own.
     - `"except"` — optional: names the glob catches but shouldn't. Globs have no negation, and one exception beats a contorted pattern: `"*-Bonbon"` means the species candies, not `"Dynamax-Bonbon"`.
     - `"locked"` — optional: the reader can't switch this rule off. Only for entries that aren't words at all (300 crystals named `★Sgr6879`), where adding them back could only be an accident.
   - `"omittable"` takes the same rules with the opposite default: those entries are **present** unless the reader ticks them off. Use it for legitimate words that someone might still want gone — the 80 species candies are real items, and the first thing to cut if you need room for the Pokémon themselves.
   - `npm run validate` checks the rules against the list: it warns when a rule matches nothing (a stale glob, or a typo) and errors when a rule would swallow its own `"as"`.
   - A **fame group** (`FG 1`, `FG 2`, … in a proposal) is one entry of a group's `"tiers"` array — the schema and the app call these *tiers* (`FG 1` = tier 0). Careful: `"groups"` in the JSON means something else entirely, namely the subtopic that carries its own checkbox (e.g. "Characters").
3. Validate before opening the PR:
   ```bash
   npm install
   npm run validate   # data against the schema + the cross-checks above
   npm run check      # frontend type-check
   ```
4. Open the PR against `main`. The maintainer reviews and merges.

## Option C — help convert a list

Comfortable with JSON and spotted a list posted in the [simple form](#option-a--propose-via-an-issue-preferred)? Turning it into ready-to-paste JSON is a genuine help — such issues carry the `Needs JSON 🧩` label.

1. **Say you're on it** — a quick comment on the original, so two people don't convert the same list. (A maintainer then marks it `Being converted 🔨`)
2. **Hand over the JSON** as a **new issue** that references the original (`Refs #<number>`), or as a PR if you'd rather — **not** a buried follow-up comment, which is easy to lose. **Cross-link both ways** so the thread and the conversion stay connected.
3. **Credit stays shared:** name both the original proposer and yourself in the topic's `credits`.

## Looking for UI proofreaders — Spanish, French, Italian, Japanese, Korean

The interface now speaks nine languages' worth of word lists and seven languages of its own.
Two of those seven were written by people who speak them. **The other five — Spanish, French,
Italian, Japanese and Korean — were machine-written and have never been read by a native
speaker.** They are a starting point, not a translation.

If one of them is yours, we'd be glad of ten minutes of it. What's worth reporting:

- Anything that reads as a machine wrote it, even where it isn't *wrong*.
- The sentences that bend grammar around an inserted language name — the ⚠️ and ℹ️ markers on
  a topic row, where French elides its article and German declines the name. Every language
  does this differently and each dictionary decides for itself.
- Wording that's too long for the control it sits in.

Confirming that a locale reads fine is just as useful as correcting it, and neither fits the
issue templates — so please **[open a blank
issue](https://github.com/Trummler12/custom-wordlists/issues/new)** and say which language
you read. The files are `src/locale/<code>.ts`, one per language, all the same shape.

## Local development

```bash
npm install
npm run dev        # dev server (runs build:index first, then vite)
npm run build      # production build → dist/ (also runs build:index)
npm run validate   # data against the schema + the cross-checks under Option B
npm run check      # frontend type-check
npm test           # unit tests — CI runs this as its own gate
```

## Questions & discussion

Not sure whether something fits, or want a second opinion before writing a full proposal? Open a plain issue and ask — discussion is welcome.
