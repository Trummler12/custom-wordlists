# Wikidata Query Analysis: SpongeBob SquarePants

What Wikidata offers for the SpongeBob SquarePants topics, and how far it can serve as their source.

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
- ➕[Characters](#characters)
- 🔵[Locations](#locations)
- ❌[Episodes](#episodes)
- ✖️[Video Games](#video-games)

## ➕Characters

**Associated List:** [list of SpongeBob SquarePants characters (Q1210902)](https://www.wikidata.org/wiki/Q1210902)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [character](https://www.wikidata.org/wiki/Q95074), [part of the series](https://www.wikidata.org/wiki/Property:P179): [SpongeBob SquarePants](https://www.wikidata.org/wiki/Q83279)

**Check (2026-10-07):** 155 characters are linked to SpongeBob SquarePants (Q83279), all via *present in work* (P1441). The definition names *part of the series* (P179), which no character uses, so its query finds 0. All 10 of our entries are among the 155 (5 by full name, 5 by first name).  
**Rating:** ➕ (was ✖️). The list's definition should name P1441.

**Second check (2026-10-26):** 174 characters with the query below: the series (P1441), its universe *SpongeBob SquarePants universe* (Q87609688, P1080), or a work of the franchise (Q98109524: the films, *Kamp Koral*, *The Patrick Star Show*, the games). The franchise link P8345 on a character itself is no base: it adds only the 16 roles of *The SpongeBob Musical* (typed *musical theatre character*, Q63975020, each a second item for SpongeBob, Patrick, …) and one film character. No crossover guests.
**Fame:** Spearman 0.87; tier 1 at sitelink ranks 1 to 5, tier 2 at 6 to 12. Below that the sitelinks thin out fast (rank 13 has 6, rank 23 has 2), so they rank candidates only roughly.
**Gaps in our list:** Mermaid Man and Barnacle Boy (as a pair 17 sitelinks, alone 3 each), the Flying Dutchman, Larry the Lobster, Patchy the Pirate, SpongeBob's parents, Squilliam Fancyson, King Neptune (ranks 10 to 22). *Plankton and Karen* is a pair item next to the two.
**Structure:** the spin-offs share the universe, so the topic stays one node.
**Query:**
```sparql
SELECT DISTINCT ?item WHERE {
  { ?item wdt:P1441 wd:Q83279 } UNION { ?item wdt:P1080 wd:Q87609688 }
  UNION { ?item wdt:P1441 ?work . ?work wdt:P8345 wd:Q98109524 . }
  ?item wdt:P31/wdt:P279* wd:Q95074 .
  FILTER NOT EXISTS { ?item wdt:P31 wd:Q63975020 }
}
```
**Exclusion list:** the musical's roles (class Q63975020): no entries of their own, the animated characters already are.

## 🔵Locations

**Associated List:** [list of SpongeBob SquarePants locations (Q4295475)](https://www.wikidata.org/wiki/Q4295475)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [fictional location](https://www.wikidata.org/wiki/Q3895768), [part of the series](https://www.wikidata.org/wiki/Property:P179): [SpongeBob SquarePants](https://www.wikidata.org/wiki/Q83279)

**Check (2026-10-07):** The definition's qualifier (P179) matches nothing either; 57 fictional locations are linked via P1441. Not yet compared with the real number.

## ❌Episodes

**Associated List:** [list of SpongeBob SquarePants episodes (Q320465)](https://www.wikidata.org/wiki/Q320465)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [television series episode](https://www.wikidata.org/wiki/Q21191270), [part of the series](https://www.wikidata.org/wiki/Property:P179): [SpongeBob SquarePants](https://www.wikidata.org/wiki/Q83279)  
**Assessment:** Barely anyone knows individual Episodes’ Titles.

## ✖Video Games

**Associated List:** [SpongeBob SquarePants video games (Q1727636)](https://www.wikidata.org/wiki/Q1727636)  
**Definition:** -  
**Assessment:** List lacks definition

**Check (2026-10-07):** 6 games via *part of the series* (P179) = SpongeBob SquarePants video games (Q1727636); the list still has no definition. Far fewer than the games released.  
**Rating:** stays ✖️.

## [to Navigation](#navigation)
