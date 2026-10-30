# Wikidata Query Analysis: Disney

What Wikidata offers for the Disney topics, and how far it can serve as their source.

**Restructure (decided by Trummler, 2026-10-23):** the two topics below give way to three lines, each a folder with the entry type as its topic, merged one level up (`inheritsUpwards: 1`) into *Characters* and *Films* under `film-tv/disney/`:
- `mickey/` (*Mickey* / *Mickey & Friends*): the Mickey Mouse (Q3260246) and Donald Duck (Q12301358) universes, today's Classics; `characters.json`.
- `disney/` (*Disney* / *Walt Disney Animation Studios*): the canon, the films with *part of the series* (P179) Q56070713 (67, announced ones included) and their characters; `characters.json`, `films.json`.
- `pixar/` (*Pixar* / *Pixar Animation Studios*): Pixar's feature films and their characters; `characters.json`, `films.json`.

Universe members belong only to `mickey/`; guests from foreign franchises are no entry. A franchise that officially holds enough named, well-known characters gets a node of its own inside its line (`disney/frozen/`, `pixar/toy-story/`, …), the rest stays in the line's `others/`. The bar (Trummler, 2026-10-25, open to change in #35 / #39): at least 10 named characters, of them 5 well-known.

**Franchise sizes (Gemini, 2026-10-25; estimates, named characters):**
- **Canon:** Lilo & Stitch ~300 (the experiments), 101 Dalmatians ~110, The Lion King, Wreck-It Ralph and Peter Pan ~60 each (Peter Pan with the Disney Fairies' Pixie Hollow), Zootopia ~50, Aladdin ~45, The Little Mermaid ~40, Beauty and the Beast ~35, Tangled ~30, Frozen, Moana, Big Hero 6 and Cinderella ~25 each, Pinocchio, Encanto and Winnie the Pooh ~15 each, Snow White ~11.
- **Pixar:** Cars ~100, Toy Story ~80, Monsters, Inc. ~60, Finding Nemo ~40, The Incredibles ~35, Inside Out and Coco ~25 each, WALL-E ~12, Up ~10.
- **Mickey & Friends:** ~500. Disney runs the Mouse and the Duck universes as one franchise with two settings, which backs a single `mickey/` line.
- **Outside the three lines** with 10 or more well-known characters: Disney Fairies, Phineas and Ferb, Gravity Falls (TV animation).

The well-known count reaches 8 to 10 for every franchise (the prompt allowed 10 names), so it doesn't separate them. With these numbers the bar lets nearly every feature film through, Snow White and Up included, and `others/` keeps only the smallest standalones. Gemini's official lists don't hold: a film page holds one film's characters only (disneyanimation.com names a few in the synopsis, pixar.com the main cast on cards), and the Main Street page it cited is a park page. The official list that works is the voice cast on movies.disney.com (below).

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Navigation

[Film & TV](../README.md#film--tv)
- ➕[Animated Films](#animated-films)
- ➕[Classics](#classics)

## ➕Animated Films

**Associated List:** [list of Disney animated characters (Q2081931)](https://www.wikidata.org/wiki/Q2081931)
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [animated character (Q15711870)](https://www.wikidata.org/wiki/Q15711870), [from narrative universe](https://www.wikidata.org/wiki/Property:P1080): [Disney universe (Q3551225)](https://www.wikidata.org/wiki/Q3551225); and [character from Disney (Q112078124)](https://www.wikidata.org/wiki/Q112078124)
**Assessment:** the topic is named *Animated films* but holds characters, the leads of the animated films (its description says so).

**Check (2026-10-23):** both definitions fail: the Disney universe item links almost nothing (0 with the class), and *character from Disney* holds 100, none of ours. What works is the films: the 277 animated films that Walt Disney Animation Studios, Pixar or Walt Disney Pictures produced or distributed (P272 / P750), and the characters linked to them by P1441, or to the film's universe or franchise by P1080 / P8345. That gives 1,089 (groups included), all 16 of ours; the Genie's label is *The Genie*.
**Noise:** cameos come along, Wreck-It Ralph's video game guests above all (Sonic, Dr. Eggman, Ryu, M. Bison, Ken, Zangief), and the Mouse & Duck characters by their films, who belong to Classics. Two rule candidates: leave out members whose own franchise (P8345) isn't Disney's, and members of the Mouse & Duck universes.
**Fame:** Spearman 0.62. Ahead of our tier 2 rank Maleficent, Belle, Snow White, Cruella de Vil, Rapunzel, Merida, Timon and Pumbaa, Jessie, Aurora, Lightning McQueen (ranks 16 to 31, Mouse & Duck and cameos skipped).
**Rating:** ➕. Every entry is there; the membership needs the two rules above.
**For the lines (2026-10-23):** the canon is one clean series (P179 Q56070713, 67 films), Pixar's films carry P272 Pixar (no overlap with the canon, but shorts, *Planes* and a *Care Bears* film come along, and P179 *list of Pixar films* Q2732470 is a list item used as a series). The franchise link is thin: hundreds of canon characters lack *media franchise* (P8345), Elsa, Anna and Olaf among them, and some franchises have no item to point at. Disney's movie pages embed an official character list (`"character_name"` in the source of `movies.disney.com/<film>`: Zootopia 12, Frozen 7, Moana 2), a source for the gaps.
**Batches** (`2026-10-23_disney-franchise-1.txt`, `-2.txt`, imported and verified 2026-10-25, 27 of 27): P8345 Frozen (Q18148065), Moana (Q127502289) and Zootopia (Q116753708) for 27 characters, referenced to those pages.
**Voice casts (2026-10-25):** the `"character_name"` entries are the film's voice cast credits. movies.disney.com's sitemap lists 746 pages; 67 of the 77 canon and Pixar films have a cast there, 819 credits in all. 558 of them match one item linked to the film or its franchise, 22 match several (a remake's or a musical's version, or Marvel's Baymax next to Disney's), 239 match none. The matched ones lack 117 links, mostly P8345 (Mulan 15, 101 Dalmatians 15, The Incredibles 11, Hercules 10, Tarzan 8 …). Kipling's or Collodi's originals were checked apart: every item that gets a franchise is Disney's own version (Cruella de Vil's item covers the novel and Disney's film alike). One more fix: Sadness's P8345 points at the film *Inside Out*, not at the franchise.
**Unmatched credits:** mostly minor roles ("Narrator", "Young Simba"), but also main characters with no item at all: Fear, Disgust, Anger and Bing Bong (Inside Out), Miguel Rivera, Héctor, Abuelita and Mamá Coco (Coco; the film has only Ernesto de la Cruz), M-O (WALL-E), Queen Elinor and King Fergus (Brave). Newer films lack nearly every item (Meet the Robinsons 0 of 27, The Good Dinosaur 0 of 9, Soul 2 of 27, Bolt 2 of 15); those creations wait for the restructure's per-film pass.
**Batches** (2026-10-25): `2026-10-25_disney-cast-1.txt` to `-6.txt` (117 links: P8345, and P1441 where the film was missing, e.g. Mike Wazowski in *Monsters, Inc.*), `2026-10-25_disney-cast-create.txt` (the 11 items above, labels as credited, with *animated character*, P1441 and P8345; now Q141865431 to Q141865443), `2026-10-25_disney-cast-removal.txt` (Sadness's film as franchise). Each statement is referenced to the film's movies.disney.com page. Imported and verified 2026-10-26, except part 4 (The Jungle Book and Sleeping Beauty, 12 links), which never reached Wikidata: redone as `2026-10-26_disney-cast-4-redo.txt` (imported and verified 2026-10-27, 12 of 12).
**The ten films without a cast** (*Inside Out 2*, *Turning Red*, *Elemental*, *Elio*, *Ralph Breaks the Internet*, *Moana 2*, *Zootopia 2*, *Encanto*, *Wish*, *Strange World*, 2026-10-27): pixar.com's film pages carry one card per character, the name as text (`pixar.com/<slug>`); disneyanimation.com's film pages name only the leads, in their synopsis. On Wikidata, of the 41 characters Pixar names, *Inside Out 2* has Riley, Joy, Sadness and Anxiety linked and Anger, Fear and Disgust as items without that film (ours, from the batch above; WDQS didn't list them yet, the live search did); *Elemental* has Ember and Wade; every other one has no item (live full-text search, checked by description). Two cards are no character of their own: *Red Panda Mei* (Mei) and *Grandma* (unnamed there); the band *4*Town* is a group. **Batches** `2026-10-27_pixar-cast-1.txt` to `-4.txt` (203 commands; imported and verified 2026-10-27: 3 of 3 links, 27 of 27 items, now Q141892265 to Q141892298): P1441 *Inside Out 2* for Anger, Fear and Disgust, and 27 new items, labels as on the card, with *animated character* and P1441 the film (P8345 *Inside Out*, Q113956747, for the four of *Inside Out 2*), each statement referenced to the film's pixar.com page. *Bryce and Caleb* share a card and become two items. `2026-10-29_pixar-cast-5.txt` (5 commands) adds *Elio*'s other five ambassadors (Helix, Tegmen, Turais, Mira, Auva) the same way.
**The synopses on disneyanimation.com (2026-10-29):** of the names they give, Ralph, Vanellope, Judy, Nick, Mirabel, Asha, King Magnifico and Ethan Clade are linked to their film; Moana and Maui lack *Moana 2*, and Yesss, Shank (*Ralph Breaks the Internet*) and Star (*Wish*) have no item. **Batch** `2026-10-29_disney-synopsis.txt` (7 commands): the two links and the three items, each referenced to the film's page there.
**Not batched:** some films lack P8345 to a franchise item that exists (Tangled, 101 Dalmatians, The Jungle Book, Sleeping Beauty, Mulan, Zootopia 2, The Incredibles and Finding Nemo, which point at their film series instead), but no source says so in a citable line. For The Little Mermaid and Peter Pan no Disney franchise item exists yet, and for Big Hero 6 (Q119079310) it's unclear whether the item is Disney's or Marvel's. Marvel's Baymax, Hiro Hamada and Honey Lemon carry P1441 *Big Hero 6* (the film) next to Disney's own items; that is a modelling question, not a gap.
**Fame caveat:** characters without an article of their own rank far too low by sitelinks (Nemo 3, Dory 6, Mike Wazowski 9); the fame proxy needs the work's fame as a fallback.

## ➕Classics

**Associated List:** -
**Definition:** the Mickey Mouse universe (Q3260246) and the Donald Duck universe (Q12301358), linked by P1080; the *Mickey Mouse* franchise (Q116691328) adds three.

**Check (2026-10-23):** 286 characters (289 with groups); 14 of our 16 found, among them the Beagle Boys as a group of fictional characters (Q1798441).
- **Dale** (Q29110399), like **Chip** (Q29110398), is only *part of* Chip 'n' Dale (Q403138), which carries both universes; Chip matched by the pair's label. The build either takes the members of a member group (P361) or the two get P1080 on Wikidata. No batch yet: D23's page renders by script, so no source could be read.
- **Winnie the Pooh** has a universe of his own (Q124040835) and isn't Mouse & Duck. Disney's Pooh films are canon, so he moves to the `disney/` line (Trummler, 2026-10-23).

**Fame:** Spearman 0.87; tier 1 at ranks 1 to 7.
**Gaps in our list:** Pete, Clarabelle Cow, Ludwig Von Drake, Magica De Spell, Horace Horsecollar, Flintheart Glomgold, José Carioca, John D. Rockerduck, Fethry Duck, the Phantom Blot (ranks 10 to 22).
**Rating:** ➕.

## [to Navigation](#navigation)
