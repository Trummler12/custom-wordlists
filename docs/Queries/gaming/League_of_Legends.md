# Wikidata Query Analysis: League of Legends

What Wikidata offers for the League of Legends topics, and how far it can serve as their source.

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Navigation

[Gaming](../README.md#gaming)
- ➕[Champions](#champions)
- ❓[Legacy Champions](#legacy-champions)
- ✖️[Characters](#️characters)

## ➕Champions

**Associated List:** -  
**Definition:** -  
**Assessment:** No list defined yet for Champions in particular

**Check (2026-10-07):** 164 characters are linked to League of Legends (Q223341) via *present in work* (P1441), and 164 of our 173 champions are among them. Missing: Fizz, Briar, Hwei, Locke, Mel, Milio, Naafiri, Smolder, Zaahen (mostly the newest). They are typed variously (*character*, *video game character*, *yordle*, *vastaya*, …), so a query should go by the P1441 link, not by a class.  
**Rating:** ➕ (was ❓).

**Built from** `data-raw/gaming/League of Legends/Champions by Fame.txt` (Sporcle guess rates), names in en and de only.  
**Tool:** `_scripts/lol.mjs` (output `_data/lol-run1.txt`).

**Check (2026-10-09):** 175 items are linked to League of Legends (Q223341) or its universe (Q66364628); 172 carry both P1441 and P1080, so either property finds them. 164 of our 173 champions match by English name. Riot's Data Dragon (`ddragon.leagueoflegends.com`, version 16.20.1) lists exactly our 173.

**Missing on Wikidata:** Ambessa exists as *Ambessa Medarda* (Q131611215), her full name from Arcane, so only the alias is missing. Briar, Hwei, Locke, Mel, Milio, Naafiri, Smolder and Zaahen have no item at all (no *Mel Medarda* either). The 164 others are items of the same kind (0 sitelinks for 151 of them), so the eight are created in the same shape: *video game character*, P1441 League of Legends, P1080 the universe, each referenced to the champion's official page (checked: those pages answer, a made-up name gets 404).

**Classes:** mostly *character* (125) or *video game character* (43), beside *yordle*, *vastaya*, *fictional human* and a dozen others, so a class query is no option; the P1441 link is.

**Fame:** sitelinks can't rank them (median 0, maximum 14). Sporcle stays.

**Labels:** Wikidata names the champions in ja (157), ko (162) and ru (154), elsewhere hardly at all (de 17, fr 12, zh-Hant 11, zh 10, es 8, zh-Hans 0). Five carry a disambiguator (fr Caitlyn, Warwick; it Viktor; vi Jinx, Vi), and so does it *Pentakill (gruppo musicale)*; batched.  
**The better name source is Riot's own:** Data Dragon publishes every champion's official name in 28 locales (cs, de, el, es, fr, hu, id, it, ja, ko, pl, pt-BR, ro, ru, th, tr, vi, zh-CN, zh-TW, …), one request per locale. It covers what our list lacks (ja, ko, zh-Hans, zh-Hant, ru, el and the rest) with official names, which Wikidata can't match.

**Wikidata batches from this pass** (imported and checked on the items 2026-10-10: the eight new items are Q141680380 to Q141680399, each with its references; files in `_data/QuickStatements/imported/`):

| Batch | Edits | What |
| :---- | ----: | :---- |
| `2026-10-09_lol-champions-create.txt` | 49 | eight new champion items (label, description, three referenced statements each) and the alias *Ambessa* on Q131611215 |
| `2026-10-09_lol-labels-disambiguators.txt` | 12 | the six labels above without the disambiguator; the former ones kept as aliases |

**Rating:** ➕ stands: membership complete after the batch, by the P1441 link. Names come better from Data Dragon, fame from Sporcle.

<!-- @agent(#35) from #38 · 2026-10-09 · OPEN
Decided: LoL champions checked (this file, Champions). Membership on Wikidata is complete: the creation batch is imported (2026-10-10), all 173 champions carry P1441 League of Legends; fame stays with Sporcle.
Ask: for the names, consider Riot's Data Dragon instead of Wikidata: https://ddragon.leagueoflegends.com/cdn/<version>/data/<locale>/champion.json gives the official name of all 173 champions in 28 locales (versions at /api/versions.json, locales at /cdn/languages.json); our list carries en and de only.
Refs: this file, Champions
-->

## ❓Legacy Champions

**Associated List:** -  
**Definition:** -  
**Assessment:** No list defined yet for Champions in particular

## ✖️Characters

**Associated List:** [list of League of Legends characters (Q17042404)](https://www.wikidata.org/wiki/Q17042404)  
**Definition:** -  
**Assessment:** List lacks definition

**Check (2026-10-07):** Still no P360 definition; the 164 linked characters are the champions.

## [to Navigation](#navigation)
