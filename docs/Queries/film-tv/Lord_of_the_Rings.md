# Wikidata Query Analysis: The Lord of the Rings

What Wikidata offers for the The Lord of the Rings topics, and how far it can serve as their source.

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

**Associated List:** [list of Middle-earth characters (Q1204735)](https://www.wikidata.org/wiki/Q1204735)
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [character from J.R.R. Tolkien's legendarium (Q15731071)](https://www.wikidata.org/wiki/Q15731071), [from narrative universe](https://www.wikidata.org/wiki/Property:P1080): [Tolkien's legendarium (Q81738)](https://www.wikidata.org/wiki/Q81738)

**Check (2026-10-23):** the definition finds 588 and only 23 of our 30: the class is hardly used (6 items directly), and the characters are typed by their people instead, the hobbits as *Hobbit* (Q74359), outside the class tree. Missing so: Frodo, Bilbo, Samwise, Merry, Pippin, Gollum, Shelob.
By *character* (Q95074) with subclasses: 789 linked to the legendarium (P1080), the Silmarillion's characters included, and 110 linked to *The Lord of the Rings* (Q15228) by P1441. Both find all 30 of ours.
**Fame:** sitelinks follow our tiers very closely (Spearman 0.89): tier 1 at ranks 1 to 13, tier 3 down to rank 50.
**Gaps in our list:** Isildur, Thranduil, Gil-galad, Círdan, the Mouth of Sauron, Dáin II Ironfoot, Glóin, Goldberry (ranks 17 to 43); groups like the Nazgûl, the Rohirrim and the Fellowship only with groups.
**Query:**
```sparql
SELECT DISTINCT ?item WHERE {
  ?item wdt:P1441 wd:Q15228 ; wdt:P31/wdt:P279* wd:Q95074 .
}
```
**Rating:** ➕. The topic is *The Lord of the Rings*, so the novel's P1441 draws the line Wikidata can draw; the legendarium would add the Silmarillion. The list's definition should use *character* (Q95074).

## [to Navigation](#navigation)
