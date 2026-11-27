# Wikidata Query Analysis: Naruto

What Wikidata offers for a Naruto topic, and what it would take to make it the source. A topic since 2026-11-16 (Trummler): Characters, Locations, Affiliations and Abilities. This file holds the first analysis; batches follow the model below.

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
- [Model (proposed)](#model-proposed)
- [Decided](#decided-trummler-2026-11-16)
- [Researched](#researched-2026-11-16)
- [Open](#open)

## ➕Characters

**Official source:** the results site of the worldwide character poll *NARUTOP99* (`narutop99.naruto-official.com`, in ja, en, de, fr, es, it). Its page loads the data as script files, read here directly:
- `_chars.gen.js`: **488 characters**, each with the Japanese name, its kana reading, the English name, a **group** (*principal* 17, *main* 88, *sub* 187, *mob* 196) and a **village** (木ノ葉 Leaf 219, 砂 Sand 45, 雲 Cloud 32, 霧 Mist 28, 岩 Stone 23, その他 other 141).
- `_ranking.all.gen.js` and one file per world region: rank and **vote count** for all 488 (first: Minato Namikaze, 792,257 votes; last: 26 votes).
- Copies: `_data/naruto/chars.json`, `ranking-all.json`.

The site names only *Naruto* and *Naruto Shippuden* characters (manga and anime, filler included); *Boruto* is outside it. It has no page per character, so the results page is the one reference for all of them.

**Works on Wikidata:** franchise Q642, manga Q26971382, anime *Naruto* Q25929253 and *Naruto: Shippūden* Q12500134, universe Q1088263; *Boruto* as franchise Q25922646, manga Q100774936 and anime Q100774832.

**Check (2026-11-16, `_data/naruto/wd.json`, `matched.json`):** 186 items hang on the franchise (P1441 to a work, P1080 the universe, or P8345 with a character class). Matched against the 488 by Japanese or English name:

| Group | Official | On Wikidata | Missing |
| --- | ---: | ---: | ---: |
| principal | 17 | 17 | 0 |
| main | 88 | 62 | 26 |
| sub | 187 | 34 | 153 |
| mob | 196 | 4 | 192 |
| **all** | **488** | **117** | **371** |

- **Missing among *main*:** the Cloud ninja (Omoi, Karui, Samui, Cee, Atsui), Pain's six bodies, tailed beasts and summons (Gyuki, Katsuyu, Enma, the Ten Tails), early Kage (the First and Second Kazekage), Hanabi Hyuga, Mito Uzumaki, Indra and Hamura Otsutsuki.
- **Four names hit two items**, since the Akatsuki group item carries its members as aliases (Kakuzu, Hidan, Kisame, Zetsu): a fix for the group item, not a gap. The four are ja aliases of *Akatsuki* (Q308939): ゼツ, 角都, 飛段, 干柿鬼鮫, each a member with an item of his own. QuickStatements can't remove aliases, so this is a hand edit.
- **On Wikidata but not in the poll (72):** the *Boruto* cast (Boruto, Sarada, Kawaki, Mitsuki …), film and filler characters (Temujin, Sora, Yūkimaru), groups (Sound Four, Team 8), and things that are no characters: techniques (Rasengan, Sharingan), lands, titles (Hokage), two theme songs. The topic's query has to keep these apart by class.
- The 371 are a first count by name; before any CREATE each one gets a full-text search, as an item may exist under another spelling.

**How the existing items are modelled:** P31 *anime character* (Q80447738, 136) and *manga character* (Q87576284, 123), mostly with *fictional human* (118); P1080 the Naruto universe (176); P1441 to the franchise itself (86), the manga (70), the two anime (49, 48) and *Boruto* (31); P106 *fictional ninja* (Q76451138, 102); P463 for groups (Akatsuki 11, the Seven Ninja Swordsmen 6). 135 carry a gender, 96 a voice actor, 174 a ja label, 155 a de label. **The villages have no items** (only the lands: Land of Fire, Wind, Water, Lightning, Sound), so no existing item says where a ninja belongs.

**Rating:** ✖️ as it stands (a quarter of the official cast; every lead is there). With the batches below ➕.

## Model (proposed)

Following My Hero Academia and JoJo (`anime/My_Hero_Academia.md`, `anime/JoJo.md`):

- **Characters:** one item each. Labels: ja and en from the site, de equal to en where the German page shows the same name. The site writes titles into some names (*我愛羅(五代目風影)* / *Gaara(Fifth Kazekage)*): the label is the bare name, the form with the title an alias. P31 *anime character* + *manga character* (+ *fictional human* where it is one; summons and tailed beasts get their kind), P1080 the universe, P1441 manga and both anime, P106 *fictional ninja* for the ninja, P1814 the kana reading, the results page as reference.
- **Villages:** five village items (Konohagakure, Sunagakure, Kirigakure, Kumogakure, Iwagakure) as *fictional village*, each *located in* its existing land; characters link by *residence* (P551), see *Researched*. This gives the topic a filter per village, straight from the official data.
- **Groups in the list** (*The Demon Brothers*, Pain's six paths, *Sakon and Ukon*): *group of fictional characters*, as Wikidata already has it for the Sound Four; members by P527 where they have items of their own.
- **Name parts** (family and given name items), as for My Hero Academia: later, once the characters exist.
- **Fame:** the site's own grouping goes on the items as *narrative role* (see *Researched*). The vote counts have no place on Wikidata and go to the build as a side file (`_data/naruto/ranking-all.json`), beside the sitelink counts.
- **Rules (candidates):** `anime-original` for filler characters (P1441 the anime but not the manga), as designed for Dragon Ball; `boruto` (omitted) for characters that appear only in *Boruto*.
- **Sibling topics, if wanted:** Jutsu, Clans, Tailed Beasts. Wikidata has only fragments (Rasengan, Sharingan, the Uchiha and Hyūga clans, one *Bijū* item), so each would be a CREATE project of its own, like the Quirks.

## Decided (Trummler, 2026-11-16)

- **Topics:** on the analysis level, everything that suits a drawing topic: **Characters** (tailed beasts included), **Locations** (lands, villages and whatever else there is, in omittable groups), **Affiliations** (clans, ranks, positions, organisations) and **Abilities** (jutsu and the like). More may turn up.
- **Depth:** all 488 characters; the official grouping goes on the items, so that *mob* can become an omitted rule.

## Researched (2026-11-16)

- **The official grouping as a statement:** *narrative role* (P5800) is the property (protagonist 1,334 uses, *minor character* Q27623618 1,145, *supporting character* Q2595584 1,084, *main character* Q12317360 677), nearly always with *applies to work* (P10663, 8,758 uses). The poll's four groups map to three of its values, and *object named as* (P1932) keeps the site's own word, so *sub* and *mob* stay apart:

  | Poll group | P5800 | P1932 |
  | --- | --- | --- |
  | principal (17) | *main character* | "principal" |
  | main (88) | *supporting character* | "main" |
  | sub (187) | *minor character* | "sub" |
  | mob (196) | *minor character* | "mob" |

  Each with P10663 the franchise and the results page as reference. Wikidata has an item *unnamed character* (Q109934238) and, for actors' parts, *extra* and *bit part*; none is used as a narrative role, and the *mob* characters do have names, so *minor character* with "mob" is the honest form. No written convention found beyond the property's own usage.
- **Village and land:** the existing Naruto characters carry *country of citizenship* (P27) to their land (Land of Fire 66, Sound 12, Water 10, Wind 9, Lightning 4), as fictional humans do in general (P27 on 15,158 of them). For the place someone lives, *residence* (P551) is the usual property, for fictional humans as for real people (4,396 uses, against 3,388 for *member of* and 325 for *affiliation*). So: **P551 the village, P27 the land**, and *member of* (P463) stays for organisations (Akatsuki, the Seven Swordsmen, later the clans). The poll's village is the one a ninja belongs to, which for a rogue ninja is the village left behind; the batch says so with *object named as* only where the site's value needs it.

## Abilities: jutsu (model proposed, 2026-11-17)

**Source:** the Naruto wiki's Semantic MediaWiki concepts, read through `api.php?action=ask` (`jutsu.mjs` => `jutsu-sets.json`), and each jutsu page's *Infobox/Jutsu* (`jutsu-data.mjs` => `jutsu.json`).
- **Fields:** kanji (2,367 of 3,032), romaji, literal English, the Viz name, rank (only 265 have one), classification, users (2,762), and the debut per medium (manga, anime, with flags for *Boruto*, *Shippūden* and the novels).
- **3,032 jutsu pages in all:**
  - 759 debut in the *Naruto* manga;
  - 420 are anime-only (an anime debut in *Naruto* / *Shippūden*, no manga);
  - 87 come from the *Boruto* manga;
  - the rest (about 1,770) come from the games, films, novels and the *Boruto* anime.
- **Classifications** (several per jutsu):
  - Ninjutsu 2,165, Taijutsu 627, Dōjutsu 220, Cooperation Ninjutsu 205, Kenjutsu 183, Space–Time Ninjutsu 153, Fūinjutsu 126, Senjutsu 118, Kinjutsu 116, Genjutsu 96 …;
  - with the kekkei genkai and hiden as sub-values (*Kekkei Genkai~Wood Release*, *Hiden~Hyūga Clan*).

**On Wikidata:** *jutsu* (Q12697902, "techniques in the Naruto series", 3 instances), *ninja technique* (Q20457882), *Dōjutsu* (Q4994687), *Kekkei Genkai* (Q17386632), a few single jutsu (Rasengan, Sharingan). No item exists for the Naruto senses of Ninjutsu, Taijutsu or Genjutsu (Q539067, Q1137678 are the real martial arts).

**Proposal:**
- **Which (Trummler, 2026-11-17): all of them, as complete as practical.** Game-, film- and novel-only jutsu become omitted groups on the site's side, so each jutsu carries the work it debuts in: the manga, the *Naruto* / *Shippūden* / *Boruto* anime, or the game, film, novel or OVA its infobox names. Official spin-offs (*Rock Lee & His Ninja Pals*) count like the main series for *present in work*. This needs a map of the 114 debut works named in the infoboxes to Wikidata items; Wikidata links only 11 Naruto games to the franchise, so missing works become items first. The same then holds for the characters, teams and places already created (their game, film and spin-off appearances), and for the Pokémon items (anime and manga).
- **Classes:** one class per classification, under *jutsu* (Q12697902): *Ninjutsu (Naruto)*, *Taijutsu (Naruto)*, *Genjutsu (Naruto)*, *Space–Time Ninjutsu* …, as the Pokémon moves are typed by class (*fire-type Pokémon move*). Each jutsu is an instance of each of its classifications. The kekkei genkai (Wood Release, Sharingan …) as classes too, where the jutsu belongs to one.
- **Statements:** kanji as ja label, romaji and the Viz name as aliases, the literal English as *literal translation* on a *official name*. P1441 manga / *Naruto* / *Shippūden* by debut.
- **Users:** the character's *superhuman feature or ability* (P2563) for each jutsu, as for the Quirks and Stands, from the infobox field *users*. Uses marked "~movie" / "~Game" are left out.
- **Rank (Trummler: map it if a property fits):** *degree of difficulty* (P7252, "difficulty level of an item", item-valued) fits the S / A / B / C / D / E ranks, which the series defines by difficulty. So six items *S-rank jutsu* … *E-rank jutsu* (class *jutsu rank*), and P7252 on the 265 jutsu with a rank. Jutsu without one get no statement: *unknown value* is for a value that exists but isn't known, while most jutsu were never ranked at all.

**Classes and ranks (2026-11-19; `jutsu-classes.mjs`):** `2026-11-19_naruto-jutsu-classes-create_PRE16.txt` (CREATE, 39 items).
- **Classes (33):** the wiki's classifications as subclasses of *jutsu* (Q12697902): Ninjutsu, Taijutsu, Genjutsu, Fūinjutsu, Senjutsu, Space–Time Ninjutsu, Hiden, Kekkei Mōra …, with the kanji from each classification's page (23 of 33) and the romaji as alias. Spelling variants are merged (*Space-Time*, *Fuinjutsu*, *Fighting style*). *Kekkei Genkai* (Q17386632) and *Dōjutsu* (Q4994687) exist already and are used as they are.
- **Checked against the wiki's own list (2026-11-19, Trummler's question):** the wiki's *Category:Jutsu Type* has 30 types. All 30 are in (*Kinjutsu* is the *Forbidden Technique* / *Forbidden Jutsu*, now as aliases).
  - **Extra items, which the infoboxes use but which are no jutsu types of their own:**
    - *Collaboration Techniques* is the same type as *Cooperation Ninjutsu* (one wiki page): merged.
    - *Kyūjutsu* (archery) is a kind of Bukijutsu: placed under it.
    - *Fighting Style* is kept, as the wiki tags 39 jutsu with it.
    - *General skill* (a soft redirect to the Ninja Academy page) and *Shape Transformation* (a chakra concept, tagging one jutsu) are no types. They go: a hand deletion request for Q142213293 and Q142213317, as QuickStatements can't delete.
  - **Fix batch:** `2026-11-19_naruto-jutsu-types-fix.txt` (89 lines):
    - a description of what each type is, after its wiki page (*jutsu type in Naruto: sealing techniques that seal objects, beings or chakra*);
    - the English names of each page's translation template as aliases: literal meaning, dub (*Ninja Art*, *Sage Jutsu*) and Viz (*Curse Mark Jutsu*);
    - the merge and the Kyūjutsu move.
- **Fix imported (2026-11-19).**
- **The jutsu (2026-11-19; `jutsu-batch.mjs`):** `2026-11-19_naruto-jutsu-create_PRE1.txt`, 3,028 CREATEs plus 4 existing items extended (Chidori Q3857953, Rasengan Q2522231, Wood Release: Serial Pillar Houses Technique Q134023399, Eight Trigrams Sealing Style Q25554173; found by SPARQL on the Naruto universe and a full-text search of 2,111 items mentioning Naruto / jutsu).
  - Label = wiki title (its "(…)" dropped where that stays unique), ja label = kanji (ruby readings dropped), en aliases = romaji, dub, Viz, game and other names; *literal translation* (P2441) from the infobox.
  - P31 every type class of the infobox (Collaboration Techniques => Cooperation Ninjutsu; General skill and Shape Transformation left out), *jutsu* where none; description after the first proper type (*taijutsu in Naruto*).
  - P7252 for the 265 ranked; no statement for the unranked.
  - P1441 every work the infobox names: manga / anime / Shippūden / Boruto by their fields (Two Blue Vortex has no item of its own, so Boruto manga), games, films, novels, OVAs via `works.json` (PRE15 items by label); "~Mentioned" debuts skipped. Without item, so without P1441: UNSG anime cutscenes (49), *Innocent Heart, Demonic Blood* (34), *School Trip Bloodwind Records* (11) and four smaller ones: a later CREATE if wanted.
  - Users follow: `backlog/2026-11-19_POST1_naruto-jutsu-users.txt`.
  - **German labels (2026-11-19, `jutsu-de.mjs`):** the German Naruto wiki (naruto.fandom.com/de, Kategorie:Jutsu, 1,502 pages) gives the German name in its infobox field `dtname`; matched to the English pages by the kanji (`japname`), 1,000 unique matches, 693 German labels (6 more as aliases, where two jutsu would share German name and description). The field `realname` (a literal German rendering) is a fan translation and left out. The rest stays without German label: the German wiki has no page for most game / anime-only jutsu.
  - **Checks before release:** every line against the expected patterns (0 off), no label + description pair twice (en, de), no alias equal to the label, no doubled spaces.
- **Import of 2026-11-19 (checked 2026-11-20, `verify-batch.mjs`):** 341 of the 3,028 jutsu CREATEs failed ("No success flag set in API result"), in 43 runs of consecutive items: server errors, not content; every line of the other items arrived. Retry: `2026-11-20_naruto-jutsu-create-retry_PRE1.txt` (the 341 blocks, unchanged). The concept update failed on 4 descriptions (the older duplicate items could not take the new items' label + description while those still had them); the Genjutsu merge went through and brought its descriptions, the Ninjutsu merge stopped at the conflicting en descriptions: `2026-11-20_naruto-ninjutsu-merge-fix.txt`.
- **Near-duplicate check (2026-11-20, `dup-check.mjs`):** all jutsu against 661 older Naruto items, labels and aliases compared without diacritics, case and long-vowel spelling (ou / uu). Only new near-twin: *Mangekyō Sharingan (jutsu)* Q142218020 next to the eye Q5991402; the wiki keeps them apart, so they get P1889 and the jutsu P2283 the eye.
- **Kekkei genkai, natures, clans (2026-11-20; `kg-pages.mjs`, `kg-batch.mjs`):**
  - **Model:** a jutsu *uses* (P2283) its kekkei genkai and its chakra nature, the existing pattern (*jutsu* and Rasengan P2283 Chakra); a hiden technique is *used by* (P1535) its clan (or village). Kekkei genkai are instances of *Kekkei Genkai* (eyes also of *Dōjutsu*); natures of a new class *Nature Transformation* (性質変化); kekkei genkai natures (Wood, Ice, Lava …) of both; Dust of *Kekkei Tōta*; clans of *fictional family* (Q15331236, as Uchiha and Senju).
  - `2026-11-20_naruto-kekkei-genkai-clans-create_PRE2.txt`: 54 CREATEs with kanji, romaji, dub / Viz names (*Wood Style*, *Vapour Style*), the German wiki's title as de label (*Mokuton*, *Hyuuga-Clan*), Fandom ID P6262. Existing and reused: Sharingan Q2526121, Mangekyō Sharingan Q5991402 (*Eternal Mangekyō Sharingan* redirects there: alias), Byakugan Q61058827, Hyūga Q717098, Uchiha Q713872, Senju Q12335007 (label was *Senyu Clan*), Yin–Yang Release Q142219779 (made by the jutsu batch, becomes the nature). Their fixes: `2026-11-20_naruto-kekkei-genkai-clans-existing.txt`.
  - Links: `backlog/2026-11-20_POST2_naruto-jutsu-kekkei-genkai-links.txt`.
  - **Later:** which clan has which kekkei genkai (Byakugan => Hyūga), and the characters' clans (P53 *family*), with the affiliations.
- **Pre-existing concept items (2026-11-19, `concepts-fix.mjs`, `2026-11-19_naruto-concepts-update.txt`):** an audit of all Naruto items that are no characters or works.
  - **Duplicates of the new type classes, merged into the older items:** *ninja technique* Q20457882 (忍術) <= Ninjutsu Q142213247; *Genjutsu* Q3624344 <= Q142213275. The jutsu batch already uses the older QIDs.
  - **Fixed:** *Taijutsu* Q1137678 is the real Japanese martial art but had P31 *jutsu* and P1269 Naruto: now P31 *martial arts*, P1889 to the Naruto Taijutsu Q142213260. *Dōjutsu* sat under a Wikimedia list article (P279 Q714915): now under *jutsu*. *Kekkei Genkai* gets P279 *jutsu*.
  - **Filled where missing:** en / de descriptions (Kekkei Genkai, Dōjutsu, Twelve Guardian Ninja, Seven Swordsmen, the five Kage, Chakra, Bijū, Naruto universe …), ja labels in kanji for Raikage / Kazekage (were romaji) and Daimyō, de labels (Sharingan, Dōjutsu, Ninja), aliases from the translation templates (*Bloodline Limit*, *Augentechnik*, *Guardian Shinobi Twelve*).
- **Ranks (6):** *S-rank jutsu* … *E-rank jutsu* as instances of the class the existing values of *degree of difficulty* use (Q11659512, as *easy* / *moderate*).
- **Sub-values** (*Kekkei Genkai~Wood Release*, *Hiden~Hyūga Clan*, 63 of them) stay in the data for now. Linking a jutsu to its kekkei genkai or clan is a later step, once the clans exist (Affiliations).
- **The jutsu themselves** (`backlog/…_POST16_naruto-jutsu.txt`) follow once PRE16 is imported; their users come after them.

**Debut works (2026-11-17; `works.mjs`, `works-new.mjs`, `works-batch.mjs` => `works.json`):** the jutsu infoboxes name 110 debut works (games, films, novels, OVAs). Matched on Wikidata by exact label and kind (the earliest release where a game title has several): 64, plus two found by their Japanese title (*Jump Ultimate Stars*, the OVA *Find the Four-Leaf Red Clover!*).
- `2026-11-17_naruto-works-create_PRE15.txt` (CREATE, 32): the light novels (*Hiden*, *Shinden*, *Retsuden* …), OVAs and games without an item, from their Naruto wiki infoboxes: ja title, romaji, the Japanese and English release dates, the ISBN of the novels.
- `2026-11-17_naruto-works-franchise.txt` (59 lines): *media franchise* Naruto on the existing works that lacked it (most of the games and films), crossovers included (*Jump Force*, *J-Stars Victory Vs*), which list each franchise they draw on.
- **Left out** (no page or no infobox on the wiki): *Naruto: Innocent Heart, Demonic Blood*, *Naruto Collectible Card Game*, *A Call from the Shadows!*.
- **The jutsu** wait for PRE15 (`backlog/…_POST15_naruto-jutsu.txt`), as their *present in work* needs the new works' QIDs.

## Open

1. **Manga or anime only:** settled for the characters by the wiki's debut fields (see Batches).
2. **Sources for the other three topics:** found (`_data/Prompts/done/Naruto_World_Sources.md`): no official lists; the Naruto wiki's categories (`Category:Locations`, `Clans`, `Teams`, `Ninja_Ranks`, `Concept:Jutsu/Manga` and `/Anime`), read through its API. Next to build.
3. **Names in other languages:** found (`_data/Prompts/done/Naruto_Names_Other_Languages.md`): each language's Naruto wiki; a label only where that wiki has the character's page.

## Batches

- `2026-11-16_naruto-villages-create_PRE9.txt` (CREATE, 5 items): the five great hidden villages as *fictional village* (Q82551957), with the names the poll site's language files give: en *Hidden Leaf Village*, de *Konoha* / *Kirigakure* …, ja *木ノ葉隠れの里*; the romanised name (*Konohagakure*) and the site's short form (*木ノ葉*) as aliases, the three names also as *official name* with the site's page of that language as reference; *country* (P17) the existing land for four of them. The Land of Earth has no item (and isn't on the site), so the Stone village goes without one. No existing item carried any of these names (label and alias search, 2026-11-16).
- `2026-11-16_naruto-characters-create_PRE10.txt` (CREATE, 375 items; generator `_data/naruto/batch.mjs`): every poll character without an item.
  - **Checked first:** an exact label / alias lookup for all names (`dup.mjs`, `dup.json`) found no Naruto item under any of them; the 216 same-named hits belong to other works.
  - **From the site** (reference: its results page): ja and en label (the bare name; the site's form with a title, *Gaara(Fifth Kazekage)*, as alias and as *official name*), kana (P1814), village (P551), and the group as *narrative role* (P5800) with *object named as* and *applies to work* the franchise.
  - **From the Naruto wiki** (reference: the character's page; `wiki.mjs`, `infobox.mjs`, `resolve.mjs`, `fixtitles.mjs` read its `Infobox:` data pages, 359 of the 375): *manga character* where it has a manga debut (356; so nearly the whole poll is manga cast, and the anime-only question is settled by the class), *fictional human* (306) with gender, *fictional ninja* where it has a rank or registration (178), P1441 the manga and the anime series of its debut (*Naruto* 154, *Shippūden* 205).
  - **Shared names:** label is the bare name, the description carries what tells them apart: the three earlier Raikage (*Ay*, "… (First Raikage)"), the seven feudal lords, two Animal Paths, two *Kosuke*, the second *Manda*, the Leaf's *Matsuri*.
  - **Groups** (4): *The Demon Brothers*, *Ninja Hounds*, *Ninja Cats*, *Haimaru Three Brothers* as *group of fictional characters*.
  - **Without wiki data** (16, site data only, P1441 the franchise): the three groups without a page, three feudal lords, *Tendo*, the second Animal Path, and ten whose page by name is another character's (*Kosuke* こうすけ, *Koji*, *Sakon* / *Ukon* who share a page, *Sumire*, *Senji*, *Kie*, *Hakui*, the second *Manda*).
  - **Not created:** *Tobi*, Obito Uchiha's persona, an alias on his item (Q718818). The poll lists both; whether a persona gets an item is the question open on WikiProject Narration.
  - **No de labels yet:** the German release spells names its own way (*Maito Gai*), so they follow from the German Naruto wiki.
- `2026-11-16_naruto-characters-attributes.txt` (506 lines on the 112 existing items): the same site data (role, village, kana, official names; ja label where missing). The existing *A* (Q3602337) is the Fourth Raikage; *Matsuri* (Q3851987) the Sand's.
- **Tobi (Trummler, 2026-11-17):** one item with Obito would be a plain spoiler, so Tobi gets his own (`2026-11-17_naruto-tobi-create_PRE11.txt`): member of Akatsuki, *said to be the same as* (P460) Obito both ways (`backlog/…_POST11_…`), each P460 with the qualifier *statement is regarded as spoiler for* (P7528) *Naruto: Shippūden*, a qualifier Wikidata already uses on narrative roles. *Madara Uchiha* goes on Tobi only as *pseudonym* (P742, also marked as spoiler): he used the name, but a P460 to Madara would state an identity the story refutes. The pseudonym links to Madara's item through the qualifier *named after* (P138), as P742 takes only a string (`2026-11-17_POST11_naruto-obito-tobi-link.txt`). The pattern (two items, P460 with P7528) already stands for Voq / Ash Tyler, Face of Boe / Jack Harkness, Shadow Mario / Bowser Jr. What Obito's item still holds of Tobi (names, aliases, a cosplay image, Akatsuki) waits for an answer: `_data/Wikidata/Spoilers_And_Hidden_Identities.md`.
- **Teams (Trummler, 2026-11-17: as items, a kind of small affiliation):** part of the Affiliations topic, from the Naruto wiki's `Category:Teams` (175 pages, `teams.mjs` => `teams.json`).
  - **Labels (Trummler, 2026-11-17):** the name the series uses as label, the number as *official name* (P1448). Where the wiki's title needs the leader to tell two numbered teams apart (*Team 7 (Kakashi)*, *Team 10 (Asuma)*), the label is the leader's name, which is also the team's Japanese name (カカシ班, アスマ班): *Team Kakashi*, *Team Asuma*, with *Team 7* / *第7班* and *Team 10* / *第10班* as official names. Help:Label asks for the most common name, so this follows it, and *different from* is needed far less. This holds for every team, not only where the title needs it (Trummler, 2026-11-17: consistency, and a reliable base for a variant flip between common and official name): *Team 8* is *Team Kurenai* (紅班) with *Team 8* as alias and official name (`2026-11-17_naruto-team-labels.txt`, with Team Kakashi's ja label カカシ班); teams the series only ever calls by number (*Team 2*, 第二班) keep it, as there is no other name.
  - **Members both ways:** on Wikidata, 495 of 1,941 fictional character groups list their members by *has part(s)* (P527), 3,218 characters point to a group by *member of* (P463), and 1,605 pairs carry both. So both is the common practice, not overkill. Members come from each character's infobox field *teams* (the wiki's redirects resolved: *Team Kakashi* => *Team 7 (Kakashi)*, *Sound Five* => *Sound Four*). Bare *Team 7* / *Team 10* there are disambiguation pages, as Konohamaru's and Moegi's mean their *Boruto* teams, so they stay out. Temporary, movie-only and novel-only memberships are left out; anime-only ones get the anime as *applies to work*, members who join in Part II (Sai, Yamato) *Naruto: Shippūden*.
  - `2026-11-17_naruto-teams-create_PRE12.txt` (CREATE, 145 teams; `teams-batch.mjs`): the teams without the 21 *Boruto* ones, as *group of fictional characters* (as Team 8 and the Sound Four are), with the wiki's kanji as ja label, P1441 by debut, the leader as *director / manager* (P1037, as Team 8 has it), the numbered name as *official name*, and the members as P527 for teams of up to 12 (divisions and councils get only P463 on the characters). Anime-only teams say so in the description.
  - `2026-11-17_naruto-teams-existing.txt` (41 lines): the nine existing team items (Akatsuki, Sound Four, Seven Ninja Swordsmen of the Mist, Twelve Guardian Ninja, Team 8, Team Kakashi, Sannin, Kinkaku and Ginkaku, The Demon Brothers) get their official names and members.
  - **Same name, other team (Trummler):** an item each, linked by *different from* (P1889); none needed inside this batch. *Team 7* (Konohamaru) and *Team 10* (Moegi) follow with *Boruto*, with P1889 to *Team Kakashi* and *Team Asuma*.
  - **Members on the characters** (`backlog/2026-11-17_POST12_naruto-team-members.txt`, 347 lines, written by `teams-batch.mjs` with `<team>` placeholders for the new teams): after PRE12.
- **Two characters on another's wiki page (found 2026-11-17, Trummler's question about the two *Matsuri*):** the lookup by title gave the Leaf village's *Matsuri* the Sand kunoichi's page and *Baku* the summoned tapir's, as both names have a disambiguation page (`homonyms.mjs` checked all used titles: 17 have one, these two were wrong). Their own pages are *Matsuri (Konoha)* and *Baku (Anbu)*. `2026-11-17_naruto-baku-matsuri-fix.txt` removes the statements with the wrong reference and adds them again from the right page (Baku now a fictional human, male, ninja); the Leaf Matsuri's two team memberships (Fourth Division, Team Matsuri, from PRE12) go in the follow-up. The Sand Matsuri's *applies to work* *Naruto: Shippūden* on the Fourth Division is right: she is in it only in the anime, which at that point is *Shippūden*.
- **Locations, first part (2026-11-17; `places.mjs` => `places.json`, `places-batch.mjs`):** the Naruto wiki's *Category:Countries* (49) and *Category:Villages* (40); *Category:Locations* (146 other places, from the Hokage Rock to Ichiraku Ramen) follows separately.
  - **Batch:** `2026-11-17_naruto-countries-villages-create_PRE14.txt` (CREATE, 79):
    - the countries as *fictional country*;
    - the villages as *fictional village*;
    - the three sage lands of the summons (Mount Myōboku, Ryūchi Cave, Shikkotsu Forest) as *fictional location*.
  - **Labels:** label the wiki's title (*Amegakure*, *Land of Rivers*), the romaji as alias, the kanji as ja label.
  - **Village => country:** P17 its country where the wiki names one: from the existing lands in the CREATE, to the new ones in `backlog/…_POST14_naruto-village-countries.txt` (11).
  - **No manga / anime split:** the location pages carry no debut fields, so every item gets the franchise as *present in work*. Whether a place is anime-only, as the `anime-original` rule needs, stays open.
  - **Labels of the hidden villages:** the five great villages already have the official site's English (*Hidden Leaf Village*). For the others no official English name exists, so they go by the wiki's romanised name, with the official one to follow if a source turns up.
- **Locations, second part (2026-11-20; `loc-refs.mjs`, `loc-media.mjs`, `loc-exist.mjs`, `loc-batch.mjs`):** the 144 places of *Category:Locations* (without the overview pages *Geography* and *Five Great Shinobi Countries*).
  - **Which works, from the pages themselves:** the location pages have no debut field and no medium category, but they show where the place appears in three ways:
    - their references (*Naruto* chapter 404, *Naruto: Shippūden* episode 123, Boruto chapter / episode);
    - the arcs they link: each arc's summary says "covers chapters … of the manga and episodes … of the anime" or names only episodes, as filler arcs do (82 arcs, Part I / Part II / Boruto);
    - the films, games and novels they link.
  - **Result:** 84 places get their works (manga, *Naruto*, *Shippūden*, Boruto, films, games, novels). 55 show none of the three and get the franchise, as the countries and villages did. Anime-only places and film / game / novel-only places say so in their description.
  - **Located in:** the first linked village or country of the lead, P131 (97 places). Checked by hand: where the lead names a place only as a bearing ("east of the Land of Tea", "near the border", "in the vicinity of Kumogakure"), there is no statement or the right one instead. Six places lie in another new place (P276, `backlog/…_POST3_naruto-places-within-places.txt`).
  - **Batch:** `2026-11-20_naruto-places-create_PRE3.txt` (CREATE, 139). Five exist already: Genbu (as a character), Mount Katsuragi, Ryūchi Cave, Shikkotsu Forest, Tree Felling Village (PRE14). German labels only where the German wiki has the place (36, *Tal des Endes*, *Große Naruto-Brücke*); an English title is no German name.
- **Affiliations (2026-11-20; `aff-pages.mjs`, `aff-batch.mjs`, `aff-links.mjs`):** from the character infoboxes' fields `rank-part1` / `-part2` / `-part3` / `-last`, `occupations`, `affiliations` and `clan`.
  - **Which property (checked on the properties' constraints, no research needed):** *military, police or special rank* (P410) allows *fictional military rank* (Q18325582) as value and characters as subject: the ranks Genin, Chūnin, Tokubetsu Jōnin, Jōnin, Head Ninja, Academy Student become such items. *Position held* (P39) allows *fictional office, position, or title* (Q21451536): the Kage, as five Hokage, a Raikage and a Mizukage already have it, and the village head. Villages and organisations (Akatsuki, Allied Shinobi Forces, Root, Anbu Q18646891) are *member of* (P463); clans *family* (P53), as on Wikidata's fictional families.
  - **Parts:** a rank holds for the part of the series its field names, as *applies to work* (Part I *Naruto*, Part II *Shippūden*, Part III *Boruto*), as for the team members; an "~~Anime only" affiliation or clan gets the anime the character appears in.
  - **Batches:** `2026-11-20_naruto-ranks-clans-create_PRE4.txt` (CREATE, 17: six ranks, *Village Head*, *Hoshikage*, nine clans not in PRE2: Hatake, Shimura, Kazekage Clan, Yotsuki, Lee, Hoshigaki, Karatachi Family, Jūgo's Clan, Fūma Clan, the last told apart from the Land of Sound's anime-only Fūma Clan of PRE2 by its description). The links follow in `backlog/…_POST4_naruto-character-affiliations.txt` (dry run: about 1,100 statements once all targets exist).
  - **Fandom IDs (`2026-11-20_naruto-places-fandom-ids.txt`):** the countries and villages of PRE14 had none; *naruto:Konohagakure* sat on the Land of Fire (Q712357) and moves to the village (Q142185185). The lookups of all follow-ups go by Fandom ID, with a fallback on unique labels for the teams of PRE12.
  - **Left for later:** the `classification` field (Sensor Type 35, Medical-nin 26, Missing-nin 21, Sage 17, Jinchūriki, Sannin …), and the assistants and bodyguards among the occupations.
- **Imports of 2026-11-20, afternoon:** QuickStatements turned fast for a while and then failed in runs: PRE3 lost 93 of 139 items, PRE4 all 17, the jutsu retry 138 of 341. Retries: `…places-create-retry_PRE3`, `…ranks-clans-create-retry_PRE4` (identical to the first), `…jutsu-create-retry2_PRE1`. `verify-batch.mjs` checked everything else as arrived; it now also compares plain string values (Fandom IDs), which it first reported as missing by mistake.
- **Shared page titles (found 2026-11-20 in POST4):** ten poll characters have no wiki data of their own, as their page by name is another's (`batch.mjs` NOT_THEIRS: こうすけ, コウジ, トビ, 左近, 右近, 二代目マンダ, スミレ, 千時, 帰依, ハクイ). The new generators did not apply that list, so POST4 and the classifications gave e.g. Tobi Obito's clan, rank and Jinchūriki class. `2026-11-20_naruto-shared-page-fix.txt` removes these 18 statements (Tobi's Akatsuki membership stays, it had its own reference before; Sakon and Ukon keep Otogakure, their shared page is about both). The list now sits in `resolve-naruto.mjs` (`notTheirs()`) and every generator uses it.
- **Classifications (`class-batch.mjs`, `2026-11-20_naruto-character-classifications.txt`):** Jinchūriki P31 Q2263050, Tailed Beast P31 Bijū Q55515, Medical-nin P106 physician, Samurai P106 samurai, Daimyō P39 Q3700906, Sannin P463 Q12702505. Sensor Type, Sage, Summon, Missing-nin, S-rank and the rest have no item or no clear property and are left out.
- **Names in de / fr / es / it (`chars-l10n.mjs`, `2026-11-20_naruto-character-names-de-fr-es-it.txt`):** per done/Naruto_Names_Other_Languages.md, the title of the character's page in that language's Naruto wiki, by the English wiki's language links: a label where the item has none in that language (325 de, 398 fr, 208 es, 67 it), an alias where it differs from the label.
- **Land of Water (Q107103741), alias Kirigakure (found 2026-11-20):** the country carries its village's name as en alias, as the Land of Sound carried *Otogakure*. A hand edit (QuickStatements can't remove aliases).
- **Land of Sound (Q1102030), mixed with its village:** en label *Land of Sound* and the itwiki article (*Paese del Suono*) are the country, but the ja label 音隠れの里, the es label *Aldea Oculta del Sonido* and the en alias *Otogakure* are its village, and the es aliases name characters (*Kimimaro Kaguya*, *Cuatro del Sonido*). The de label *Reisfeld-Reich* is the country's earlier name (the Land of Rice Paddies), which fits. `2026-11-17_naruto-land-of-sound-ja.txt` sets the ja label to 音の国; Otogakure gets its own item in PRE14. The es label and the stray aliases are a hand edit (QuickStatements can't remove aliases).

## Notability (2026-11-23)

**The note:** a Wikidata administrator (Yamato Shiya, 2026-11-20, on Trummler's talk page) pointed to WD:N: many of the new items cite only the fan wiki. The same admin closed the deletion of *General skill* and *Shape Transformation* (Bulk deletion request 6).

**What carries an item here** (research: `_data/Prompts/done/Wikidata_Fictional_Notability.md`): WD:N criterion 2 asks for "serious and publicly available references", and Help:Sources accepts the work itself and printed guidebooks; criterion 3 holds items other items' statements need. No deletion precedent exists for techniques, minor characters or game-only elements either way.

**Done:**
- `2026-11-23_naruto-work-references.txt` (4,492 lines): on *present in work*, *stated in* the manga with the debut *chapter* (1,341: jutsu, characters, places), or the game, film or novel itself (3,151).
- `2026-11-23_naruto-databooks-create_PRE7.txt`: the eight official guidebooks the wiki cites (*Rin / Tō / Sha / Jin no Sho*, the four databooks; *Retsu*, *Zai*, *Shō no Sho*, *One Decade, One Hundred Ninja*), with ISBN, date, pages; then `backlog/…_POST7_naruto-databook-references.txt`: the databook page as source on the 453 characters whose infobox cites one.
- The links between the items (users, types, kekkei genkai, clans, places, ranks) are the structural need.
- **For every new batch:** at least one source that is the work or an official book; the fan wiki beside it, and as identifier.

**Backlog (Trummler, 2026-11-24: later, next year if need be):** 1,278 jutsu appear only in games (they now cite the game), 312 have no official name (the wiki's description serves as title; 55 of them game-only).

## Next steps

1. Full-text search for each of the 371 missing names; the Akatsuki alias fix by hand.
2. The five village items (CREATE), then the characters (CREATE, `_PREn`) with P5800, P551, P27, then the group links (`_POSTn_`).
3. Attributes for the existing 117: missing ja / de labels, kana, village, narrative role.
4. Locations, Affiliations and Abilities once their sources are known.

## [to Navigation](#navigation)
