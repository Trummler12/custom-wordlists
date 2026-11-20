# Raw source data

The material the curated lists in [`data/topics/**`](../data/topics) are built from. **The app never reads any of this**: only `data/topics/**` (and the generated `data/index.json` and `data/coverage/`) ships to the site.

It comes in two kinds, which are handled differently:

- **Generated dumps** (JSON and TSV files, mostly under `geography/`, `science/` and `sports/`): written by the 🔒 dump scripts in [`scripts/`](../scripts/README.md) from Wikidata and other structured sources, and read back by the matching build scripts. They are kept in the repo so a re-dump shows up as a reviewable diff. **Don't hand-edit them**; the next dump overwrites the change. The few hand-maintained files that sit beside them (such as `geography/countries/name-overrides.json` and `name-abbreviations.json`) are named in the scripts README.
- **Pasted snapshots** (plain `.txt` lists, e.g. under `animation/` and `gaming/`): name lists copied out of wikis and reference pages, one file per language, sometimes with the source URL on the first line. They are not maintained: when a curated list is corrected, the snapshot it came from is usually left alone, since `data/topics/**` is the source of truth. Formatting varies with whatever the source page produced (numbered lists, stray headings, duplicates). They are kept because re-deriving a list is far easier with the original at hand than by scraping the same page again a year later.

If you want to propose or fix a list, work from [CONTRIBUTING.md](../CONTRIBUTING.md) instead; adding a snapshot here is optional and only worth it when it saves the next person the lookup.
