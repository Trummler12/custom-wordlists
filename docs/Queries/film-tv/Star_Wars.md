# Wikidata Query Analysis: Star Wars

What Wikidata offers for the Star Wars topics, and how far it can serve as their source.

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

**Associated List:** [list of Star Wars characters (Q51805)](https://www.wikidata.org/wiki/Q51805)
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [character (Q95074)](https://www.wikidata.org/wiki/Q95074), [present in work](https://www.wikidata.org/wiki/Property:P1441): [Star Wars (Q462)](https://www.wikidata.org/wiki/Q462); and [character from Star Wars (Q33125444)](https://www.wikidata.org/wiki/Q33125444)

**Check (2026-10-23):** the first definition finds 24: characters link the franchise by *media franchise* (P8345), not P1441. The class *character from Star Wars* holds 424 and 28 of our 30; Finn (Q21772120) and BB-8 (Q21541731) lacked it (batch below), so 30 of 30 since. By link to the Star Wars universe (Q19786052) or the franchise (Q462) through P1080 / P8345: 734 characters, all 30 of ours.
**Fame:** Spearman 0.77; tier 3 ends at rank 36, and only six members rank above it without being in our list: Tarkin and Thrawn, and the groups Jedi, Stormtroopers, Wookiees and Mandalorians.
**Gaps in our list:** next by sitelinks are Aayla Secura, Shmi Skywalker, Admiral Ackbar, Snoke, Asajj Ventress, Ki-Adi-Mundi, Jyn Erso, Watto, Revan, Darth Bane, Darth Plagueis (ranks 37 to 48).
**Batch** (`2026-10-23_starwars-character-class.txt`, imported and verified 2026-10-23): Finn and BB-8 typed *character from Star Wars*, each referenced to its page in the official Databank.
**Query:**
```sparql
SELECT DISTINCT ?item WHERE {
  VALUES ?work { wd:Q19786052 wd:Q462 }
  { ?item wdt:P1080 ?work } UNION { ?item wdt:P8345 ?work }
  ?item wdt:P31/wdt:P279* wd:Q95074 .
}
```
**Rating:** ➕. The list's first definition should name P8345.

## [to Navigation](#navigation)
