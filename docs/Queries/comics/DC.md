# Wikidata Query Analysis: DC

What Wikidata offers for the DC topics, and how far it can serve as their source.

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

**Check (2026-10-26):** the DC characters are the members of the *DC Universe* (Q1152150, P1080): 1,837 characters, 2,078 with subclasses and groups; *publisher* (P123) DC Comics adds 15. All 7 of our heroes and all 7 villains are among them.
**Heroes vs villains:** Wikidata doesn't tell them apart. Of the 1,837 only 45 are typed *superhero* (Q188784) and 5 *supervillain* (Q6498903); Batman, Superman and the Joker are none of them, but *DC Comics character* (Q1114461), *fictional human*, *metahuman*. Nor is a role a fixed fact: Catwoman, Harley Quinn or Deadshot change sides from one series to the next. So the split can't come from Wikidata (see the proposal at the end of this file).
**Fame:** sitelinks follow our heroes' tiers (Spearman 0.87; tier 1 at ranks 1 to 3, tier 2 at 6 to 11). Among the villains alone the order holds as well (Joker, Catwoman, Harley Quinn, Two-Face, Lex Luthor, Riddler, Bane at ranks 4 to 23 of all members).
**Gaps in our list:** heroes Batgirl, Robin, Captain Marvel (Shazam), Supergirl, Martian Manhunter, Cyborg; villains Poison Ivy, Ra's al Ghul, the Penguin, Scarecrow, Darkseid, Mr. Freeze (ranks 14 to 30); the Justice League as a group (rank 9).
**Query:**
```sparql
SELECT DISTINCT ?item WHERE {
  { ?item wdt:P1080 wd:Q1152150 } UNION { ?item wdt:P123 wd:Q2924461 }
  ?item wdt:P31/wdt:P279* wd:Q95074 .
}
```
**Rating:** ➕ for the members; the split into heroes and villains stays editorial.

## ➕Villains

Same base as Heroes (one query for both). **Rating:** ➕, with the same caveat.

**Decided (Trummler, 2026-10-27):** one topic `comics/dc/characters.json` (and `comics/marvel/characters.json`) instead of heroes and villains: Wikidata has no line between them, many characters cross it, and an editorial split would also need antiheroes and more.
**Role groups (checked 2026-10-27):** an `omittable` group *Heroes / Villains / Antiheroes / Others* would need a statement to build on, and Wikidata has none that holds:
- Role qualifiers: none. *Subject has role* (P2868) on a character's own item holds only "player character" (24 at DC); in the works' casts (P674) a role qualifier sits on 1 DC and 39 Marvel characters, all "player character".
- Team membership (P463) to a team typed *superhero team* (Q15720567) or *supervillain team* (Q16101952) is the only proxy: DC 271 hero only, 287 villain only, 64 both, 1,215 neither; Marvel 240, 55, 10, 2,444. It fails on our own entries: Superman, Lex Luthor and Harley Quinn land in both, the Flash in neither, Magneto and Doctor Doom among the heroes (Avengers and X-Men stints), Thanos, Loki and the Green Goblin in neither.
- *Enemy* (P7047) is set on 514 DC and 554 Marvel characters, but an enemy of a villain is no hero.

So a role group stays out until Wikidata models roles; per work it would mostly be empty anyway (outside superhero comics there are at most antagonists, who often turn allies, as in One Piece).

## [to Navigation](#navigation)
