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

<!-- @agent(#38) from #35 · 2026-10-08 · OPEN
Decided (Trummler): Olympics is split by season, like the continents. Now built: data/topics/sports/olympia/summer/{sports,athletes}.json with summer/_category.json (title from Q159821's labels), both `inheritsUpwards: 1`, so once winter/ exists the Olympics category gets a merged "Sports" (and "Athletes") on its own. Ids stay `sports` / `athletes` until a second season shares the stem, then the validator wants `summer-sports` / `winter-sports`. Summer Sports is built from your analysis: scripts/sports/{dump,build}-olympic-sports.mjs; data-raw/sports/olympia/{excluded,parents}.json (visible tables); season = kind of the latest edition held (figure skating => winter); a child-discipline needs a parent that is still held (rugby sevens stands alone now that rugby union is discontinued); tiers by language-Wikipedia articles (sister projects not counted) in fixed steps 100/80/60/40/20/>0 for both seasons, so the merge stays ranked. Summer as of today: 71 sports, tiers 18/7/17/15/7/7; discontinued 18, future-disciplines 7, child-discipline 11.
Ask 1, structure: Reshape this file along the split (a Summer and a Winter part, each with Sports and Athletes), and the hub accordingly.
Ask 2, Winter Sports, for the next batch: the same analysis as for Summer, restricted to the Winter Games: base / rules / exclusions / parent corrections. The validator requires every member of an inheritsUpwards family to cut the same tier bands and carry identical rules (same id => same reason), so name anything Winter needs that Summer's three rules don't cover. Winter's tiers at the fixed bands are 1/1/9/6/5/2: say if anything is off there (ice dance / pair skating still read as figure skating until your QuickStatements batch is imported?).
Ask 3, Olympic athletes, a thorough analysis with a UX view (Trummler's questions, all open): which athletes at all (medallists only? a fame floor such as sitelinks?), and how a reader would want to filter them:
  - by period of activity (a range slider like the one planned for historical countries in #39 strand H; from P580/P582 of their participations, or the editions they competed at)?
  - the same, but counting only years with a gold medal?
  - by number and rank of medals won (e.g. a medal score as the fame proxy, or rules such as "gold medallists only")?
  - by a coarse 'genre' of sport (discipline is too fine: e.g. athletics / aquatics / combat / ball / winter...), and does Wikidata supply such a grouping or would it be a visible data-raw mapping?
  What is possible from the data, what is most useful and pleasant from the reader's side, and what fits the existing UI (tiers + ruler, omission rules, icon controls such as the sovereignty matrix). Also: how complete are participations and medals on Wikidata (P1344 participant in, P166 award received, P1352 ranking), and which fame proxy fits athletes (sitelinks again?). The current athletes.json is a hand list of famous athletes of any sport (Messi, Jordan, McGregor), only parked in summer/; it will be replaced.
Ask 4, candidates: further rubrics beside olympia/ (Paralympics, World Games, Commonwealth / Asian Games, X Games, …) for an `inheritsUpwards: 2` "Sports" at the top. They overlap heavily (football everywhere), so note how they would merge; nothing to build yet.
Note: one dump run returned far fewer editions for some sports (a WDQS server lagging?); a rerun matched again. Worth a look if you see the same in _scripts/olympics.mjs.
Refs: scripts/sports/build-olympic-sports.mjs (header), data/topics/sports/olympia/summer/sports.json, scripts/validate-data.mjs (family checks), _untracked/PR/39-extend_wikidata.md strand H (slider)
-->

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
