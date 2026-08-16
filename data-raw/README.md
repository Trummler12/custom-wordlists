# Raw source dumps

Unprocessed material the curated lists in [`data/topics/**`](../data/topics) were built from — mostly plain name lists pasted out of wikis and reference pages, one file per language, sometimes with the URL they came from on the first line.

**The app never reads any of this.** Only `data/topics/**` is loaded; nothing here is built, validated or deployed. It is kept because re-deriving a list is far easier with the original dump at hand than by scraping the same page again a year later.

A few things follow from that:

- **Not maintained.** These files are snapshots. When a curated list is corrected, the dump it came from is usually left alone — `data/topics/**` is the source of truth.
- **Not schema-checked.** Formatting varies with whatever the source page happened to produce: numbered lists, stray headings, duplicates.
- **More languages than the app offers.** Some dumps carry Japanese, Korean, Chinese, French, Italian and Spanish. That's raw material for later, not a promise — see the [language roadmap](../docs/Language-Roadmap.md).

If you want to propose or fix a list, work from [CONTRIBUTING.md](../CONTRIBUTING.md) instead; adding a dump here is optional and only worth it when it saves the next person the lookup.
