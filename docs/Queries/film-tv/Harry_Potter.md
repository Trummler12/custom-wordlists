# Wikidata Query Analysis: Harry Potter

What Wikidata offers for the Harry Potter topics, and how far it can serve as their source.

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
- ➕[Characters](#characters)

## ➕Characters

**Associated List:** [list of Harry Potter characters (Q208255)](https://www.wikidata.org/wiki/Q208255)
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [character (Q95074)](https://www.wikidata.org/wiki/Q95074), [from narrative universe](https://www.wikidata.org/wiki/Property:P1080): [Harry Potter universe (Q5410773)](https://www.wikidata.org/wiki/Q5410773)

**Check (2026-10-23):** 356 characters link to the Harry Potter universe, the *Wizarding World* franchise (Q30739117), *Harry Potter* (Q216930) or the book series (Q8337); the definition's P1080 alone finds 354. All 34 of our entries are among them (`vs-topic.mjs`).
**Fame:** sitelinks follow our tiers closely (Spearman 0.75, `topic-rank.mjs`): tier 1 sits at sitelink ranks 1 to 11 (one at 50), tier 3 reaches down to rank 158.
**Gaps in our list:** the best-known members we lack are Lily and James Potter, Bill, Charlie and Percy Weasley, Narcissa Malfoy, Salazar Slytherin, Flitwick, Sprout, Grindelwald, Quirrell, Filch and Trelawney (ranks 22 to 49). Groups (Death Eaters, the Order of the Phoenix, the Weasley family) come in only where groups of fictional characters are asked for too.
**Query:**
```sparql
SELECT DISTINCT ?item WHERE {
  VALUES ?work { wd:Q5410773 wd:Q30739117 wd:Q216930 wd:Q8337 }
  { ?item wdt:P1441 ?work } UNION { ?item wdt:P1080 ?work } UNION { ?item wdt:P8345 ?work }
  ?item wdt:P31/wdt:P279* wd:Q95074 .
}
```
**Rating:** ➕. Wikidata can supply the members and a first fame order; the tiers stay editorial, sitelinks only rank the candidates.

## [to Navigation](#navigation)
