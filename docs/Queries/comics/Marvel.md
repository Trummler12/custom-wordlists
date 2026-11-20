# Wikidata Query Analysis: Marvel

What Wikidata offers for the Marvel topics, and how far it can serve as their source.

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Navigation

[Comics](../README.md#comics)
- ➕[Heroes](#heroes)
- ➕[Villains](#villains)

## ➕Heroes

**Associated List:** -
**Definition:** -

**Check (2026-10-26):** the Marvel characters are the members of the *Marvel Universe* (Q2246088, P1080): 2,749 characters, 2,982 with subclasses and groups; *publisher* (P123) Marvel Comics adds 8. A second item named *Marvel Universe* (Q931597) holds only 8, so the query takes Q2246088. All 13 heroes and all 9 villains are among the members.
**Heroes vs villains:** none of the 2,749 is typed *superhero* (Q188784) or *supervillain* (Q6498903); the classes are *Marvel comics character* (Q1114461), *mutant*, *mutate*, *Asgardian*. Venom, Loki and Deadpool have been on both sides. As with DC, the split can't come from Wikidata: one `characters.json` (decided by Trummler, 2026-10-27; the role-group check is in DC.md).
**Fame:** our heroes' tiers hold (Spearman 0.87; tier 1 at ranks 1 to 12, tier 2 at 13 to 56); our villains rank 11 to 67 among all members, in tier order roughly (Thanos first).
**Gaps in our list:** heroes Daredevil, Professor X, Scarlet Witch, Jean Grey, the Punisher, Hawkeye, Silver Surfer, Storm (ranks 10 to 26); villains Kingpin, Mystique, Galactus, the Lizard; the X-Men, the Avengers and the Fantastic Four as groups (ranks 5 to 9).
**Query:**
```sparql
SELECT DISTINCT ?item WHERE {
  { ?item wdt:P1080 wd:Q2246088 } UNION { ?item wdt:P123 wd:Q173496 }
  ?item wdt:P31/wdt:P279* wd:Q95074 .
}
```
**Rating:** ➕ for the members; the split stays editorial.

## ➕Villains

Same base as Heroes. **Rating:** ➕, with the same caveat.

## [to Navigation](#navigation)
