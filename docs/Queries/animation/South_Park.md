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
- ✖️[Characters](#️characters)
- ✖️[Families](#️families)
- ❌[Episodes](#episodes)
- ➕[Video Games](#video-games)

## ✖️Characters

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
- **Couples and families as items:** *Randy and Sharon Marsh*, *Gerald and Sheila Broflovski*, *Stephen and Linda Stotch*, *Stuart and Carol McCormick* and five *fictional family* items sit beside the single characters: not entries for a character list, so an exclusion by class (*fictional couple*, *fictional family*, *double act*) besides the places (town, school, police station) and the universe.
- **Classes:** *animated character* (104) and *fictional human* (66) dominate, but a dozen others occur; the P1441 link is the query, as for LoL.
- **Fame:** median sitelinks per tier 36 / 5 / 3 / 8 / 4 / 0 / 0 / 0: only the main four stand out, the tiers below aren't ordered by it. The editorial tiers stay.
- **de labels:** 26, all matching ours apart from Liane Cartman (Wikidata *Liana*); not checked against the German dub, so no edit.

**Rating:** stays ✖️ for the full list. The upper tiers (45 of 57 in tiers 1 to 3) would be close, but the 12 missing there have no item, and creating them needs a reliable source per character (South Park Studios or a published guide, not the fandom wiki); a candidate for Trummler, not a batch.

## ✖️Families

**Associated List:** [list of South Park families (Q47286)](https://www.wikidata.org/wiki/Q47286)  
**Definition:** -  
**Assessment:** List lacks definition

**Check (2026-10-07):** Still no P360 definition.
**Check (2026-10-10):** Still no P360 definition, but five items are typed *fictional family* (Q15331236) and linked to South Park: the Cartman, Marsh, Broflovski, Stotch and McCormick families. The four couples (*Randy and Sharon Marsh*, …) are typed *fictional couple*. Other families of the show (Tucker, Testaburger, Black, Donovan, …) aren't linked as families, so the list stays ✖️.

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
