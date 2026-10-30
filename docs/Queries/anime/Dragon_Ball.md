# Wikidata Query Analysis: Dragon Ball

What Wikidata offers for the Dragon Ball topics, and how far it can serve as their source.

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Navigation

[Anime](../README.md#anime)
- ➕[Characters](#characters)
- ✖️[Locations](#locations)
- ❌[Episodes](#episodes)
- 🔵[Films](#films)
- ✖️[Video Games](#video-games)

## ➕Characters

**Associated List:** [list of Dragon Ball characters (Q2365866)](https://www.wikidata.org/wiki/Q2365866)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [character](https://www.wikidata.org/wiki/Q95074), [present in work](https://www.wikidata.org/wiki/Property:P1441): [Dragon Ball](https://www.wikidata.org/wiki/Q15051307)

**Check (2026-10-07):** 156 characters are linked to Dragon Ball, its series, universe or franchise (mostly via *from narrative universe*, P1080); the definition alone finds 0 without subclasses and 26 with them. All 24 of our Dragon Ball Z entries are among them.  
**Rating:** ➕ (was ✖️).

**Second check (2026-10-26):** 187 characters with the query below: the franchise *Dragon Ball* (Q2020, by P8345, P1441 or, on 38 items, P1080), the universe (Q3551230, P1080), or a work of the franchise (P1441: the manga Q15051307, the anime series, films, games). Per series Wikidata is thin: P1441 *Dragon Ball Z* (Q477916) on 53 characters, *Super* (Q19839121) on 49, *GT* on 28. And our list isn't DBZ-only: Beerus comes from *Super*, Broly from the films.
**Structure (decided by Trummler, 2026-10-27):** `anime/dragon-ball/` (one universe, `characters.json`) instead of `dragon-ball-z/`: a topic per series can't be drawn from Wikidata, and our list already spans the franchise. The series come back as a filter instead (*Present in*, below).
**Fame:** Spearman 0.83; tier 1 at ranks 1 to 12, tier 2 at 3 to 21, tier 3 at 14 to 43 (Gotenks 97: the fusions rank low).
**Gaps in our list:** Chi-Chi, Bardock, Videl, Pan, Vegito, Grandpa Gohan, Zamasu, Pilaf, Shenron, Mr. Popo (ranks 15 to 33, all above our tier 3's lowest).
**Guests:** the *Dr. Slump* cast (Arale, Senbei, Gatchan, from the episodes in Penguin Village) comes along: the franchise item *Dr. Slump* (Q18008936) carries P8345 *Dragon Ball* and P1434 the Dragon Ball universe, both unreferenced, and Arale herself P8345 *Dragon Ball*. As with Disney's guests, members whose own franchise is another are no entry; whether *Dr. Slump* belongs to the Dragon Ball franchise at all is a modelling question on Wikidata, not an objective error.
**Manga-only (rule `manga-only`, 2026-10-26):** sorted by their P1441 works, 117 members point at an anime work (series, film, special), 6 at manga only, 56 at the franchise or universe alone, 2 at games only. The 6 are no reliable class: Grandpa Gohan is in the anime, Moro is in the *Super* manga only. So the rule's data path is P1441 to an anime work of the franchise, and the gap is the 64 members without one. A mention is enough for an entry (Trummler), so the rule needs no mention / appearance split: P1441 to the anime work covers both. Sources for the missing links: the official anime sites render their character pages by script (Toei, dragon-ball-official.com), so they go to Gemini (`_data/Prompts/done/Anime.md`).
**Query:**
```sparql
SELECT DISTINCT ?item WHERE {
  { ?item wdt:P8345|wdt:P1441|wdt:P1080 wd:Q2020 } UNION { ?item wdt:P1080 wd:Q3551230 }
  UNION { ?item wdt:P1441 ?work . ?work wdt:P8345|wdt:P179|wdt:P144 wd:Q2020 . }
  ?item wdt:P31/wdt:P279* wd:Q95074 .
}
```
`manga-only` = no `?item wdt:P1441 ?anime` where `?anime` is a work of the franchise typed (with subclasses) *anime television series* (Q63952888), *anime film* (Q20650540), *original video animation* (Q220898) or *television special* (Q1261214).

**Present in (planned, Trummler 2026-10-27):** a new section of the inclusion panel, one checkbox per sub-series: *Dragon Ball*, *Z*, *GT*, *Z Kai*, *Super*, *Daima*, *Super Dragon Ball Heroes* checked, *Dragon Ball Movies* unchecked. An entry shows when at least one checked series holds it. That is the union logic the app already has for the languages' type panel (the INCLUDE control, `INCLUDE_ICON` in `src/lib/omitted.ts`): overlapping rules, an entry shown as soon as one rule covering it is ticked, and a base box for the entries no rule covers (here the manga- or game-only ones). Three changes would make it fit, all #35's: the include icon is one hard-coded key (`language-type`), so it needs to become a set or a flag per rule; its rules are always unticked by default, while *Present in* starts with all but *Movies* ticked; and, optionally, a series may list the entries absent instead of those present (`absent`), whichever is shorter (short present lists for Daima, Heroes and the films, short absent lists for Z, Kai and Super, which hold most of the cast). Both mean the same, so the choice is the build's alone.
**Data for it:** P1441 per series is still thin: of 181 members, *Super* 77 (+16 by the batch below), *Z* 48, *GT* 27, *Dragon Ball* (1986) 26, *Z Kai* 16, *Super Dragon Ball Heroes* 2, *Daima* 1; the films a handful each. Kai is Z recut without the filler, so its list is Z's minus the filler characters. The sources: Toei's official character pages for *Super* list about 150 names (`toei-anim.co.jp/tv/dragon_s/chara/`, plus one page per universe under `chapter4/no01.html` to `no12.html`), static and readable; the pages for *Dragon Ball* and *Z* (`lineup.toei-anim.co.jp/ja/tv/dragon/character/`, `…/dragonz/character/`) build their list by script, and *GT*'s shows the names as images.
**The model (2026-10-27, after Trummler's review):** everything the rules need fits two kinds of statements Wikidata already uses, so nothing has to be kept by hand:
- **Per character, P1441 per work:** the manga (*Dragon Ball* Q15051307, *Dragon Ball Super* Q64230248, *Jaco the Galactic Patrolman* Q15984037) and every anime work it appears or is named in (the series *Dragon Ball* Q239506, *Z* Q477916, *Z Kai* Q704651, *GT* Q735669, *Super* Q19839121, *Daima* Q123022503, *Super Dragon Ball Heroes* Q55096093, each film and special). P1441 reads "appears in that work as part of the narration", so a named mention counts, as Trummler wants; Wikidata has no separate property or common qualifier for mentions.
- **Per work, *based on* (P144), already there:** the series *Dragon Ball* and *Z* point at the manga (Q15051307), *Z Kai* at *Z*; the films at the franchise (Q2020, referenced), *Super Dragon Ball Heroes* at the game; *GT*, *Daima* and the *Super* anime at nothing. That is exactly the line between an adaptation (whose extra characters are filler) and a work of its own. The first plan, *has characteristic* (P1552) *original anime* (Q104640199, the convention on 48 works, referenced to AniDB's "original work" tag), is dropped: the databases disagree on what it means here. AniList calls nearly every Dragon Ball work "source: manga", *GT* and the 1990s films included, and only *Resurrection 'F'*, *Super Hero* and *Daima* "original"; AniDB refuses scripted requests, so its tag can't be checked. P144 needs no new data.

The manga has no split into Classic and Z: it is one series of 42 volumes, and *Z* exists only as the anime's title (and VIZ's English edition from volume 17). Wikidata holds no volume, chapter or arc items for it either, so the manga stays one work, *Super*'s manga a second.
**The rules on top:**
- *Present in* gets a box per manga as well: *Dragon Ball (manga)* and *Dragon Ball Super (manga)*. Unticked, they hide exactly the manga-only entries (an entry shows when any ticked work holds it), so the spoiler rule `manga-only` needs no logic of its own: it is the manga boxes' default. Trummler wants it hidden by default (spoilers), so both manga boxes start unticked.
- `anime-original` (renamed from `anime-only`, Trummler 2026-10-27) stays an `omitted` rule: it hides the filler, entries whose P1441 works are all adaptations of a manga of the franchise (P144, followed through *Kai* => *Z* => manga) while the entry itself is in no manga (Princess Snake in *Z*). Entries of works of their own (*GT*, *Heroes*, *Daima*, the films) are left to *Present in*; one that has both (Pikkon: *Z* filler and *Fusion Reborn*) is no filler and shows with *Z*. The ℹ️ text lists the adapting works, generated from P144; `non-canon` / `anime-original` as a topic field is then the build's output, not an input.
**Data for it:** P1441 to the manga sits on 27 members (the original manga) and 2 (*Super*'s); the per-series counts are above. Only P1441 per work is missing. Gemini's Deep Research (`_data/Prompts/done/Animation_Anime_Comics.md`, task 1) gave no usable row in three runs: homepages, then series front pages and kanzenshuu.com pages that don't exist, then, run alone (`Dragon_Ball_Works.md`), real pages but mostly Wikipedia, which Wikidata doesn't take, and Anime News Network's series pages, whose cast lists use the Japanese forms (Kuririn). ANN per work is the source: its encyclopedia page per title lists the cast with the role names as text, in each dub's own form (Kuririn, Krilin, Crilin, Sangoku), and every one of its 37 "Dragon Ball" titles but three (*Super: Beerus*, a 1988 short, the Kai rerun) has an item with its ID (P1985). Matched against the members' labels and aliases in any language, a role either names one member, or several (Gohan, Piccolo: left out), or none (mostly one-film characters without an item, and narrators).
**Batch** (`2026-10-29_dragonball-ann-1.txt` to `-15.txt`, 50 commands each, the last 16, imported and verified 2026-10-29, 358 of 358): 358 P1441 links from a member to a work whose ANN cast names them, referenced to that ANN page, over 34 works (films, specials, the series); one match is left out by hand: "Kogu" in *Bojack Unbound* is Bojack's henchman, while the Italian alias Kogu sits on Korin.
Still: Toei's per-series pages other than *Super*'s render by script, and *Daima*'s (`dragonballdaima.com/en/character.html`) loads its list from an API.
**Batch** (`2026-10-27_dragonball-super-toei.txt`, imported and verified 2026-10-27, 16 of 16 links and all 13 labels): P1441 *Dragon Ball Super* for 16 characters Toei lists (Piccolo, Chi-Chi, Majin Buu, Pilaf, Champa, Sorbet, Vados, Monaka, Frost, Botamo, Auta Magetta, Basil, Lavender, Bergamo, Dyspo, Top), and 13 Japanese labels as Toei writes them, one of them a fix: Top is トッポ, not トップ.
**Batch** (`2026-10-29_dragonball-super-names-1.txt` and `-2.txt`, 50 and 41 commands, imported and verified 2026-10-29, all 434 lines, 65 new items without a duplicate): the 71 further names Toei lists, most of them Tournament of Power fighters. 6 already have an item: Katopesla carries P1441 already (Toei writes カトぺスラ with a hiragana ぺ, so the match missed it). Tagoma, Jaco, Cabba, Marcarita and Kale had no Japanese label; they get it, plus P1441 and, where missing, P31. The other 65 are created: P31 *anime character* (Q80447738) and P1441 *Dragon Ball Super*, both referenced to the Toei page that lists the name (`chapter4/noNN.html` per universe, the main page for Tagoma and Jaco); the Japanese label as Toei writes it; and the English name from the Dragon Ball Wiki with its Fandom ID (P6262 `dragonball:…`). The wiki's page title follows the dub (~, from its own notes: K'nsi "pronounced kin-shee in the dub", Roasie "spelled Rozie … like the manga"), and its infobox carries the Japanese name, which ties each English name to its Toei one. The wiki's manga name (VIZ), where it differs, goes in as an alias. Mosco's page is titled Mule, his real form; the item takes Mosco, Toei's name, with Mule as an alias (a regular Gemini request, `_data/Prompts/done/English_Names_Check.md`, found no page that settles it). The names were found through Gemini's Deep Research (`_data/Prompts/done/Anime_Filler_and_Toei_Names.md`), whose dub names were right in 64 of 71 rows; its pages and manga names were taken from the wiki instead.

## ✖Locations

**Associated List:** [Locations of Dragon Ball (Q3238315)](https://www.wikidata.org/wiki/Q3238315)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [fictional location](https://www.wikidata.org/wiki/Q3895768)  
**Assessment:** List definition is incomplete

**Check (2026-10-07):** Only 6 fictional locations are linked; the definition has no qualifier and matches every fictional location (259 / 11,892).  
**Rating:** stays ✖️.

## ❌Episodes

**Associated List:** [list of Dragon Ball episodes (Q436953)](https://www.wikidata.org/wiki/Q436953)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [television series episode](https://www.wikidata.org/wiki/Q21191270), [part of the series](https://www.wikidata.org/wiki/Property:P179): [Dragon Ball](https://www.wikidata.org/wiki/Q239506)  
**Assessment:** Barely anyone knows individual Episodes’ Titles.

## 🔵Films

**Associated List:** [list of Dragon Ball films (Q909572)](https://www.wikidata.org/wiki/Q909572)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [film](https://www.wikidata.org/wiki/Q11424), [part of the series](https://www.wikidata.org/wiki/Property:P179): [Dragon Ball](https://www.wikidata.org/wiki/Q16515139)

**Check (2026-10-07):** 24 films via *part of the series* (P179) = Dragon Ball (Q16515139). Not yet compared with the real number.

## ✖Video Games

**Associated List:** [list of Dragon Ball video games (Q371057)](https://www.wikidata.org/wiki/Q371057)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [video game](https://www.wikidata.org/wiki/Q7889), [part of the series](https://www.wikidata.org/wiki/Property:P179): [Dragon Ball](https://www.wikidata.org/wiki/Q16515147), [takes place in fictional universe](https://www.wikidata.org/wiki/Property:P1434): [Dragon Ball universe](https://www.wikidata.org/wiki/Q3551230), [media franchise](https://www.wikidata.org/wiki/Property:P8345): [Dragon Ball](https://www.wikidata.org/wiki/Q2020)

**Check (2026-10-07):** The definition's three qualifiers together match nothing; 20 games are linked via *media franchise* (P8345) or the series, far below the Dragon Ball games released.  
**Rating:** ✖️ (was 🔵).

## [to Navigation](#navigation)
