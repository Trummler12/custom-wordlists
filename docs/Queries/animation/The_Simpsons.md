# Wikidata Query Analysis: The Simpsons

What Wikidata offers for the The Simpsons topics, and how far it can serve as their source.

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

**Associated List:** [list of The Simpsons characters (Q267149)](https://www.wikidata.org/wiki/Q267149)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [character](https://www.wikidata.org/wiki/Q95074), [present in work](https://www.wikidata.org/wiki/Property:P1441): [The Simpsons](https://www.wikidata.org/wiki/Q886)

**Check (2026-10-07):** 331 characters are linked (P1441 / P1080 / P8345 to The Simpsons, its universe or franchise); the definition's class query finds 1 without subclasses and 321 with them. All 24 of our entries are among them (9 by full name, 15 by first name).  
**Rating:** ➕ (was ✖️).

**Second check (2026-10-26):** 335 characters (328 without the prank-call names below) with the query below (the series, its universe Q61468436, or a work of the franchise Q7764350: the film, *Tapped Out*, the comics, the games); the franchise link on a character adds none. One portrayal of a real person (Simon Cowell) and no crossover guests.
**Fame:** Spearman 0.94, the closest so far: tier 1 at sitelink ranks 1 to 9, tier 2 at 10 to 25, tier 3 at 32 to 48. Kang and Kodos rank 267 and 268 as single items; their pair item has 20 sitelinks (rank 40).
**Gaps in our list:** Grampa Simpson (rank 6, ahead of most of tier 1), Mayor Quimby, Sideshow Bob, Principal Skinner, Santa's Little Helper, Troy McClure, Edna Krabappel, Groundskeeper Willie, Hans Moleman, Kent Brockman (ranks 12 to 26, all above our tier 3).
**Prank-call names:** seven items typed *gag name* (Q5516775) and *persona in a work of fiction*: Bart's alter egos on Moe's phone (I. P. Freely, Seymour Butz, …). They are jokes, not characters, so they go on the exclusion list.
**Query:**
```sparql
SELECT DISTINCT ?item WHERE {
  { ?item wdt:P1441 wd:Q886 } UNION { ?item wdt:P1080 wd:Q61468436 }
  UNION { ?item wdt:P1441 ?work . ?work wdt:P8345 wd:Q7764350 . }
  ?item wdt:P31/wdt:P279* wd:Q95074 .
  FILTER NOT EXISTS { ?item wdt:P31 wd:Q5516775 }
}
```

## 🔵Locations

**Associated List:** [list of The Simpsons locations (Q3526785)](https://www.wikidata.org/wiki/Q3526785)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [fictional location](https://www.wikidata.org/wiki/Q3895768), [from narrative universe](https://www.wikidata.org/wiki/Property:P1080): [The Simpsons universe](https://www.wikidata.org/wiki/Q61468436)

**Check (2026-10-07):** 29 fictional locations, linked via *from narrative universe* (P1080); the definition finds 0 without subclasses and 29 with them. Not yet compared with the real number.

## ❌Episodes

**Associated List:** [list of The Simpsons episodes (Q5944)](https://www.wikidata.org/wiki/Q5944)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [animated series episode](https://www.wikidata.org/wiki/Q116048824), [part of the series](https://www.wikidata.org/wiki/Property:P179): [The Simpsons](https://www.wikidata.org/wiki/Q886), [takes place in fictional universe](https://www.wikidata.org/wiki/Property:P1434): [The Simpsons universe](https://www.wikidata.org/wiki/Q61468436), [media franchise](https://www.wikidata.org/wiki/Property:P8345): [The Simpsons](https://www.wikidata.org/wiki/Q7764350)  
**Assessment:** Barely anyone knows individual Episodes’ Titles.

## ✖Video Games

**Associated List:** [list of The Simpsons video games (Q2458013)](https://www.wikidata.org/wiki/Q2458013)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [video game](https://www.wikidata.org/wiki/Q7889)  
**Assessment:** List definition is incomplete

**Check (2026-10-07):** The definition has no qualifier, so it matches every video game (178,131). 27 games are linked via *media franchise* (P8345) = The Simpsons (Q7764350); not yet compared with the real number.

## [to Navigation](#navigation)
