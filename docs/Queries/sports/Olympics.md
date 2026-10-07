# Wikidata Query Analysis: Olympics

What Wikidata offers for the Olympics topics, and how far it can serve as their source.

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Navigation

[Sports](../README.md#sports)
- ❌[Athletes](#athletes)
- ➕[Sports](#sports)

## ❌Athletes

*Not analyzed yet.*

## ➕Sports

**Associated List:** -  
**Definition:** -  
**Assessment:** the sports are well covered, and their Olympic history is on Wikidata as events per Games and per edition, which is what the base list and the omission classes are read from (`_scripts/olympics.mjs`).

**Base query** (the sport of every event that is part of the Summer or Winter Games; 107 sports including ballast):

```sparql
SELECT DISTINCT ?sport WHERE {
  VALUES ?games { wd:Q159821 wd:Q82414 }   # Summer / Winter Olympic Games
  ?ev wdt:P361 ?games ; wdt:P641 ?sport .
}
```

**Why basketball was missing:** its series item (basketball at the Summer Olympics, Q208137) is an instance of *sport competition at a multi-sport event*, not *recurring sporting event* (Q18608583) like the others. The base query therefore asks for no class at all.  
**Editions:** the same per Games edition, counting events that are part of the edition or of an event that is (`wdt:P361/wdt:P361?`): 2024 Summer (Q995653), 2026 Winter (Q4630399), and the next one announced, 2028 Summer (Q1451505).

### Proposed classes

| Class | Rule | Parameters | Members (2026-10-07) |
| :---- | :---- | :---- | :---- |
| base | (shown) | held at 2024 Summer or 2026 Winter | 48, from association football to sport climbing |
| `child-discipline` | omittable | current, and *subclass of* (P279) or *part of* (P361) another base sport | 18: beach volleyball, 3x3 basketball, artistic / rhythmic / trampoline gymnastics, BMX, road / track cycling, mountain biking, ski jumping, cross-country skiing, Nordic combined, short-track / long track speed skating, ice dance, pair skating, diving, archery (see caveats) |
| `future-disciplines` | omittable | not current, held at the next announced edition (now 2028 Summer) | 8: cricket, baseball, softball, squash, lacrosse, flag football, coastal rowing, climbing (see caveats) |
| `discontinued` | omitted | held at some Games, at none of the current or next editions | 24: karate, rugby union, American football, polo, tug of war, bandy, ten-pin bowling, motorsport, water skiing, croquet, korfball, Basque pelota, jeu de paume, bocce, icestock sport, speed skiing, powerboating, military patrol, roque, rackets, amateur wrestling, field lacrosse, rugby, cycling (see caveats) |
| excluded | (visible list) | no sport of the topic | Olympic sport (the class itself), art competition as Olympic sport, aeronautics, mountaineering (prizes, not events), water sport and skiing (umbrellas), ladies' / men's singles (event names), Q141163315 (no label) |

### Caveats

- **Per-edition data is fixed on Wikidata, not worked around.** The 2026 ice dance and pair skating events (Q137379145, Q137379148) named only *figure skating* as their sport, where the 2022 ones name the discipline; a QuickStatements batch added *sport* = ice dance / pair skating, referenced to their Olympedia result pages (imported 2026-10-07; the check confirms both as current). Re-check the editions after each Games.
- **Parent links need a visible override list.** P279 makes archery a child of shooting sports and diving a child of competitive swimming (both separate sports at the Games); marathon (athletics) and marathon swimming (swimming) have no parent at all. A small `data-raw` table of parent corrections next to the exclusion list fixes these.
- **Umbrella duplicates.** cycling (= cycle sport), climbing (= sport climbing) and rugby (= rugby union / sevens) are broader items that appear only through one edition each; they belong on the exclusion list as duplicates rather than in `discontinued` / `future-disciplines`.
- **Fame proxy:** sitelinks. English pageviews of the last 12 months agree only moderately (Spearman 0.76 over the 67 current sports) and are skewed by the February 2026 Winter Games (curling ranks 2nd, skeleton 10th) and by article titles (equestrian sport 3,683 views, canoeing 833). Sitelinks are stable and not tied to one language.

<details><summary><i>the three class queries tried first (2026-10-06)</i></summary>

| Query | Results | Missing, e.g. | Not a current Olympic sport, e.g. |
| :---- | :---- | :---- | :---- |
| `P279 Q212434` (subclass of *Olympic sport*) | 55 | football, basketball, volleyball, gymnastics, rowing, handball, archery | women's / men's water polo, "Olympic winter sport", tug of war, rackets |
| `P31 Q212434` (instance of *Olympic sport*) | 31 | tennis, athletics, swimming | "art", skeet variants, "English boxing" |
| "X at the Summer / Winter Olympics" (`P31 Q18608583`, `P361` Summer / Winter Games, `P641` the sport) | 82 | basketball | every sport ever held, art competitions, upcoming LA 2028 sports |

</details>

## [to Navigation](#navigation)
