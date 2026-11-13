# Wikidata Query Analysis: South Park

What Wikidata offers for the South Park topics, and how far it can serve as their source.

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Navigation

[Animation](../README.md#animation)
- ✖️[Characters](#characters)
- ✖️[Families](#families)
- ❌[Episodes](#episodes)
- ➕[Video Games](#video-games)

## ✖Characters

**Associated List:** [list of South Park characters (Q47226)](https://www.wikidata.org/wiki/Q47226)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [character](https://www.wikidata.org/wiki/Q95074), [present in work](https://www.wikidata.org/wiki/Property:P1441): [South Park](https://www.wikidata.org/wiki/Q16538)

**Check (2026-10-07):** 112 characters are linked to South Park (Q16538), all via *present in work* (P1441); the definition's class query finds 8 without subclasses and 112 with them. 70 of our 136 entries are among them (38 by full name, 32 by first name); the missing ones are mostly minor and recurring characters (Shelly, Mr. Hankey, ManBearPig, Ms. Choksondik, the Goth Kids, …).  
**Rating:** stays ✖️.

**Check (2026-10-10):** `_scripts/southpark.mjs` (output `_data/southpark-run1.txt`). 130 items are linked to South Park, all by P1441; 70 of our 136 characters match (unchanged), by tier:

| Tier | Matched | Missing |
| ---: | :---- | :---- |
| 1 | 7 / 7 | - |
| 2 | 22 / 25 | Shelly Marsh (see below), Harrison Yates, Strong Woman |
| 3 | 16 / 25 | Mr. Hankey, Dr. Mephesto, Santa, Ms. Crabtree, Nichole, Dougie, Mr. Kim, Goth Kids, Darryl Weathers |
| 4 | 6 / 12 | the Coon and Friends personas (The Coon, Human Kite, Toolshed, Mosquito, Princess Kenny, Super Craig) |
| 5 to 8 | 19 / 67 | mostly minor and one-off characters |

- **Naming, not gaps:** Wikidata has *Shelley Marsh* (Q47414), our list *Shelly*; *Pete Melman* and *Dog Poo Petuski* are our *Pete* and *DogPoo*. Which spelling of Shelley is official is worth a check on our side before anyone edits.
- **Same names, other items:** the 2023 special *Joining the Panderverse* (Q123024716) has its own Cartman, Kenny, town and school (P1441 the special, P1080 *Universe 216-B*). Correctly modelled; a build has to leave them out by that link.
- **Couples and families as items** (couples: confirmed no entries, Trummler 2026-10-10): *Randy and Sharon Marsh*, *Gerald and Sheila Broflovski*, *Stephen and Linda Stotch*, *Stuart and Carol McCormick* and five *fictional family* items sit beside the single characters: not entries for a character list, so an exclusion by class (*fictional couple*, *fictional family*, *double act*) besides the places (town, school, police station) and the universe.
- **Classes:** *animated character* (104) and *fictional human* (66) dominate, but a dozen others occur; the P1441 link is the query, as for LoL.
- **Fame:** median sitelinks per tier 36 / 5 / 3 / 8 / 4 / 0 / 0 / 0: only the main four stand out, the tiers below aren't ordered by it. The editorial tiers stay.
- **Episode counts (2026-10-10):** Wikidata can't give them. The characters carry no count, and the episodes name their characters (*characters*, P674) on 8 of 337, almost all of them the main four. Filling P674 for 337 episodes would need a source per episode, which only the fan wiki has. Two identifiers point to counts outside Wikidata: the Fandom article ID (P6262, 48 characters; the fan wiki lists each character's appearances) and the Archive of Our Own tag (P8419, 75; works per tag measure fan interest). Either would be a fame source of its own, read from that site, not from Wikidata.
- **de labels:** 26, all matching ours apart from Liane Cartman (Wikidata *Liana*); not checked against the German dub, so no edit.

**Rating:** stays ✖️ for the full list. The upper tiers (45 of 57 in tiers 1 to 3) would be close, but 11 of the 12 missing there have no item (Shelly is a spelling question), and creating them needs a reliable source per character (South Park Studios or a published guide, not the fan wiki).

**Research (2026-10-10, settled):** Gemini (`_data/Prompts/done/South_Park_Characters.md`, two rounds) pointed to South Park Studios' own wiki (`southpark.cc.com/w/index.php?title=<title>`, geo-redirected to southpark.de; a missing title also answers 200, so each page was read). Checked there:

- **Already on Wikidata, only unlinked:** *Mr. Hankey* (Q48225) and *ManBearPig* (Q99300081) carried P1441 for single episodes, not for the series. Searching by the Fandom ID (P6262 `southpark:…`) found more character items without the link, most of them created in 2026: Veronica Crabtree, Diane Choksondik, Kevin McCormick, Richard and Mrs. Tweak, Cleo Broflovski (each with an official page; Grandma Tweak and Yentl Cartman have none and stay unlinked).
- **First appearances:** the official wiki confirms Gemini's for Strong Woman, Mephesto, Nichole, Dougie, Mr. Kim, the Goth Kids and Darryl Weathers; for Harrison Yates it gives *Christian Rock Hard*, not Gemini's *The Jeffersons*. Mr. Hankey's page names *Damien* (a cameo) where Wikidata has *Mr. Hankey, the Christmas Poo*; not touched.
- **Official names:** Vice Principal Strong Woman, Dr. Alphonse Mephesto, Dougie O'Connell, Tuong Lu Kim, Veronica Crabtree (credited by that name on the *Fat Camp* page; she has no page of her own); the titles became aliases, and Help:Label keeps them out of the label.
- **Shelley:** the official page is *Shelley Marsh*; *Shelly* has none. Wikidata is right; our hand-built list is regenerated from Wikidata in PR #39 anyway, so it needs no fix of its own.
- **Liane / Liana:** Gemini's "German" source is the same English wiki under southpark.de, so no German source exists for either; ours stays, Wikidata's de label stays.

| Batch | Edits | What |
| :---- | ----: | :---- |
| `2026-10-10_southpark-present-in-work.txt` | 2 | P1441 *South Park* on Mr. Hankey and ManBearPig; **imported** |
| `2026-10-10_southpark-characters-create.txt` | 64 | eight characters (Harrison Yates Q141686910, Strong Woman Q141686912, Alphonse Mephesto Q141686914, Nichole Daniels Q141686915, Dougie O'Connell Q141686917, Tuong Lu Kim Q141686919, the Goth Kids Q141686920 as *group of fictional characters*, Darryl Weathers Q141686921): label, description, aliases, P31, P1441, P1080, P4584, each referenced to its official page; **imported** |
| `2026-10-10_southpark-present-in-work-2.txt` | 12 | P1441 and P1080 *South Park* on the six unlinked characters above; **imported** |
| `2026-10-10_southpark-portrayals.txt` | 9 | Santa Claus created as the show's character (P1074 the legendary one, first appearance the 1995 short); P1074 on Saddam Hussein and Satan (see Portrayals below); **pending** |

**Check after the imports (2026-10-10):** 146 items linked, 83 of our 136 match (`_data/southpark-run3.txt`); tiers 1 to 3 at 55 of 57 (Shelly by spelling, Santa until the portrayals batch). Mephesto's label had meanwhile been moved to `mul` by another editor, so `southpark.mjs` now reads labels and aliases in `en` and `mul`.

**Portrayals of real and legendary figures (2026-10-10):** the show's Santa, Jesus, Saddam Hussein or Donald Trump are characters of the show, and Wikidata says how to model them: the *characters* property (P674) carries a constraint naming Santa Claus, Jesus, God, Satan and Trump, Obama, Lincoln, Hitler, bin Laden, with the note that a figure appearing in a creative work gets an item of its own, separate from the one it is based on; and *present in work* (P1441) has no *human* among its allowed subject classes. So: an item per portrayal, P1441 / P1080 the show, *fictional analog of* (P1074) the real or legendary figure.

- **Already so:** Jesus (Q49138) and God (Q4088979) with P1074; Satan (Q49139, P1074 missing, only *based on*) and Saddam Hussein (Q47889, P1074 missing): both added by the batch above. No real human carries P1441 South Park.
- **Missing:** Santa (in the batch). Not in our list, so not batched: the show's Al Gore, Donald Trump, Elon Musk, Steve Jobs and Jared Fogle, whose fan-wiki IDs (P6262 `southpark:…`) sit on the real people's items instead; and three episodes name the real Michael Jackson, Charles Manson and John Edward as *characters*. Fixing those means a portrayal item each and moving the statements, a removal batch of its own.
- **A conflation:** *Damien Thorn* (Q166150) is the Antichrist of *The Omen* and carries P1441 South Park too; the show's Damien would be an item of its own (P1074 or *based on* the Omen's). A split, not an addition; left for now.

**Name forms (2026-10-12):** how a query would get the three forms of an entry: `pref` = the label (*Eric Cartman*), `long` = the full name (*Eric Theodore Cartman*), `short` = what the character is called (*Cartman*, *Kyle*). Checked against how Wikidata models names:

- **`long` from the name parts fits Wikidata:** given names (P735) in the order of their *series ordinal* (P1545), then the family name (P734). Wikidata does it this way for people too, and P734 tells the forms apart with *object has role* (P3831): *married name* on 107,000 statements, *maiden name* on 96,000. So the rule skips a family name with the role *maiden name* or *birth name*. *Birth name* (P1477) is no substitute: it is a string, but only the name at birth (the show's Sharon has *Sharon Kimble* there).
- **`short` has no name part to point at.** Kyle goes by his given name, Cartman and Yates by their family names, Mr. Garrison by title and family name; which one is editorial, not structural. Wikidata's place for it is *short name* (P1813), a string per language: its description names persons, and the constraint note on *nickname* (P1449) says a short form fans use belongs in P1813. On 8,345 *animated character* items, 56 have P1813 (*Sulley*, *Marcy*, but also initials like *PB*, *LSP*) and 194 have P1449 (*Chewie*, *Tails*, *Mikey*). The query takes P1813 in `en` (or `mul`) and leaves out values in capitals only; failing that, a nickname (P1449) that is part of the label (*Butters* in *Butters Stotch*, *Pip* in *Pip Pirrup*); else no short form. A first name taken from the label would get Kyle right and Cartman wrong, so it serves only to propose P1813 values, never as the form itself.
- **What the main characters hold:** none of the linked items has P1813. Cartman has the full name parts (Eric 1, Theodore 2, Cartman). Kyle's family name is the *Broflovski Family* item (see Families). Stan has *Stan* beside *Stanley* (1) and *David* (2), a short form recorded as one of his given names, while Chef has *Chef* as a given name with the role *nickname*; both belong in P1813 or P1449 instead. Butters, Sharon, Sheila, Gerald, Wendy, Bebe, Tweek and Liane have no family name; Butters' first given name lacks its ordinal; Jimmy's family name is *Valmer* while his label still reads *Volmer*.
- **Batches (2026-10-12, agreed with Trummler):** each statement referenced to the character's official page (the infobox gives the full name, e.g. *Kenneth "Kenny" McCormick*, *Sir Ike Moesha Broflovski*; the text uses the short form). Part 1 (`2026-10-12_southpark-name-forms-1-family-names.txt`, 36 lines) creates the family names Stotch, Broflovski, Testaburger, Tweak, Pirrup and Gerblanski. Part 2 (`…-2-names.txt`, 55 lines) adds P1813 to 28 characters, P1449 *Butters*, *Pip* and *Chef*, removes the given names *Stan*, *Kenny* and *Chef*, adds Kenneth (1), Leopold's ordinal, Ike (1) and Moesha (2), Phillip, Harrison and Mary, and 14 family names that already have an item. Part 3 (`…-3-family-names-linked.txt`, 15 lines, after Parts 1 and 2) puts the new family names on Butters, Stephen, Linda, Kyle (replacing the family item), Gerald, Sheila, Ike, Wendy, Tweek, Pip and Ned, adds P1813 *Darryl*, and gives Sharon's *Marsh* the role *married name* and her birth name *Sharon Kimble* a reference. An optional fourth file (`…-4-unsourced-middle-names.txt`, 4 removals) drops Stan's *David*, Butters' and Clyde's *James* and Tweek's *William*: unreferenced, and found neither on the official pages nor in the fan wiki's infoboxes.
- **Research (2026-10-12, settled):** Gemini (`_data/Prompts/done/South_Park_Name_Forms.md`), each answer checked. Confirmed: Sharon's maiden name *Kimble* is spoken in *My Future Self n' Me* (Q375402; "Mom, your maiden name is Kimble", per the fan wiki's script); Kenny is *Dr. Kenneth McCormick* in *Post COVID*; the official episode page of *White People Renovating Houses* spells *Darryl* (his own page mostly *Darrel*); *Gerblanski*. No source for the middle names Wikidata holds (Stan's *David*, Butters' and Clyde's *James*, Tweek's *William*): neither page names them. Not settled, so left out: *Mr. Kim* appears only in the script's stage directions, the dialogue says *Lu Kim* or *Mr. Lu Kim*; *PC Principal* is *Peter Charles* officially and *Peter "PC Principal" Charles* in the fan wiki, which hints at *Charles* as his family name, but no official source says so. Two spellings for PR #39's list: *Ned Gerblanski* (ours *Gerblansky*) and *Jimmy Valmer* (Wikidata's label still *Volmer*).
- **Check after the imports (2026-10-20):** all four name-form files and the portrayals batch are on Wikidata: P1813 on the tier 1 to 3 characters, Butters, Pip and Chef by P1449, the new family names on their characters (Kyle's family item replaced), Sharon's *married name* and *Sharon Kimble*, the four unsourced middle names gone. `southpark.mjs` (`_data/southpark-run4.txt`): 148 items linked, 84 of our 136 match, tiers 1 to 3 at 56 of 57 (only Shelly, a spelling question for PR #39).

## ✖Families

**Associated List:** [list of South Park families (Q47286)](https://www.wikidata.org/wiki/Q47286)  
**Definition:** -  
**Assessment:** List lacks definition

**Check (2026-10-07):** Still no P360 definition.
**Check (2026-10-10):** Still no P360 definition, but five items are typed *fictional family* (Q15331236) and linked to South Park: the Cartman, Marsh, Broflovski, Stotch and McCormick families. The four couples (*Randy and Sharon Marsh*, …) are typed *fictional couple*. Other families of the show (Tucker, Testaburger, Black, Donovan, …) aren't linked as families, so the list stays ✖️.

**Another way in (2026-10-10):** the families are in the characters themselves. 49 of the linked characters name a relative that is also linked to South Park (father, mother, child, spouse or sibling: P22, P25, P40, P26, P3373), and 27 carry a family name (P734; Marsh 5, McCormick 3, then one each, Tucker, Black and Donovan among them). Grouping the characters by family name, or by their kinship links, gives a family list without a family item per family; the family items then only add a label. This also needs the family names complete on the characters, which is a smaller fix than creating family items: a batch of P734 statements, sourced like the characters. Our planned Families topic would be built this way, once the characters are in. One statement is wrong on the way: Kyle (Q47345) has the *Broflovski Family* item (Q28466372, a *fictional family*) as his family name, and no family-name item *Broflovski* exists yet; it belongs in that batch (create the family name, replace the value).

## ❌Episodes

**Associated List:** [list of South Park episodes (Q1540084)](https://www.wikidata.org/wiki/Q1540084)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [animated series episode](https://www.wikidata.org/wiki/Q116048824), [part of the series](https://www.wikidata.org/wiki/Property:P179): [South Park](https://www.wikidata.org/wiki/Q16538)  
**Assessment:** Barely anyone knows individual Episodes’ Titles.

## ➕Video Games

**Associated List:** [list of South Park video games (Q3178441)](https://www.wikidata.org/wiki/Q3178441)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [video game](https://www.wikidata.org/wiki/Q7889), [part of the series](https://www.wikidata.org/wiki/Property:P179): [South Park](https://www.wikidata.org/wiki/Q124656884)

**Check (2026-10-07):** 9 games via *part of the series* (P179) = South Park (Q124656884), as the definition says. Not yet compared with the real number.
**Check (2026-10-10):** P179 *South Park* (the game series) finds 9; adding P8345 = the South Park franchise (Q54622175) brings *South Park 10: The Game* (2007), 10 in all: the 1998 game, Rally, Chef's Luv Shack, South Park 10, Let's Go Tower Defense Play!, Tenorman's Revenge, The Stick of Truth, The Fractured but Whole, Phone Destroyer and Snow Day!. The two RPGs carry their title only in `mul`, so a query has to read `mul` (as the Method section says). *South Park: Imaginationland* (Q63228456, a mobile game) has no link, date or description; a candidate once a source is at hand.  
**Rating:** ➕ (was 🔵).

## [to Navigation](#navigation)
