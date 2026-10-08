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
Decided (Trummler, from your analysis): `demonstration-sports` (omitted, both seasons) is adopted and built now; long track speed skating goes on the exclusion list with Winter; athletes: base = Olympedia ID AND a datable P1344, fame = language Wikipedias (sister projects not counted, as in scripts/lib/wikidata.mjs terms()), period slider and a genre control feasible, medal-based tiers or filters dropped. The four Beyond-the-Olympics rubrics are noted for PR #39. Tiers for athletes: one symmetric rule for Summer and Winter alike (Winter's tiers may come out much smaller), with smaller steps than the sports' 20.
Ask: for Summer athletes and Winter athletes separately (season by participation, as in your section), count how many athletes each tier would hold on language Wikipedias, from 0 to an open top tier of 200+, at step sizes 20, 10, 5 and 2 (one table per step size, or one wide table). From that Trummler sets an upper bound (where the open top tier starts), a "show more" bound (entries below it hidden until the reader opts in, like the languages' "<1 million users" box, i.e. `extendFrom`) and an absolute floor (below it no entry at all). Also the dump size per floor: a raw dump has to stay under Git's 50 MB per file, so name the floor where Summer's dump (names in the 30 languages, as sport-names.json) would cross that.
Refs: _untracked/PR/35-geonames_cleanup.md strand V (Athletes, decided); data-raw/sports/olympia/sport-names.json (dump shape); this file, Summer Athletes
-->
<!-- @agent(#35) from #38 · 2026-10-08 · DONE
Answer: counts per tier for Summer and Winter at steps 20 / 10 / 5 / 2 (0 to 200+, language Wikipedias), the top names, and the dump size per floor are in Summer Athletes => "Tier bounds (counts, 2026-10-08)".
Key facts:
- Base: Summer 115,641 athletes, Winter 18,812, 168 in both.
- 200+ is empty in Summer (Messi 196). Winter's only entries from 80 up are Putin (237, for the exclusion list) and Albert II (80).
- Summer's dump (sport-names.json shape, pretty, all 40 Wikidata tags) crosses 50 MB between floors 16 (~46 MB, 15,252 athletes) and 15 (~53 MB). Winter's stays under it at any floor. Minified JSON is about 46 % of the size and would move the crossing to about floor 8.
Proposal (for Trummler to set):
- Open top tier at 100+ (Summer 21, Winter 0), step 10 down to the floor.
- Show-more bound at 30: Summer shows 2,114 by default, Winter 157.
- Floor at 20: Summer 7,598 at ~26 MB, room for the counts to roughly double; Winter 1,163.
- Step 5 instead of 10 splits the crowded 20 to 40 range (Summer 3,871 / 1,613 / 749 / 463) but leaves Winter's tiers above 40 at 0 to 17.
Refs: this file, Summer Athletes => Tier bounds; _scripts/athlete-tiers.mjs, _scripts/athlete-dump-size.mjs
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

### Tier bounds (counts, 2026-10-08)

**Tool:** `_scripts/athlete-tiers.mjs` (per season, from the base above), `_scripts/athlete-dump-size.mjs` (size per floor).  
**Measure:** language Wikipedias with an article (sister projects and Commons not counted, as `terms()` counts them).  
**Base:** 134,285 athletes; Summer 115,641, Winter 18,812, 168 in both.

**Per tier** (athletes in the tier | at or above its lower bound), step 10 down to 40, step 5 below:

| From | Summer | ≥ | Winter | ≥ |
| ----: | ----: | ----: | ----: | ----: |
| 200+ | 0 | 0 | 1 | 1 |
| 100 | 21 | 21 | 0 | 1 |
| 90 | 4 | 25 | 0 | 1 |
| 80 | 20 | 45 | 1 | 2 |
| 70 | 34 | 79 | 0 | 2 |
| 60 | 81 | 160 | 2 | 4 |
| 50 | 288 | 448 | 4 | 8 |
| 45 | 194 | 642 | 17 | 25 |
| 40 | 260 | 902 | 27 | 52 |
| 35 | 463 | 1,365 | 30 | 82 |
| 30 | 749 | 2,114 | 75 | 157 |
| 25 | 1,613 | 3,727 | 261 | 418 |
| 20 | 3,871 | 7,598 | 745 | 1,163 |
| 15 | 10,603 | 18,201 | 2,017 | 3,180 |
| 10 | 17,732 | 35,933 | 3,157 | 6,337 |
| 5 | 31,238 | 67,171 | 6,140 | 12,477 |
| 0 | 48,470 | 115,641 | 6,335 | 18,812 |

Step 20 is the sum of two step-10 rows (200+ 0/1; 180 2/0; 140 3/0; 120 3/0; 100 13/0; 80 24/1; 60 115/2; 40 742/48; 20 6,696/1,111; 0 108,043/17,649).

<details><summary><i>step 10 above 100, and step 2 from 60 down</i></summary>

Step 10 above 100 (Summer / Winter): 190 1/0 (Messi 196), 180 1/0 (Cristiano Ronaldo 186), 140 3/0, 130 2/0, 120 1/0, 110 3/0; 170, 160, 150 empty.

| From | Summer | ≥ | Winter | ≥ |
| ----: | ----: | ----: | ----: | ----: |
| 60 | 26 | 160 | 0 | 4 |
| 58 | 31 | 191 | 1 | 5 |
| 56 | 39 | 230 | 2 | 7 |
| 54 | 46 | 276 | 0 | 7 |
| 52 | 81 | 357 | 0 | 7 |
| 50 | 91 | 448 | 1 | 8 |
| 48 | 74 | 522 | 5 | 13 |
| 46 | 78 | 600 | 9 | 22 |
| 44 | 83 | 683 | 10 | 32 |
| 42 | 97 | 780 | 11 | 43 |
| 40 | 122 | 902 | 9 | 52 |
| 38 | 160 | 1,062 | 7 | 59 |
| 36 | 190 | 1,252 | 13 | 72 |
| 34 | 223 | 1,475 | 21 | 93 |
| 32 | 271 | 1,746 | 31 | 124 |
| 30 | 368 | 2,114 | 33 | 157 |
| 28 | 494 | 2,608 | 73 | 230 |
| 26 | 704 | 3,312 | 118 | 348 |
| 24 | 977 | 4,289 | 154 | 502 |
| 22 | 1,279 | 5,568 | 257 | 759 |
| 20 | 2,030 | 7,598 | 404 | 1,163 |
| 18 | 3,038 | 10,636 | 584 | 1,747 |
| 16 | 4,616 | 15,252 | 837 | 2,584 |
| 14 | 6,308 | 21,560 | 1,195 | 3,779 |
| 12 | 7,015 | 28,575 | 1,196 | 4,975 |
| 10 | 7,358 | 35,933 | 1,362 | 6,337 |
| 8 | 8,517 | 44,450 | 1,872 | 8,209 |
| 6 | 13,103 | 57,553 | 2,493 | 10,702 |
| 4 | 21,888 | 79,441 | 3,893 | 14,595 |
| 2 | 28,734 | 108,175 | 3,584 | 18,179 |
| 0 | 7,466 | 115,641 | 633 | 18,812 |

Full output: `_data/athlete-tiers-run1.txt`.

</details>

**Reading the numbers:**

- **The top is thin.** Nobody in Summer reaches 200 (Messi 196, Cristiano Ronaldo 186). Winter's only entry above 80 is Vladimir Putin (237), who opened Sochi 2014 and belongs on the exclusion list. The top Winter athlete is Wayne Gretzky at 64. Below 40, each step of 5 Wikipedias grows Summer's count by 1.5 to 2 times; below 30, it grows Winter's by 2.5 to 3 times.
- **The non-athletes barely touch the tiers.** In Summer's top 40 there are 5: Juan Carlos I, Felipe VI and Harald V are real Olympic sailors and stay; Coubertin and Gropius go via `art-competitions`. In Winter, Albert II of Monaco (80, bobsleigh) and Aga Khan IV (46, alpine skiing) are real Olympians.
- **Seasons, one rule.** At any bound, Winter holds about a sixth of Summer near 10 to 20 and falls to under a tenth from 30 up. With one symmetric rule, a bound that suits Summer's size leaves Winter short at the top: 4 Winter athletes from 60 up, against 160 in Summer.

**Dump size per floor**, in `sport-names.json`'s shape (pretty JSON, labels and aliases in all 40 Wikidata tags `terms()` reads, plus editions). Estimated from 90 sampled athletes per fame band (entries grow from about 0.9 kB at 0 to 1 Wikipedias to 5.4 kB at 40 to 79), so treat it as ±10 %:

| Floor | Summer athletes | Summer size | Winter athletes | Winter size |
| ----: | ----: | ----: | ----: | ----: |
| 0 | 115,641 | ~195 MB | 18,812 | ~32 MB |
| 10 | 35,933 | ~89 MB | 6,337 | ~15 MB |
| 14 | 21,560 | ~60 MB | 3,779 | ~10 MB |
| **15** | 18,201 | **~53 MB** | 3,180 | ~9 MB |
| **16** | 15,252 | **~46 MB** | 2,584 | ~7 MB |
| 18 | 10,636 | ~34 MB | 1,747 | ~5 MB |
| 20 | 7,598 | ~26 MB | 1,163 | ~4 MB |
| 25 | 3,727 | ~15 MB | 418 | ~2 MB |
| 30 | 2,114 | ~10 MB | 157 | ~1 MB |

- **Where the limit falls.** Summer's dump crosses 50 MB between floors 16 and 15. Winter's stays below it even with no floor at all.
- **Ways to push it lower:**
  - Minified JSON shrinks it to about 46 % (measured on `sport-names.json`: 575 kB pretty => 264 kB minified), which moves the crossing down to about floor 8.
  - So would keeping the 30 `NAME_LANGS` instead of all 40 Wikidata tags.
- **Leave room for growth.** Counts only rise: articles get added and new Games come. A floor right at the limit will cross it within a few years.

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

As Summer Athletes: the same base, fame proxy and filters, restricted to athletes with a Winter participation (18,812 athletes; 1,163 from 20 language Wikipedias up). Tier counts and dump sizes per season: Summer Athletes => Tier bounds.

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
