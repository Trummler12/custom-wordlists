# Wikidata Query Analysis: One Piece

What Wikidata offers for the One Piece topics, and how far it can serve as their source.

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
- ✖️[Animals/Species/Races](#animalsspeciesraces)
- ✖️[Affiliations](#affiliations)
- ✖️[Devil Fruits](#devil-fruits)
- ✖️[Locations](#locations)
- ✖️[Islands](#islands)
- ❌[Episodes](#episodes)
- ➕[Films](#films)
- ✖️[Video Games](#video-games)

## ➕Characters

**Associated List:** [list of One Piece characters (Q83490)](https://www.wikidata.org/wiki/Q83490)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [character](https://www.wikidata.org/wiki/Q95074), [present in work](https://www.wikidata.org/wiki/Property:P1441): [One Piece](https://www.wikidata.org/wiki/Q28667972)

**Check (2026-10-07):** 1,090 characters are linked via *present in work* (P1441); the definition finds 0 without subclasses and 1,036 with them (they are typed *anime character* / *manga character*).  
**Rating:** ➕ (was ✖️): a large share of the named cast.

**Manga-only (2026-10-26, rule `manga-only` as designed in Dragon_Ball.md):** of 1,115 members, 1,079 carry P1441 to an anime work (the TV series Q710324, the films), 36 only to the manga. The 36 are mostly the newest manga arc (Elbaph: Bjorn, Ronja, Skaldi, …), so here the data already draws the line; a few are stale (Nika is in the anime since 2023). The anime's P1441 sits on 1,085 characters, nearly the manga's 1,088, so it may have been copied over in bulk rather than checked per character. No topic of ours yet, so no fame check.
**Anime-original (2026-10-27, rule `anime-original` as in Dragon_Ball.md):** the same P144 line holds: the TV series (Q710324) is *based on* the manga (Q28667972), the films carry no P144, so filler is what sits only in the series and in no manga. The One Piece Wiki has a page per filler arc and TV special that says so, with the episode range (`onepiece.fandom.com/wiki/G-8_Arc`, …: 16 arcs, from Warship Island, episodes 54 to 61, to Uta's Past, 1029 to 1030), and per anime-only character (Apis, Jonathan, Jessica, Shuzo, …); a reference site, not an official one, for the node's own pass. one-piece.com has no page per film to cite. Found through Gemini's Deep Research (`_data/Prompts/done/Animation_Anime_Comics.md`, Answer 2c, task 2), whose pages were checked one by one.
**Data for it:** already there. The wiki files its anime-only characters under *Non-Canon* categories (820 pages, films and games included); matched against the 1,333 members by Fandom ID or label, 50 carry P1441 to the TV series alone (Apis, Jonathan, Jessica, Shuzo, …), which is exactly what the rule reads, and others carry P1441 to a film alone (Film: Gold, Stampede), so they show as works of their own. The non-canon characters without an item need none, since the rule hides them. A Deep Research run on this task alone (`_data/Prompts/done/Anime_Filler_and_Toei_Names.md`) added nothing: the same 16 arcs, and only one character, Jonathan.

## ✖Animals/Species/Races

**Associated List:** -  
**Definition:** -  
**Assessment:** No lists defined yet

## ✖Affiliations

**Associated List:** -  
**Definition:** -  
**Assessment:** No list defined yet

## ✖Devil Fruits

**Associated List:** -  
**Definition:** -  
**Assessment:** No list defined yet  
**Associated Class:** [Devil Fruit (Q1156774)](https://www.wikidata.org/wiki/Q1156774)

**Check (2026-10-07):** The class Devil Fruit (Q1156774) has no instances: the individual fruits are not on Wikidata.

**Batch (2026-11-12):** `_data/QuickStatements/2026-11-12_one-piece-devil-fruits-create_PRE2.txt`, 210 fruits from the One Piece Wiki: the English name as label, the Hepburn name as alias, P31 the type (Paramecia, Zoan, Logia), P1441 manga and anime, English localized names per release and German names per manga / TV as *official name* (P1448) with *applies to work* (P10663); model and sources in `_data/Prompts/done/One_Piece_Devil_Fruits.md`. Users (P2563) follow after the import. Rating then ➕.

**Zoan labels (2026-11-13, Trummler):** the ja label is the common spelling without quotation marks (*イヌイヌの実 モデル 狼*); the quoted spellings the wiki gives (「」, “”, "") stay as alias and as *official name*. 14 labels changed in `2026-11-13_one-piece-zoan-labels-nidhoggr.txt`; the en labels follow the manga release (Viz), as before.
**Users (2026-11-12):** 155 links in `POST2_one-piece-fruit-users`; of the 55 users without a match, Marco (wiki title now *Polo Marco*), Accino and Largo had items under another name (`one-piece-fruit-users-existing`), 48 are created from the One Piece Wiki infoboxes (`one-piece-fruit-users-create_PRE4`: canon ones with manga + anime, filler with anime, film and game characters with their work, stage-show characters with universe + franchise only; non-canon marked in the description) and linked in `POST4`. Left out: *Bounty* (a concept, not a user), *Dama's tablet* (no page), *Peketan* (only in a crew article), Imu (fruit unknown).

## ✖Locations

**Associated List:** -  
**Definition:** -  
**Assessment:** No list defined yet

**Check (2026-10-07):** 18 fictional locations are linked.  
**Rating:** stays ✖️.

## ✖Islands

**Associated List:** -  
**Definition:** -  
**Assessment:** No list defined yet

## ❌Episodes

**Associated List:** [list of One Piece episodes (Q5269483)](https://www.wikidata.org/wiki/Q5269483)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [television series episode](https://www.wikidata.org/wiki/Q21191270), [part of the series](https://www.wikidata.org/wiki/Property:P179): [One Piece](https://www.wikidata.org/wiki/Q710324)  
**Assessment:** Barely anyone knows individual Episodes’ Titles.

## ➕Films

**Associated List:** [list of One Piece films (Q61721857)](https://www.wikidata.org/wiki/Q61721857)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [animated feature film](https://www.wikidata.org/wiki/Q29168811), [part of the series](https://www.wikidata.org/wiki/Property:P179): [One Piece](https://www.wikidata.org/wiki/Q4431905)

**Check (2026-10-07):** 10 films are linked via *part of the series* (P179), but none is typed *animated feature film* as the definition expects, so its query finds 0.

**Check (2026-11-03):** 10 films by the definition (P179 Q4431905), against 17 on the One Piece Wiki (`onepiece.fandom.com/wiki/Category:One_Piece_Movies`). Batch `2026-11-03_one-piece-films.txt` (14 commands, imported and verified 2026-11-03) adds the link to *Clockwork Island Adventure*, *Chopper's Kingdom*, *Episode of Chopper Plus*, *3D: Mugiwara Chase*, *Film: Red* and the announced *God Valley* and *Baad*. **Candidate rule:** `upcoming` (omitted): a film dated in the future (2027, 2029). TV specials (*Heart of Gold*) stay out, as Wikidata has them.
**Rating:** ➕ (was 🔵).

## ✖Video Games

**Associated List:** [list of One Piece video games (Q2628654)](https://www.wikidata.org/wiki/Q2628654)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [video game](https://www.wikidata.org/wiki/Q7889), [part of the series](https://www.wikidata.org/wiki/Property:P179): [One Piece](https://www.wikidata.org/wiki/Q13199126)

**Check (2026-10-07):** 16 games are linked (via P179 to the series or *media franchise* P8345 = One Piece, Q673), far below the One Piece games released.  
**Rating:** ✖️ (was 🔵).

## [to Navigation](#navigation)
