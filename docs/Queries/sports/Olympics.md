# Wikidata Query Analysis: Olympics

What Wikidata offers for the Olympics topics, and how far it can serve as their source.

**Split by season** (Trummler, 2026-10-08): `data/topics/sports/olympia/summer/` and `winter/`, each with Sports and Athletes and `inheritsUpwards: 1`, so the Olympics category merges them one level up. A sport belongs to the season of the latest edition it was held at (figure skating, held at two Summer Games before the Winter Games existed, is a winter sport). Members of such a family must cut the same tier bands and carry identical rules (same id => same reason).

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
- ✅[Summer Sports](#summer-sports)
- ➕[Summer Athletes](#summer-athletes)
- ☑️[Winter Sports](#️winter-sports)
- ➕[Winter Athletes](#winter-athletes)

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

<!-- @agent(#35) from #38 · 2026-10-08 · DONE
Decided: All four asks answered in this file; nothing built on my side.
Ask 1: Reshaped into Summer Sports (shared query base, rules, caveats), Summer Athletes, Winter Sports, Winter Athletes; the hub follows (hub.mjs). Summer Sports marked ✅, Winter Sports ☑️.
Ask 2: Winter needs none of its own rules; tiers 1/1/9/6/5/2 are fine; ice dance / pair skating read as their own sports since the batch import (child-discipline of figure skating). To decide: long track speed skating is a duplicate of speed skating (exclusion list, like climbing), and a new rule for BOTH seasons, `demonstration-sports` (omitted): sports whose every Games event is P31 Q1123217 "Olympic demonstration sport competition" (summer: American football, motorsport, korfball, water skiing, bocce; winter: icestock sport, speed skiing), taken out of `discontinued`. Bandy 1952 / military patrol 1928-48 lack the class, polo / ten-pin bowling / lacrosse have no edition events: Wikidata fixes, not special cases.
Ask 3: Base = Olympedia ID (P8286) AND a datable P1344 (edition, sport-at-edition or event; 79 % have one); the ID alone also holds officials and heads of state. Fame = sitelinks (≥ 30: ~2,600 athletes). Period slider feasible (first/last edition year); gold-only and medal counts are not (medals are qualifiers on P1344 and missing for e.g. Ali 1960, Messi 2008). Genre: feasible only as a visible data-raw mapping sport => genre (Wikidata's classes overlap and miss 14 sports), best as one omittable rule per genre in an icon control like the sovereignty matrix. Candidate rule `art-competitions` (omitted). Editions are Q135976384 / Q137592217 instances, not of the series items.
Ask 4: See "Beyond the Olympics": Paralympics, World Games, Commonwealth, Asian Games as candidates (added to the hub's Sports candidates); merge by sport QID, Para variants are P279 children of their Olympic sport. Other series are modelled less consistently, each needs its own look.
Note on the short dump run: not reproduced here. A separate gap: scripts/lib/wikidata.mjs getJson() returns res.json() outside its try, so a connection dropped mid-answer (a query near the timeout) fails the run instead of retrying; wd.mjs had the same and now retries. That fails loudly, though; a short answer without an error points to a lagging WDQS server, so comparing two runs (or the edition count) is the guard.
Refs: _untracked/docs/Queries/sports/Olympics.md (all sections); _scripts/athletes.mjs, multisport.mjs
-->

## ✅Summer Sports

**Associated List:** -  
**Definition:** -  
**Built by** #35: `scripts/sports/{dump,build}-olympic-sports.mjs`; hand input only in two visible tables, `data-raw/sports/olympia/excluded.json` and `parents.json`. The query base and rules below hold for both seasons.

**Base query** (the sport of every event that is part of the Summer or Winter Games):

```sparql
SELECT DISTINCT ?sport WHERE {
  VALUES ?games { wd:Q159821 wd:Q82414 }   # Summer / Winter Olympic Games
  ?ev wdt:P361 ?games ; wdt:P641 ?sport .
}
```

**No class condition:** basketball's series item (Q208137) is typed *sport competition at a multi-sport event*, not *recurring sporting event* like the others.  
**Editions** are instances of *Summer Olympic Games edition* (Q135976384) / *Winter Olympic Games edition* (Q137592217), not of the series items; their events sit one or two `P361` levels below them. They date the sports, and the current and upcoming ones add the disciplines the series level leaves out (ski jumping, BMX, ice dance).  
**Rules (as built):**

| Rule | Default | Parameters |
| :---- | :---- | :---- |
| `discontinued` | omitted | not held at the current edition of its season or later |
| `future-disciplines` | omittable | held only at an edition still to come |
| `child-discipline` | omittable | held now, and a discipline (P279 / P361, corrected by `parents.json`) of another sport still held |

**Tiers:** language Wikipedias with an article (sitelinks to Wikipedias only), fixed bands 100 / 80 / 60 / 40 / 20 / >0 for both seasons.  
**Check (2026-10-08):** 71 Summer sports, tiers 18/7/17/15/7/7; discontinued 18, future-disciplines 7, child-discipline 11 (reproduced from #35's dump with its rules).

### Candidate rule: demonstration sports

Wikidata marks the events of sports that were only shown, not contested for medals, as *Olympic demonstration sport competition* (Q1123217, 76 events). Of the 22 discontinued sports (both seasons), by their edition events:

| Kind | Sports |
| :---- | :---- |
| demonstration only | American football (1932), motorsport (1900, 1936), korfball (1920, 1928), water skiing (1972), bocce (1900); winter: icestock sport (1936, 1964), speed skiing (1992) |
| mixed | Basque pelota (official 1900, then demonstration), jeu de paume, powerboating |
| official | karate, rugby union, tug of war, croquet, roque, rackets, amateur wrestling; winter: military patrol, bandy (see gaps) |
| no edition event | polo, ten-pin bowling, field lacrosse |

**Rule:** `demonstration-sports`, omitted, for a sport every one of whose Games events is a demonstration; `discontinued` keeps the ones contested for medals at least once. A meaningful class (these were at the Games, just never for medals), so a rule rather than an exclusion, and the same rule in both seasons.  
**Gaps to fix on Wikidata** (QuickStatements, sources pending): bandy 1952 and military patrol 1928 / 1936 / 1948 were demonstrations but lack the class; polo (1900 to 1936), ten-pin bowling (1988, demonstration) and lacrosse (1904, 1908, then demonstrations) have no edition-level events, so their dates come from nowhere.

### Caveats

- **Per-edition data is fixed on Wikidata, not worked around.** The 2026 ice dance and pair skating events once named only *figure skating*; a QuickStatements batch added their disciplines (imported 2026-10-07; both now read as their own sports). Re-check the editions after each Games.
- **Umbrella duplicates** go on the exclusion list (climbing = sport climbing); see Winter Sports for long track speed skating.
- **Fame proxy:** sitelinks rather than pageviews (Spearman 0.76 over the 67 current sports; pageviews skewed by the February 2026 Games and by article titles).
- **Dump runs:** #35 saw one run return far fewer editions for some sports, a rerun matched again; not reproduced here. A short answer without an error points to a lagging WDQS server, so a second run (or comparing the edition count) is the guard. A connection dropped mid-answer is another matter: it throws while the body is read, which `_scripts/wd.mjs` now retries.

<details><summary><i>the three class queries tried first (2026-10-06)</i></summary>

| Query | Results | Missing, e.g. | Not a current Olympic sport, e.g. |
| :---- | :---- | :---- | :---- |
| `P279 Q212434` (subclass of *Olympic sport*) | 55 | football, basketball, volleyball, gymnastics, rowing, handball, archery | women's / men's water polo, "Olympic winter sport", tug of war, rackets |
| `P31 Q212434` (instance of *Olympic sport*) | 31 | tennis, athletics, swimming | "art", skeet variants, "English boxing" |
| "X at the Summer / Winter Olympics" (`P31 Q18608583`, `P361` Summer / Winter Games, `P641` the sport) | 82 | basketball | every sport ever held, art competitions, upcoming LA 2028 sports |

</details>

## ➕Summer Athletes

**Associated List:** -  
**Now:** a hand list of famous athletes of any sport (Messi, Jordan, McGregor), parked in `summer/`; to be replaced.  
**Tool:** `_scripts/athletes.mjs` (counts; further probes recorded here).

**How Wikidata models them.** Every Olympian has an Olympedia ID (P8286): 168,974 people. A participation is *participant in* (P1344) with the edition itself (99,426 people), the sport at that edition (8,575) or the single event (34,408) as its value; the rank (P1352) and the medal (P166) ride on it as qualifiers, not as a direct *award received*.

| | Count | Note |
| :---- | :---- | :---- |
| Olympedia people | 168,974 | not only athletes: officials, art competitors, heads of state who opened Games |
| with a sport (P641) | 164,213 | |
| with a datable participation (any of the three levels) | 134,285 (79 %) | the editions carry their start date (60 of 68; the others are the cancelled 1916, 1940 and 1944 Games and those announced for 2036 to 2040) |
| with a medal qualifier | 11,216 (gold 4,459) | far from complete: Muhammad Ali (1960) and Lionel Messi (2008) have their participation but no medal on it |
| sitelinks ≥ 10 / 20 / 30 / 50 / 100 | 47,973 / 11,188 / 3,130 / 770 / 97 | |

**Who is an athlete.** Among the 3,130 with ≥ 30 sitelinks:

| Group | Count | Top by sitelinks |
| :---- | :---- | :---- |
| sports occupation (P106 under *athlete*, Q2066131) **and** a datable participation | **2,564** | Messi, Cristiano Ronaldo, Ali, Federer, Neymar, Nadal, Djokovic, Zidane, Jordan, Bolt |
| participation, no sports occupation | 31 | royal sailors (Juan Carlos I, Harald V, Olav V: real Olympians), art-competition entrants (Gropius, Grosz, Liebermann), Coubertin, a referee, Putin |
| sports occupation, no participation | 258 | non-Olympians with an Olympedia page (Pelé, Henry, Blatter, monarchs) and Olympians whose participation is missing (Di María, Pacquiao) |
| neither | 277 | heads of state, popes, Turin |

**Proposed base:** Olympedia ID **and** a datable participation (P1344 to an edition or below it). That is the competitor test; the sports occupation only sorts the 31 (royal sailors stay, see the art rule). Candidate rules: `art-competitions` (omitted; entrants whose only participations are art competitions, 1912 to 1948, which were official events then); the rest of the 31 (officials) on the exclusion list. The 258 without participation are a data gap where they were Olympians, not a rule.  
**Fame proxy:** sitelinks (the same measure as the sports; medals are too sparse to count). ≥ 30 gives about 2,600, ≥ 50 about 750: a size choice for the tiers' floor.

**Filters a reader might want**, against the data:

| Filter | Data | Verdict |
| :---- | :---- | :---- |
| period of activity (range slider, like strand H's century slider) | first and last edition year from the participations, for 2,596 of the 3,130 | **feasible**, by decade; spread: 1890s to 1940s about 190, 1950s to 1980s about 400, 1990s 297, 2000s 797, 2010s 645, 2020s 269 (first Games) |
| the same, gold years only | medal qualifiers | **not reliable** (Ali, Messi without one) |
| number / rank of medals ("gold medallists only", a medal score as fame) | medal qualifiers on 11,216 people | **not reliable**; would need medals for all event-level participations on Wikidata, beyond a QuickStatements batch |
| coarse genre (athletics / aquatics / combat / ball / racket / cycling / gymnastics / winter …) | the athlete's P641 (111 sports among the 3,130; football 1,182, athletics 476, tennis 359, basketball 183) mapped to a genre | **feasible via a visible `data-raw` mapping** sport => genre: Wikidata's own classes don't serve (*ball game* reaches 100 of the 105 sports' class trees, volleyball counts as *racket sport*, 14 sports reach none: karate, taekwondo, archery, shooting, climbing, skateboarding, breaking, modern pentathlon) |

**From the reader's side.** The list is dominated by footballers (38 % at ≥ 30 sitelinks) and tennis players, who are famous for other things than the Games; a genre control is what makes the rest reachable. Fit with the existing UI:

- tiers + ruler: sitelinks, fixed bands like the sports;
- genre: one omittable rule per genre, grouped into one icon control like the sovereignty matrix (a row of genre icons, all on by default), so "only winter and combat" is two clicks;
- period: the range slider planned for historical countries (PR #39, strand H), matching an athlete when their active span overlaps the range.

**Season split:** an athlete belongs to the season(s) of their participations: 208 of the 3,130 have a Winter participation, 4 both seasons (they appear in both lists; the merged list one level up shows them once).

## ☑️Winter Sports

**Base, rules, tiers:** as for Summer Sports (same query, same three rules, same bands); no rule Winter needs that Summer lacks, beyond `demonstration-sports` should it be adopted for both.  
**Check (2026-10-08), with #35's rules on its dump:** 24 sports, tiers 1/1/9/6/5/2 (ice hockey | curling | figure skating … speed skating | skeleton … nordic skiing | ice dance, ski mountaineering, icestock, speed skiing, military patrol | pair skating, long track speed skating).

| Class | Members |
| :---- | :---- |
| base (13) | ice hockey, curling, figure skating, biathlon, bobsleigh, snowboarding, alpine skiing, speed skating, skeleton, luge, freestyle skiing, nordic skiing, ski mountaineering |
| `child-discipline` (7) | ski jumping, cross-country skiing, Nordic combined (of nordic skiing); short-track and long track speed skating (of speed skating); ice dance, pair skating (of figure skating) |
| `discontinued` (4) | bandy, icestock sport, speed skiing, military patrol |
| `future-disciplines` (0) | none yet: the 2030 Games' events exist for part of the programme only (ice hockey, curling, figure skating, ski jumping, …), and nothing new among them |

**Ice dance / pair skating:** read as their own sports since the batch was imported; both `child-discipline` of figure skating, as intended.  
**Tiers:** nothing off. Pair skating's low band (17 Wikipedias) is real: most languages cover it inside figure skating.  
**Points to decide:**

- **Long track speed skating** (14 Wikipedias) is the Olympic discipline called *speed skating* (60): a duplicate rather than a child, like climbing / sport climbing. Proposed: exclusion list ("duplicates speed skating"), so speed skating stands for it and short track stays its child.
- **Nordic skiing** is an umbrella with its own events (24 editions), consistent with cycle sport and gymnastics in Summer: base, with its three disciplines as children. Fine as is.
- **Demonstration sports:** icestock sport and speed skiing would move from `discontinued` to `demonstration-sports`, bandy too once its 1952 event carries the class.

## ➕Winter Athletes

As Summer Athletes: the same base, fame proxy and filters, restricted to athletes with a Winter participation (208 at ≥ 30 sitelinks, so a floor nearer 20 sitelinks suits Winter better; a size choice once built).

### Beyond the Olympics (both seasons)

**Other multi-sport events** for an `inheritsUpwards: 2` "Sports" above `olympia/` (not to build yet). Tool: `_scripts/multisport.mjs`, sports via the series' events or its editions' events:

| Series | Sports found | Also Olympic |
| :---- | :---- | :---- |
| Commonwealth Games (Q178340) | 48 | 36 |
| European Games (Q641572) | 30 | 27 |
| Asian Games (Q483463) | 25 | 19 |
| World Games (Q673097) | 24 | 8 |
| Summer Youth Olympics (Q3178415) | 15 | 14 |
| Pan American Games (Q230186) | 14 | 11 |
| Summer Paralympics (Q3327913) | 10 | 3 |
| Winter Youth Olympics (Q3178414) | 7 | 7 |
| Winter Paralympics (Q3317976) | 1 | 0 |
| X Games (Q527512) | 0 | 0 |

**Coverage:** uneven. The Paralympics hold 22 sports, the World Games over 30, the X Games' events aren't linked this way at all; these series are modelled less consistently than the Olympics, so each needs its own look before it can be built.  
**Merging:** by sport QID, so football is one entry however many rubrics hold it. The 42 non-Olympic sports found are mostly World Games sports (fistball, orienteering, sumo, canoe polo, …), Commonwealth ones (netball, bowls), Asian Games ones (xiangqi, dragon boat) and Para variants (wheelchair basketball, Para judo). The Para variants are subclasses (P279) of their Olympic sport (wheelchair basketball, Para judo, Para athletics, para taekwondo, adaptive wrestling, Para cross-country skiing; not dartchery or powerlifting), so they would fall under a `child-discipline`-like rule rather than stand beside it; the finds also include events and umbrellas (100 metres, long jump, cycling) for an exclusion list, as with the Olympics.  
**Candidates in order of value:** Paralympics (a season split like the Olympics, few new names but a known event), World Games (the most new sports), Commonwealth Games (netball, bowls), Asian Games; the Youth Olympics add little (beach handball).

## [to Navigation](#navigation)
