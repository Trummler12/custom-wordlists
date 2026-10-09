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
**Rules** (`discontinued` and `future-disciplines` as decided 2026-10-09 for every Games list, built by #35 in V4c):

| Rule | Default | Parameters |
| :---- | :---- | :---- |
| `discontinued` | omitted | held at neither of the last two begun editions of its list, nor at the next one |
| `future-disciplines` | omittable | not discontinued, but held only at the next edition among those three |
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
| edition events under another sport QID (2026-10-09) | polo (dated through its tournaments since; resolved), ten-pin bowling (1988 event names generic *bowling*), field lacrosse (1904 to 1948 events name generic *lacrosse*) |

**Rule:** `demonstration-sports`, omitted, for a sport every one of whose Games events is a demonstration; `discontinued` keeps the ones contested for medals at least once. A meaningful class (these were at the Games, just never for medals), so a rule rather than an exclusion, and the same rule in both seasons.  
**Gaps on Wikidata, fixed (2026-10-09, sourced from Olympedia; imported and checked on the items the same day; files in `_data/QuickStatements/imported/`):**

| Batch (`_data/QuickStatements/`) | Edits | What |
| :---- | :---- | :---- |
| `2026-10-09_olympics-demonstrations.txt` | 4 | *Olympic demonstration sport competition* on bandy 1952 and military patrol 1928 / 1936 / 1948 (military patrol 1924 was a medal event, so it stays `discontinued`; bandy becomes `demonstration-sports`) |
| `2026-10-09_olympics-event-sports.txt` | 11 | P641 *ten-pin bowling* on the 1988 bowling event, *field lacrosse* on the five lacrosse events 1904 to 1948 (Olympedia: all were field lacrosse), *polo* on the five polo events 1900 to 1936 (they named *equestrian sport*) |
| `2026-10-09_olympics-events-removals.txt` (after the two above) | 16 | removes the superseded values: the generic *Olympic sports discipline event* beside the demonstration class (on the four events and lacrosse 1948), and *bowling* / *lacrosse* / *equestrian sport* beside *ten-pin bowling* / *field lacrosse* / *polo*; each is a direct superclass of the new value |

**Polo** was already dated through its tournaments, which name polo; the edition events get the precise value all the same, since Wikidata wants the most specific one.

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
- **Demonstration sports:** icestock sport and speed skiing would move from `discontinued` to `demonstration-sports`, bandy too, since its 1952 event carries the class (batch imported, see Candidate rule: demonstration sports).

## ➕Winter Athletes

As Summer Athletes: the same base, fame proxy and filters, restricted to athletes with a Winter participation (18,812 athletes; 1,163 from 20 language Wikipedias up). Tier counts and dump sizes per season: Summer Athletes => Tier bounds.

### Structure of the Sports category (decided 2026-10-09)

**Decided** (Trummler with #35, from the proposal of 2026-10-08):

- Level 2 holds `games/` ("Games" / "Spiele", long "Multi-sport Games" / "Multisport-Spiele") and one group per sport (football, basketball, motorsport, tennis for now).
- A series is split by season wherever it is officially split. Season-split series use `inheritsUpwards: 2, skipInherit: 1`, unsplit ones `inheritsUpwards: 1`. All of them meet at `sports/games/`, and nothing merges at `sports/`.
- **#35 builds** every Games rubric's `sports.json`. **#39 fills** every other leaf (athletes, players, teams, drivers, circuits, the Olympic athletes too), which #35 creates empty as `plannedTopic`.

```text
sports/
  games/                                    Merged here: "Sports" (built), "Athletes" (planned)
    olympia/{summer,winter}/sports.json     inheritsUpwards 2, skipInherit 1 (athletes.json planned)
    paralympics/{summer,winter}/sports.json inheritsUpwards 2, skipInherit 1
    asian-games/{summer,winter}/sports.json inheritsUpwards 2, skipInherit 1
    world-games/sports.json                 inheritsUpwards 1
    commonwealth-games/sports.json          inheritsUpwards 1
  football/ basketball/ motorsport/ tennis/ planned leaves only
```

**Winter counterparts** of the five series:

| Series | Official winter counterpart | On Wikidata |
| :---- | :---- | :---- |
| Olympics | Winter Olympic Games | Q82414, its own series |
| Paralympics | Winter Paralympic Games | Q3317976, its own series |
| Asian Games | **Asian Winter Games** (Olympic Council of Asia) | Q818463, its own series with 11 editions => `asian-games/winter/` |
| Commonwealth Games | none: the Commonwealth Winter Games (St. Moritz 1958 to 1966) were only "associated games" of the federation, not its own | Q5153879, without editions; not a season of the series |
| World Games | none | |

**Who the leaves would reach** (2026-10-08, `_scripts/sports-structure.mjs`; people with a participation, then those with ≥ 20 Wikipedias, and how many of those are Olympians anyway):

| Rubric | People | ≥ 20 | Olympians among them |
| :---- | ----: | ----: | ----: |
| Summer / Winter Olympics | 115,641 / 18,812 | 7,598 / 1,163 | (all) |
| Summer / Winter Paralympics | 4,751 / 733 | 21 / 3 | 10 / 1 |
| World Games | 399 | 12 | 9 |
| Commonwealth Games | 7,934 | 345 | 317 |
| Asian Games | 7,832 | 564 | 466 |
| FIFA World Cup | 9,075 | 5,700 | 922 |
| Premier League / La Liga / Serie A / Bundesliga (all-time players) | 14,543 / 8,325 / 11,061 / 6,106 | 2,290 / 1,959 / 1,703 / 1,356 | 228 / 280 / 275 / 154 |
| NBA / NHL / NFL / MLB (all-time players) | 4,332 / 8,135 / 20,809 / 16,838 | 738 / 189 / 76 / 54 | 227 / 145 / 11 / 7 |
| Formula One drivers / tennis players (occupation) | 1,075 / 15,875 | 512 / 1,053 | 3 / 648 |

**For #39's people leaves:**
- Under the absolute bands, a Para athletes list stays tiny (21 at the floor). The other Games add at most 98 new names each beyond the Olympics.
- League player lists aren't clean: a club's P54 players include its seasons outside the league.
- Team lists need a P31 filter, because P118 also hangs on games and seasons (the NBA has 77,381 P118 subjects but 30 current teams). Football clubs are classed under *sports club*, not *sports team*, so their filter needs both classes.

<details><summary><i>the proposal as sent (2026-10-08): why Games beside groups by sport</i></summary>

- **The competition's sport (P641)** is clean: every single-sport competition checked has exactly one (FIFA World Cup, Champions League, Premier League, La Liga => football; NBA => basketball; NFL => American football; MLB => baseball; Wimbledon => tennis; Formula One => auto racing; Tour de France => road bicycle racing). The multi-sport series have none or a stray one, so "one sport or several" is a clean split, and level 2 mirrors the franchises of the other categories.
- **The series level is untidy** (classes mixed, editions linked four ways), so which rubrics exist stays a curated choice.
- **Left out then:** Youth Olympics (only Olympic sports, 41 / 24 athletes at the floor), X Games (no events linked), the national Games, Pan American / European / Mediterranean Games (few new sports, at most 24 new athletes). The Winter Paralympics, also left out then, are in since the decision: their thin data is Wikidata's gap to close.
- Earlier sport counts per series (`_scripts/multisport.mjs`, series- and edition-level events): Commonwealth 48, European 30, Asian 25, World Games 24, Summer Youth 15, Pan American 14, Summer Paralympics 10, Winter Youth 7, Winter Paralympics 1, X Games 0. The edition-level recipe below reads far more.

</details>

### Games recipe (one generalized dump, 2026-10-09)

**Tool:** `_scripts/games-recipe.mjs` (output `_data/games-recipe-run1.txt`).

| Series / season | QID | Editions link by | Dated editions | Current => next | Sports from edition events, depth 1 / 2 / together | Series-level events' sports | At the current edition |
| :---- | :---- | :---- | ----: | :---- | :---- | ----: | ----: |
| Olympics summer | Q159821 | P3450 (3 also P179) | 37 | 2024 Paris => 2028 | 101 / 78 / 115 | 66 | 47 |
| Olympics winter | Q82414 | P3450 (1 also P179) | 30 | 2026 => 2030 | 29 / 22 / 33 | 20 | 23 |
| Paralympics summer | Q3327913 | P31 (1 also P3450) | 19 | 2024 => 2028 | 53 / 43 / 57 | 10 | 25 |
| Paralympics winter | Q3317976 | P31 | 16 | 2026 => 2034 (2030 unlinked: batch) | 19 / 10 / 20 | 1 | 8 |
| World Games | Q673097 | P3450 | 13 | 2025 Chengdu => 2029 | 93 / 44 / 94 | 24 | 48 |
| Commonwealth Games | Q178340 | P179 (21), P3450 (4), P31 (2) | 26 | 2026 Glasgow => 2030 | 40 / 36 / 47 | 14 | 12 |
| Asian Games (summer) | Q483463 | P3450 | 22 | 2026 Aichi-Nagoya => 2030 | 72 / 76 / 91 | 25 | 55 |
| Asian Winter Games | Q818463 | P3450 (1 P31) | 11 | 2025 Harbin => 2029 | 14 / 16 / 19 | 13 | 7 |

**The recipe, the same for every series:**

1. **Editions** are the items linked to the series by P31, P179 or P3450 that carry a date. Read P580 first: P585 is often only a year (2024-01-01).
   - Never by P361 alone, because P361 also links the series' own events: "finswimming at the World Games", a 1920 "Antwerp Ceremony" under the Winter Games, two such items under the Summer Paralympics.
   - Editions without any event: the cancelled 1916 / 1940 / 1944 Olympics, the 2022 Asian Winter Games that never took place, and announced ones.
2. **Sports** are the P641 of the events one P361 level below every edition, plus the series' own events (P361 the series). Two levels below only for the current and upcoming editions, as #35 does for the Olympics today: at older editions that level names single events (high jump).
   - The series level alone reads almost nothing outside the Olympics (Winter Paralympics: 1 sport), so the edition level is the base everywhere.
   - **For the Olympics this adds sports the current dump misses:** 22 in Summer and 4 in Winter that were held once, mostly as demonstrations (Gaelic football and hurling 1904, glima 1912, canne de combat 1924, gliding and field handball 1936, pesäpallo 1952, Australian rules football 1956, budō 1964, ballooning and pigeon racing 1900; skijoring, sled dog racing, winter pentathlon, Para alpine skiing 1984). They then fall under `demonstration-sports` or `discontinued`. Not among them: fast chess (2000) and wushu (1936, 2008), whose events were exhibitions at or beside the Games, never in the programme; they go on the exclusion list (checked 2026-10-09).
3. **Last two begun editions and the next one** are what `discontinued` and `future-disciplines` read off (the rules table under Summer Sports). Asian Winter Games 2025 carried only a year (fixed, batch below).
4. **Exclusion list**, per series in the same visible file:
   - delegation items ("Germany at the 1956 Summer Olympics", P641 *Olympic sport*);
   - art competitions;
   - single events (high jump, relay race);
   - umbrellas (*skiing*, *Para sport*).
   - A class test can't do it: taekwondo, karate, jujutsu, aikido, dragon boat and flying disc aren't classed under *sport* on Wikidata (martial arts and the like). That is modelling, not an error.

**Where a rule reads differently:**

- **`discontinued` on the Commonwealth Games.** Glasgow 2026 held a cut programme (12 sports read, against 40 at depth 1 overall), so "not at the current edition" read hockey, cricket, squash, badminton and others as discontinued, though the federation hasn't dropped them. Wikidata can't tell a trimmed edition from a dropped sport, so Trummler decided (2026-10-09) on a window for every series: discontinued = at neither of the last two begun editions nor the next one. One edition ahead is enough (a sport returning in 2028 is continued). For the Olympics this takes karate (2020 only) off `discontinued`, which is accepted.
- **`demonstration-sports`** only finds members at the Olympics: no other series classes its demonstration events. Same rule, empty elsewhere.
- **`future-disciplines`** needs the next edition's events. Only the Olympics have them yet (2028, part of 2030), so it is empty elsewhere.
- **`child-discipline`** reads the same: the Para variants are P279 children of their Olympic sport, but a parent counts only within the same list, so wheelchair basketball stays base in the Paralympics list.

**Wikidata batches from this pass** (imported and checked on the items 2026-10-09; files in `_data/QuickStatements/imported/`):

| Batch | Edits | What |
| :---- | ----: | :---- |
| `2026-10-09_paralympics-2030-winter-series.txt` | 1 | the 2030 Winter Paralympics as an edition (P31) of the Winter Paralympic Games, like the other editions (IPC) |
| `2026-10-09_asian-winter-games-2025-dates.txt` | 2 | start and end date of the 2025 Asian Winter Games, 7 to 14 February 2025 (Olympic Council of Asia) |
| `2026-10-09_paralympics-ice-sledge-racing.txt` | 1 | P641 *ice sledge racing* on the 1994 ice sledge speed racing event, which named the sled (IPC results) |
| `2026-10-09_games-sport-values-removals.txt` | 6 | P641 values that are no sport: the sled (after the batch above), the event class "men's 100 metre backstroke S10" (twice), a competition item on two rhythmic gymnastics events that also name the sport, *culture shock* on the 2002 Commonwealth Games' cultural programme |
| `2026-10-09_fifa-world-cup-class-removal.txt` | 1 | the FIFA World Cup as *recurring international multi-sports competition*: it is a single-sport competition |

**Left as they are:**
- The Summer Olympics' stray P641 values (archery, 3x3 basketball, figure skating) on the series item. They are wrong as a description, but a series of many sports has no single value to put instead; a manual cleanup, not a batch.
- The cultural programme's *sport competition* class: its right class is a judgement call.

## [to Navigation](#navigation)
