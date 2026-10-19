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

**Name forms beyond short / long (proposal, 2026-10-10; Trummler's idea, worked out here, for #35 to judge):** some champions had another name before (*Nunu*, now *Nunu & Willump*), and the lore gives many a full name (*Luxanna Crownguard* for *Lux*). A former name is no omission, it is a variant of the same entry. No champion has a short form.

- **Data:** the current name stays `pref`, a full name goes into `long`, a former one into a new form `old` (a string, or a list where there were several: a country can have more than one). `old` falls back to `pref` like `short` and `long` do, so picking it gives the former name where there was one and the current one everywhere else.
- **Dropdown from the data:** the options follow the forms the group's entries carry, instead of always showing short / long / both. LoL would offer pref, full, legacy, both, all; no short, which no champion has. Order: pref, short, long, old, both, all.
- **Labels by locale key, not by field:** a group may name a form differently, `formLabels: { long: "full" }`, which picks `names.form.full` and `names.formHint.full` from the locale files, so every language keeps its translation. For South Park the hint already reads "Prefer full/official names"; only the short label would change. A wording no locale has could come as a localized string in the topic, like its title, but that's for when a topic needs it.
- **`both`:** every explicit named form the group has (pref, long, old), deduplicated, as today. Its hint is then built from the forms present (Trummler's ternary on `names.formHint.both`), e.g. "full AND legacy names".
- **Sources:** Riot's Data Dragon has neither. `_data/Prompts/done/LoL_Champion_Names.md` asked Gemini for both, with patch notes and Riot's lore pages as sources. On Wikidata the full name would go to *birth name* (P1477) or *name* (P2561), the former one to an alias; not needed for the build, which can take the research directly.
- **Research (2026-10-10), checked against Riot's own champion biographies** (`universe-meeps.leagueoflegends.com/v1/en_us/champions/<slug>/index.json`, the data behind `universe.leagueoflegends.com/en_US/champion/<slug>/`; Gemini's URLs were made up and answer 404):
  - **Former names:** only *Nunu* => *Nunu & Willump*, patch 8.17 (2018); the archived patch notes confirm it (`web.archive.org/web/20180906142104/https://na.leagueoflegends.com/en/news/game-updates/patch/patch-817-notes`). Nilah's bio says she once had another name, without giving it.
  - **Full name stated in the bio:** Khada Jhin, Sarah Fortune, Jericho Swain, Tobias Felix (Twisted Fate), Katarina Du Couteau (capital *Du*), and three Gemini missed: Caitlyn Kiramman, Ambessa Medarda, Xan Irelia (family name first).
  - **Given name or family in the bio, not the full name:** Lux (*Luxanna*, the Crownguard family), Garen (Crownguard), Fiora (Laurent), Cassiopeia (Du Couteau), Camille (Clan Ferros), Sona (taken in by the Buvelles), Akali (daughter of Mayym Jhomen Tethi), Orianna (Corin Reveck's), Vayne (*Shauna*). Usable where a full name is the obvious join; a stated one is better.
  - **Rejected after a follow-up** (Gemini gave no URL this time): Annie Hastur and Yorick Mori are pre-2014 / pre-2016 lore that Riot replaced; Talon took the Du Couteau name only in fan usage; *Konte* is the family Riven lives with in her story (*Asa Konte*), not her name; *Lightshield* appears nowhere on Riot's current champion or Demacia pages, so Jarvan IV stays without one.
  - **Mel Medarda:** her bio has her called *a Medarda*, and Arcane uses the name; a full name like Ambessa's. Nilah's former name is given nowhere.
  - **Result for `long`:** stated by Riot: Khada Jhin, Sarah Fortune, Jericho Swain, Tobias Felix, Katarina Du Couteau, Caitlyn Kiramman, Ambessa Medarda, Xan Irelia; joined from the bio's given and family name: Luxanna Crownguard, Garen Crownguard, Fiora Laurent, Cassiopeia Du Couteau, Camille Ferros, Mel Medarda, Shauna Vayne. Left out as not plainly stated: Akali, Sona (adopted), Orianna. For `old`: Nunu.
  - **Side find:** Universe lists 174 champions, Data Dragon 16.20.1 (and our list) 173; the extra one is *Norra* (dated 2026-02-12 on Universe). Worth watching for the next roster check.
- **Later, countries (PR #39):** *Swaziland*, *Burma*, *Zaire* are the same pattern, several per entry in places; German *Weißrussland* is a change in one language only, which Wikidata keeps as no more than an alias. That's where a single dropdown stops being enough.

<!-- @agent(#35) from #38 · 2026-10-10 · OPEN
Decided: Trummler wants former names as a variant, not an omission (LoL first, countries later).
Ask: please judge the proposal above (the `old` form, a dropdown built from the forms present, `formLabels` by locale key, `both` over every named form) on the technical side; Trummler wants to discuss it with you.
Refs: this file, Champions, "Name forms beyond short / long"; _data/Prompts/done/LoL_Champion_Names.md
-->

## ❓Legacy Champions

**Associated List:** -  
**Definition:** -  
**Assessment:** No list defined yet for Champions in particular

**Open (2026-10-10):** not settled by the `old` form; Trummler discusses the topic in PR #39, perhaps before its phase Z.

## ✖️Characters

**Associated List:** [list of League of Legends characters (Q17042404)](https://www.wikidata.org/wiki/Q17042404)  
**Definition:** -  
**Assessment:** List lacks definition

**Check (2026-10-07):** Still no P360 definition; the 164 linked characters are the champions.

## [to Navigation](#navigation)
