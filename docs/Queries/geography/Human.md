# Wikidata Query Analysis: Human Geography

What Wikidata offers for the Human Geography topics, and how far it can serve as their source.

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Navigation

[Geography](../README.md#geography)
- ✅[Countries](#countries)
- ✅[Capitals](#capitals)
- ➕[Subdivisions](#subdivisions)
- ➕[Sub-Capitals](#sub-capitals)
- ➕[Cities](#cities)
- ✅[Languages](#languages)

## ✅Countries

**Associated List:** [list of sovereign states (Q11750)](https://www.wikidata.org/wiki/Q11750)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [sovereign state](https://www.wikidata.org/wiki/Q3624078), [state](https://www.wikidata.org/wiki/Q7275)  
**Or, better:**  
**Associated List:** [lists of sovereign states and dependent territories (Q3480223)](https://www.wikidata.org/wiki/Q3480223)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [country](https://www.wikidata.org/wiki/Q6256)  
**Number of results:**

|  |  |  | Without [historical country](https://www.wikidata.org/wiki/Q3024240) (Including related values) |  |
| :---- | :---- | :---- | :---- | :---- |
| Include related values in the search | false | true | false | true |
| [sovereign state](https://www.wikidata.org/wiki/Q3624078) | 448 | 844 | 206 (201) | 422 (405) |
| [country](https://www.wikidata.org/wiki/Q6256) | 277 | 1258 | 217 (214) | 757 (738) |

**Check (2026-10-07):** *Sovereign state* (Q3624078) has 200 instances counting current (truthy) statements and 448 counting every P31 statement, ended and deprecated ones included; the Query Builder counts the latter, hence its higher figures. *Country* (Q6256): 217 and 278. The truthy figures are the current countries; the difference is mostly former states, which are not ballast but the candidate rule below.

### Build query and the sovereignty matrix

**Build query** (#35, `scripts/geography/dump-country-data.mjs`): truthy `wdt:P31 wd:Q3624078` without a dissolution date (P576), i.e. the UN sovereign states.  
**Territories beyond them:** a curated list (`data-raw/geography/countries/sovereign-territories.json`, 48 items keyed by QID), each placed in one cell of the Sovereignty & recognition matrix; names, populations and capitals come from Wikidata by those QIDs.

**Could classes carry the matrix?** (`_scripts/territories.mjs`: the curated items' classes, and each class's members with ≥ 20 sitelinks and no P576)

| Cell (default) | Curated | Classes that match | What the classes add |
| :---- | :---- | :---- | :---- |
| classic-autonomous (omitted) | 23 | British Overseas Territories (Q46395) 10 of 14; external territory of Australia (Q11687019) 3 of 7; overseas collectivity of France (Q719487) 4 of 6; unincorporated territory of the US (Q783733) 3 of 7; autonomous country within the Kingdom of Denmark (Q66724388) 2; Tokelau only *dependent territory* | South Georgia, Akrotiri and Dhekelia, British Indian Ocean Territory, British Antarctic Territory, Heard and McDonald, Coral Sea, Ashmore and Cartier, Australian Antarctic Territory, Wake, Johnston |
| asymmetric-autonomy (omittable) | 8 | Crown Dependencies (Q185086) 3 of 8; country of the Kingdom of the Netherlands (Q15304003) 3; Åland and the Kurdistan Region only *autonomous region* | Sark, Alderney, Herm, Jethou, Brecqhou (parts of the Bailiwick of Guernsey, typed as Crown Dependencies themselves) |
| free-association (omittable) | 2 | associated state (Q1138279), exactly | - |
| special-status (omittable) | 7 | special administrative region of China (Q779415) and commonwealth (Q609591, Puerto Rico and the Northern Marianas), each exactly; New Caledonia and French Polynesia share *overseas collectivity of France* with four classic-autonomous ones; Western Sahara only *disputed territory* (92 members) | - |
| de-facto-recognized / -narrow / pure-de-facto (omittable) | 3 / 3 / 2 | state with limited recognition (Q10711424) holds all 8 (Abkhazia and Transnistria only through their polity items, see below) | Israel (a sovereign state anyway), Sahrawi Republic, Ambazonia, Western Togoland; without the sitelink filter 16 more, mostly minor or defunct entities lacking a P576 |

**The three de-facto rows** sort in the right order by diplomatic relations (P530): Kosovo 76, Palestine 32, Taiwan 14 | Northern Cyprus 9, Abkhazia 7, South Ossetia 5 | Transnistria 2, Somaliland 0. But P530 counts relations, not recognitions, is incomplete (the Sahrawi Republic, recognized by dozens of states, has 9) and leaves too narrow a gap (14 vs 9) for a threshold.  
**Population** doesn't separate the uninhabited additions either: Pitcairn (50, curated) lies below Wake Island (100), the military territories (Akrotiri and Dhekelia 18,000, British Indian Ocean Territory 3,000) above it.  
**Not in the matrix, though inhabited:** the French overseas departments (Réunion, Guadeloupe, Martinique; integral parts of France), the Caribbean Netherlands (Bonaire etc.), and the two military territories. A conscious choice, noted here in case a cell should take them.  
**Verdict:** the curated list stays the source of the matrix. The classes above serve as its completeness check: a new member of one of them is a territory to place or to leave out on purpose.  
**Crown Dependencies (2026-10-20):** the UK government names them: "the Bailiwick of Jersey, the Bailiwick of Guernsey (which includes the jurisdictions of Guernsey, Alderney and Sark) and the Isle of Man" (gov.uk, *Crown Dependencies: Jersey, Guernsey and the Isle of Man*). On Wikidata, Alderney, Sark, Herm, Jethou, Brecqhou, the Minquiers and Ecréhous and the overview item *dependent territory of the United Kingdom* also carry *instance of: Crown Dependencies* (Q185086), all unreferenced. Batch `2026-10-20_countries-crown-dependencies.txt` (10 lines) removes those seven and references the three right ones (Jersey Q785, Guernsey Q25230, Isle of Man Q9676); the islands keep *island* and *part of* the Channel Islands. Then Q185086 holds exactly our three curated entries, plus *Bailiwick of Jersey* (Q116785235), an item without sitelinks beside *Jersey* (Q785, whose enwiki article is the bailiwick): a merge candidate, left to the item's editors. Imported and checked (2026-10-20): Q185086 now holds those four.

**Curated QIDs pointing to the wrong item** (swapped by #35, 2026-10-08): three curated territories name a region item rather than the polity the cell means. The polity item carries the population and capital that are hand-filled today:

| Curated | QID now | Polity item | Population | Capital |
| :---- | :---- | :---- | :---- | :---- |
| Iraqi Kurdistan | Q41470 *Kurdistan* (the whole cultural region, 152 sitelinks) | Q205047 *Kurdistan Region of Iraq* (102) | 6,171,083 (2020) | Erbil |
| Transnistria | Q648767 *Administrative-Territorial Units of the Left Bank of the Dniester* (Moldova's unit, 22) | Q907112 *Transnistria* (168) | 367,776 (2024) | Tiraspol |
| Abkhazia | Q23334 *Abkhazia* (historical region, 18) | Q31354462 *Republic of Abkhazia* (211) | 244,000 (2025) | Sokhumi |

**Labels of the polity items and of Managua** (2026-10-09, closed with #35): Managua's city item, which P36 names, carried the disambiguator *(City)* in 163 labels; a batch removed it and kept the former labels as aliases (imported, files in `_data/QuickStatements/imported/`). The formal labels of the polity items (*Republic of Abkhazia*, *Kurdistan Region of Iraq*) stay as Wikidata has them: the build keeps the label as `pref` and takes the Wikipedia article title, without a parenthetical, as `short` when it is shorter (Trummler's rule, in the PR #35 plan-doc). No P1813 short names were added, since no clear source exists per language.


### Candidate rule: historical countries

**Rule:** `historical-countries`, omitted (hidden by default, tick to include); also offered as an option in the Sovereignty & recognition matrix (Trummler, 2026-10-07).  
**Base query:** instances of *historical country* (Q3024240) or a subclass, with at least 30 sitelinks as the fame filter:

```sparql
SELECT DISTINCT ?item ?links WHERE {
  ?item wdt:P31/wdt:P279* wd:Q3024240 ;
        wikibase:sitelinks ?links .
  FILTER(?links >= 30)
}
```

| Query (`_scripts/historical.mjs`) | All | Reference found | ≥ 30 sitelinks | Reference found among those |
| :---- | :---- | :---- | :---- | :---- |
| *historical country*, direct | 3,868 | 31 / 36 | 802 | 31 / 36 |
| *historical country*, with subclasses | 5,018 | 34 / 36 | **929** | **34 / 36** |
| *sovereign state* with an ended P31 statement | 224 | 12 / 36 | 142 | 12 / 36 |
| dissolved (P576) and any *state* class | 2,200 | 6 / 36 | 397 | 6 / 36 |

**Reference set:** 36 well-known historical states (Roman, Byzantine, Ottoman, Mongol, Achaemenid, Holy Roman Empire, Soviet Union, Austria–Hungary, Prussia, Yugoslavia, Czechoslovakia, East Germany, Aztec, Inca, Ancient Egypt, Babylonia, Mughal, Qing, Han, Ming, …). The two not found are typed otherwise: Carthage as an *ancient city* / *city-state*, Assyria not as a state item under that name; both could join through a short visible inclusion list.  
**Ballast:** little. The fame filter only thins out obscure but real states (Erivan Khanate, Principality of Ryazan, Kingdom of Strathclyde at 30 to 33 sitelinks); a threshold is a size choice, not a cleanup. One current country is also typed *historical country* and must stay out of the rule.  
**Possible split by era:** 902 of the 929 carry a dissolution year (P576): before 500: 118, 500 to 1500: 209, 1500 to 1900: 257, after 1900: 318. Enough for sub-rules (e.g. `ancient-states`, `medieval-states`, `modern-former-states`) or tiers, should one rule prove too coarse.  
**Second pass (2026-10-20):** periods and peoples typed *historical country* pass the query too: *Five Dynasties and Ten Kingdoms Period*, *Northern and Southern dynasties* and *Ottoman Greece* (each also a *historical period*), *Sabaeans* (also a *tribe*). Ballast of this kind is small (a handful among 929) and goes on the rule's exclusion list unless Wikidata drops the class. 17 items have no continent, no coordinates and no capital to place them (Chaldea, Third Dynasty of Ur, Dilmun, League of Corinth, Alania, Mataram, Arzawa, Great Horde, Epirus, …), and about 20 start before 2000 BC, several with a settlement's or a legend's date (see Spans below). Researched (2026-10-20, settled; `_data/Prompts/done/Historical_States_Dates_and_Places.md`, Gemini, each claim checked on Britannica, the reference Wikidata itself links by P1417). **Continents:** seven confirmed there, batch `2026-10-20_countries-historical-continents.txt` (7 lines, P30 with the Britannica article as reference): Chaldea, Dilmun, Saba, Arzawa and the Seljuqs in Asia, the League of Corinth and Ottoman Greece in Europe. Five more carry a present-day country (P17: Yathrib, Mataram, Ugarit, Meroë, the Sabaeans), so a fallback via that country's continent places them without a statement; the rest (Alania and the Great Horde between Europe and Asia, the Keraites, Kambojas, Epirus, Third Dynasty of Ur) stay unplaced: Gemini's citations for them did not hold (Britannica has no such article, or one on a people, not the state). **Dates:** no batch. The early starts are not wrong for the items as Wikidata defines them: *Ancient Egypt* is also an *ancient civilization* (Britannica: "dates from the 4th millennium BCE"), *Ugarit* and *Meroë* are also *ancient cities*, and Dilmun is a commercial centre in the late 4th millennium before the kingdom flourishes about 2000 BC (Britannica). The item covers city, civilization and state at once, so the slider shows the item's span, not the state's. Gemini's quotes for the state dates (Ugarit "from the 18th century BCE", Xia's "compared with the traditional date of 2205 BC") are not on the cited pages; Britannica dates the 1st dynasty to c. 2900 BCE, not 3100. *Land of Punt* is a region of legend to Britannica (coastal Ethiopia and Djibouti), a candidate for the rule's exclusion list with the periods above. A second Gemini run at a higher thinking level (same prompt, answer replaced) quotes the pages more faithfully (Egypt's c. 2900 BCE and Dilmun word for word from Britannica), names Wikipedia where it rests on it (Xia, Kush), and agrees with the reading above; its links are still partly off-topic (Muhammad's biography for Yathrib, Java for Mataram). New and confirmed: *Epirus* (Britannica: "coastal region of northwestern Greece and southern Albania", ruled by the Molossian state and Pyrrhus), so P30 Europe, in batch `2026-10-20_plates-former-class-1.txt`.

**Rating:** usable; the rule can be built from this query.

### Spans and continents (for the century slider)

**Items:** 930 (the 929 at ≥ 30 sitelinks, plus Carthage, Q6343, from the inclusion list; Assyria is the *Assyrian Empire*, Q41137, already among them). Tool: `_scripts/historical-spans.mjs`.  
**Date coverage:** inception (P571) 901, dissolved (P576) 903, start time (P580) 29, end time (P582) 24. Taking P571 else P580 as the start and P576 else P582 as the end: 23 lack a start, 22 an end, 14 both. No item starts after it ends, none ends after 2026.  
**Start centuries:** sparse before the 13th century BC (31 items spread over 61st to 14th century BC), then 4 to 15 per century until the 1st century AD, 16 to 49 per century from the 5th to the 18th, then 110 in the 19th, 207 in the 20th, 3 in the 21st.  
**End centuries:** from the 23rd century BC; up to 12 per century before AD, 3 to 60 per century after, then 131 in the 19th, 305 in the 20th, 13 in the 21st.  
**Earliest bucket:** "11th century BC or earlier" would hold 45 starts, about the load of an ordinary century in the Middle Ages; "13th century BC or earlier" 31.  
**Continents:** P30 on the item for 771, via the capital (P36) for 18 more; 141 have neither, but 124 of those carry coordinates (P625, on the item or its capital) that could place them; 17 remain. 26 items span several continents.  
**Dates to check rather than special-case:** some starts are a settlement's or a legend's, not the state's: Ugarit (6000 BC, the city's first settlement; the kingdom is c. 1450 to 1185 BC), Ancient Egypt (4000 BC), Gojoseon (2333 BC, the legendary founding), Xia dynasty (2205 BC, semi-legendary). Candidates for referenced corrections on Wikidata once sources are found; the rest of the 18 starts before 2000 BC (Ebla, Elam, Akkadian Empire, Third Dynasty of Ur, …) look plausible.

<!-- @agent(#35) from #38 · 2026-10-20 · OPEN
Decided: placing historical states on a continent for the century slider. Order: P30 on the item, else P30 of its capital (P36), else P30 of its present-day country (P17), else coordinates (P625, item or capital). P17 places Yathrib, Mataram, Ugarit, Meroë and the Sabaeans; a batch adds P30 to seven more (Chaldea, Dilmun, Saba, Arzawa, Seljuqs, League of Corinth, Ottoman Greece). The early start dates (Ugarit 6000 BC, Ancient Egypt 4000 BC) are the city's or civilization's, which the same items also are: no correction, the slider shows the item's span.
Ask: take the P17 step into the continent fallback if the dump doesn't have it; a state on several continents takes all its P30 values. Candidates for the `historical-countries` exclusion list: Five Dynasties and Ten Kingdoms Period, Northern and Southern dynasties, Ottoman Greece (periods), Sabaeans (a people beside the kingdom Saba), Land of Punt (a region).
Refs: this file, Countries => Candidate rule: historical countries (Second pass) and Spans and continents
-->


## ✅Capitals

**Associated List:** -  
**Definition:** -  
**Built by** #35 with the countries (`scripts/geography/dump-country-data.mjs`): the truthy capital (P36) of every country in the build set, then the curated territories' capitals; names as for the countries, tiers by the country's population.  
**Tool:** `_scripts/capitals.mjs` (output `_data/capitals-run1.txt`, after the fixes `capitals-run2.txt`).

**Check (2026-10-09, after the fixes below):** 197 countries; 191 with one truthy capital, 5 with two, 1 with three; none without, and no truthy capital with a past end date. 205 capital items, all with coordinates.

| Several truthy capitals | Values | Reading |
| :---- | :---- | :---- |
| South Africa | Pretoria, Cape Town, Bloemfontein | official, each with its branch (P518) |
| Bolivia, Sri Lanka, Eswatini | La Paz / Sucre; Kotte / Colombo; Mbabane / Lobamba | official, each with its branch |
| Palestine, Yemen | East Jerusalem / Ramallah; Sanaa / Aden | *de jure* and *de facto*, qualified (P518 / P459) |
| **Pakistan** | Islamabad, **Rawalpindi** | was an error: Rawalpindi, the interim capital from 1959 to 1967, carried no dates and both were normal rank. Fixed 2026-10-09 (batch below, Islamabad set preferred by hand); now one capital |

**Rule candidate:** none needed. Several capitals are a real class (the branch or de jure / de facto split is on the statement), so the list keeps them all, as the build does.

**The values:**
- **Classes:** *city* or a subclass for all but one. Madrid is typed only *municipality of Spain*, which isn't below *human settlement*: a matter of Wikidata's class tree, not a wrong value. The build doesn't filter by class, so nothing to do.
- **Back-links (P1376):** missing on 2 of 205. Singapore lacks *capital of: Singapore* on itself (Monaco and Vatican City carry theirs); Ramallah lacks *capital of: Palestine* (de facto). Optional inverse statements, no effect on the build; left as they are.
- **Population:** only Managua's city item has none (P1082 sits on the municipality, Q14256, as the census reports it). The tier reads the country's population, so it doesn't matter here.
- **Ended capitals** are modelled cleanly elsewhere: Indonesia's former capitals carry start and end dates, the current Jakarta statement is preferred.

**Labels with a disambiguator** (the Managua pattern, against Help:Label): 188 labels on 88 capitals across all languages, almost all in languages the build doesn't read (Cebuano *ulohang dakbayan*, Navajo place descriptions, Chuvash, Kazakh). In the build's languages, beyond Managua (fixed 2026-10-09, re-dump due), three remain: Luxembourg in de-at / de-ch (*Luxemburg (Stadt)*), North Nicosia in pt (*Nicósia (Norte)*, ptwiki *Nicósia do Norte*), West Island in tr (*West Adası (V)*, trwiki *Batı Adası*). A batch fixes those (below). The rest needs a judgement per language and is left to those languages' editors.

**Wikidata batches from this pass** (imported and checked on the items 2026-10-09; files in `_data/QuickStatements/imported/`):

| Batch | Edits | What |
| :---- | ----: | :---- |
| `2026-10-09_capitals-rawalpindi-interim-dates.txt` | 2 | start 1959 and end 1967 on Pakistan's P36 *Rawalpindi* and on Rawalpindi's P1376 *Pakistan* (Encyclopædia Universalis) |
| `2026-10-09_capitals-labels-disambiguators.txt` | 8 | the three labels above without the disambiguator; the former ones kept as aliases |
| `2026-10-09_capitals-managua-aliases-tl.txt` | 1 | the Tagalog alias the Managua aliases batch skipped on import |
| `2026-10-09_capitals-hargeisa-label-pt.txt` | 1 | Hargeisa's pt label, the typo *JHHargeisa*, corrected to *Hargeisa* (as pt-br, ptwiki and en); found by #35 in the re-dump |

**By hand:** QuickStatements can't set a rank, so Islamabad's P36 statement on Pakistan (Q843) was set *preferred* in the item's UI (done 2026-10-09), as Indonesia's current Jakarta statement already was.  
**Second pass (2026-10-20):** `capitals.mjs` again (`_data/capitals-run3.txt`): unchanged in substance. 197 countries, the same six with several capitals, all qualified; no ended truthy capital; every capital with coordinates; no label with a parenthetical left in the build's languages. Small drift, nothing to fix: 204 capital values (Germany's Berlin now carries two statements, *seat of government* and *de jure national capital*); Bucharest joins Madrid as typed only by a national municipality class (*municipality of Romania*); Copenhagen's back-link names *Denmark* (Q35) rather than the *Kingdom of Denmark* (Q756617) the build uses as the state, which is how Wikidata separates the two. No research and no schema proposal: the source (P36) is complete and qualified where it matters.

**Rating:** clean; the one modelling error on Wikidata is fixed. The build picks it up with the next re-dump.

## ➕Subdivisions

**Associated List:** -  
**Definition:** -  
**Tool:** `_scripts/subdivisions.mjs`.

**Base (proposed, 2026-10-30):** an ISO 3166-2 code (P300) that is current (a statement without an end time: codes change, China's went from CN-11 to CN-BJ in 2017), on an item not dissolved (P576), not inside another coded subdivision (P131 to an item that carries a code itself, a country excepted: the UK carries GB-UKM, which would hide England), and not a country or dependency itself (an ISO 3166-1 code, P297: Greenland is DK-GL, Aruba NL-AW, Hong Kong CN-HK; they belong to Countries). That gives **3,812 subdivisions in 206 countries**.

| | Count | Note |
| :---- | ----: | :---- |
| items with an ISO 3166-2 code | 5,453 | |
| current, not dissolved | 5,029 | |
| the base (top level, no country) | 3,812 | |
| class *first-level administrative country subdivision* (Q10864048), not dissolved | 5,151 | for comparison |
| in both | 3,420 | |

**The class is no base, but its odd members are modelled correctly.** Georgia (Q230) is in it through P31 *republic of the Soviet Union* with start 1921 and end 1991, a past membership with its time qualifiers; a query reading the class must skip P31 statements that carry an end time (P582), as the base does for codes. Istanbul and Ankara are in it as *metropolitan municipality in Turkey*, while the ISO codes sit on separate province items (TR-34 Istanbul Province, Q534799; TR-06 Ankara Province, Q2297724), so the base takes the provinces. Where city and first-level unit are one item, the code is on it: Berlin (DE-BE), Hamburg (DE-HH), Bogotá (CO-DC) are in the base, as they should be. 1,731 class members have no current code; 392 base members are not in the class, most of them capital cities with a first-level status of their own (Paris, Kyiv, Budapest, Oslo, Zagreb).
**What ISO calls the top level differs by country:** Slovenia's 213 municipalities, Malta's 68 local councils, North Macedonia's 75 and Lithuania's 70 stand beside the 51 US states and 47 Japanese prefectures; ISO lists only one level for some countries, two for others (Equatorial Guinea's 2 regions above its provinces). **Fame (decided by Trummler, 2026-10-30):** the tiers come from the country's population divided by its number of base subdivisions, the mean size of a subdivision there; an entry is in when its country's mean is above the chosen bound. Every subdivision of a country shares its tier, US states (about 6.6 million each) high, Slovenian municipalities (about 10,000) low, which puts them where Swiss second-level units would be. Points for the build: countries whose ISO list mixes sizes keep one mean for all (the UK's 137 entries put England, Scotland, Wales, Northern Ireland and even Great Britain, GB-GBN, beside London boroughs; ISO lists the nations and GB-GBN as groupings, so the UK may need its own count); the count must be the base's, not ISO's total, since nested levels are left out.
**Subdivisions inside a city (proposal, Trummler, 2026-10-30):** a first-level subdivision that lies in a city or metropolitan region is replaced, for the count and as an entry, by that city (if the city is not itself inside another); the official subdivisions it replaces stay in the topic under an `omitted` rule, and the substitute cities need an `omittable` one. Measured: 73 base subdivisions lie in a settlement (P131, up to two steps), 36 of them in the UK, 33 of those London's boroughs in Greater London (Q23306); then Prague's districts (16 in CZ); the rest are single cases, some of them misplaced P131 values. So the rule mainly turns London's boroughs into London. It does not settle the UK as a whole: its other entries are England, Scotland, Wales, Northern Ireland and Great Britain beside unitary authorities and counties, since those carry no P131 to a coded parent. **Nesting through the whole P131 chain** (agreed with Trummler, 2026-10-30, as the reader-friendly way): an entry is dropped when any ancestor (P131+, not a country) carries a current code, not only its direct parent. The base goes from 3,812 to 3,622, and the counts come out as a reader would expect: the UK from 137 to 6 (England, Scotland, Wales, Northern Ireland, plus GB-GBN *Great Britain*, an ISO grouping, and GB-STY), Hungary 41 => 20 (19 counties and Budapest; the cities with county rights go), Czechia 30 => 14 regions, Iceland 14 => 8 regions, Turkey 87 => 81 provinces, Switzerland 28 => 26 cantons, Italy 21 => 20 regions, Estonia 17 => 15 counties, Thailand 78 => 77, Argentina 25 => 24, Nigeria 38 => 37 (36 states and the capital territory). London's boroughs leave with the rest of England's authorities, so the city rule above is no longer needed for them. **Where it goes wrong, and why** (checked 2026-10-30): Kenya 45 => 42, since the counties still have P131 to the eight provinces abolished in 2013, which carry no dissolution date and a code without an end (research: `_data/Prompts/Kenya_Former_Provinces.md`); Guyana 10 => 5, since *Guayana Esequiba* (Q816253, the area west of the Essequibo that Venezuela claims) had P131 to the six regions it spans, a link in the wrong direction that closes a loop (the regions carry P131 *Guyana* with preferred rank, besides *Venezuela* and *Guayana Esequiba*); Papua New Guinea 22 => 19, since its Southern Region had P131 *Port Moresby*, which lies in it. Batch `2026-10-30_p131-inverted.txt` (7 removals, pending import) takes out the wrong-way links. A rule-side guard worth keeping all the same: follow only best-rank P131 (`wdt:`) and stop at a cycle. GB-STY (South Tyneside) lies under England and goes with the chain rule; it was left in the test run (~ presumably a query block that came back empty). GB-GBN (a grouping, not a unit) is for an exclusion. A few countries gain entries (Luxembourg 7 => 12 cantons, Montenegro 23 => 25, Morocco 12 => 14, Congo-Kinshasa 25 => 27), where the one-step rule had counted a parent with an old code.
**Noise:** codes that are no ISO 3166-2 codes (GZZ, C4866, SS010101, the former YU and CS), and a city carrying its county's code (Oxford, Q34217, holds GB-OXF, Oxfordshire's). Few, fixable one by one.
**Rating:** ➕ (was 🔵): the base is clean once the four conditions hold; the level question is a design decision, not a gap.

## ➕Sub-Capitals

**Associated List:** -  
**Definition:** -  
**Base:** the capital (P36) of each subdivision of the base above: **3,103 of the 3,812** (81 %).
**Where it is missing:** a unit without an official capital has none to name (Trummler: then it has none); where one exists and Wikidata lacks it, the gap is to be filled. Countries with the most missing: Slovenia 154 of 213, Malta 68 of 68, the Maldives, the Seychelles and the Marshall Islands (all), Kenya 8 of 45, Indonesia 8 of 45; which of them have an official capital is still to be sorted out, country by country.
**Rating:** ➕ (was 🔵).

## ➕Cities

**Associated List:** -  
**Definition:** -  
**Tool:** `_scripts/cities.mjs`, `_scripts/city-parts.mjs`.

**Base (proposed, 2026-10-30):** a *human settlement* (Q486972 or a class under it) with a population (P1082) at or above a floor, not dissolved, and not an agglomeration: an item with a class under *metropolitan area* (Q1907114), *urban agglomeration* (Q159313), *conurbation* (Q245260) or *urban area* (Q702492) is dropped unless it is a city by a class other than *megacity* (Q174844) or *metropolis* (Q200250). Those two sit under *city* on Wikidata but name a size, which agglomerations reach too: Greater Mexico City is a *megacity* and a *metropolitan area* (correctly, a megacity being an agglomeration of ten million), Tokyo and Shanghai are *megacities* and *big cities*. The class *city* (Q515) alone is narrower: it holds 4,011 of the 6,535 settlements of 100,000 and more.

| Population floor | Items with that population | Settlements | Without agglomerations | In the class *city* |
| ----: | ----: | ----: | ----: | ----: |
| 10,000,000 | 827 | 66 | 33 | 38 |
| 1,000,000 | 5,739 | 996 | 686 | 659 |
| 100,000 | 28,833 | 7,648 | 6,518 | 4,011 |

**Checked against 18 cities a reader expects** (Tokyo, Delhi, Shanghai, São Paulo, Mexico City, Cairo, Mumbai, Beijing, New York, London, Paris, Berlin, Moscow, Istanbul, Lagos, Munich, Zurich, Sydney): all 18 are in, each as a settlement and a city, and none is dropped as an agglomeration; Greater Mexico City, the New York metropolitan area, Greater Buenos Aires, Greater Rio de Janeiro and Metro Manila are.
**Fame (decided by Trummler, 2026-10-30):** tiers by population. What is wrong or against Wikidata's conventions gets fixed on Wikidata first; only what remains is the build's concern.
**Not wrong, but a design point:** a Chinese prefecture-level city is one item for the whole administrative unit, and its population is that of the unit (Guangzhou 18.7 million, Shenyang 9.1, "permanent population" 2020; Baoding 11.5, Linyi 11.0); Wikidata carries no separate urban figure for them: 292 of the 294 qualify their population with *applies to part: permanent population* (a count, not an area), 12 have an *urban population* (P6343). By population they rank above Berlin: 19 of the 33 settlements of ten million and more are Chinese. **Proposed (Trummler, 2026-10-30):** an inclusion setting "Put Chinese cities one tier lower", for the reason the data gives; the class picks them out (prefecture-level city Q748149, sub-provincial and county-level cities, direct-administered municipality). The same effect, less strongly, has Turkey's metropolitan municipalities, which now span their whole province (Istanbul 15.7 million).
**Parts of a city** (Trummler, 2026-10-30: the city itself, not its parts and not the larger unit around it): a settlement inside another base settlement (P131, up to two steps) is dropped, unless the two share their name (the larger one's English label equals or contains the smaller one's): then the smaller one is the city itself and stays, and the larger unit around it goes. Of the 6,518 settlements from 100,000, 1,246 lie inside another; 67 of those pairs share the name, so 63 enclosing units go (Tokyo Metropolis, Q1490, for the 23-ward city of Tokyo, Q7473516; City of Belgrade for Belgrade; Bordeaux Métropole for Bordeaux; Bangladesh's upazilas for their towns) and 1,135 parts go (Brooklyn in New York City, Pudong, Kowloon, Soweto, China's county-level cities in their prefecture-level city). 5,330 settlements remain, 658 of them from 1 million. Checked: Johannesburg, Cape Town, Manila, Beijing, Istanbul, Shanghai, New York City and the 23-ward Tokyo stay; Brooklyn and Tokyo Metropolis go. Where a city has no item apart from its larger unit (China's prefecture-level cities, Istanbul's metropolitan municipality), that unit is the city's item and stays.
**Rating:** ➕ (was 🔵): the base holds with the agglomeration rule and the child rule.

## ✅Languages

**Associated List:** -  
**Definition:** -  
**Built by** #35: `scripts/geography/{dump-language-data,build-languages}.mjs`. **Membership:** an item whose class path (P31/P279*) reaches *modern language* (Q1288568), *modern natural language* (Q138638548) or one of the ten type classes, and that carries an ISO 639-1 code (P218) or a positive speaker count (P1098). **Types** (dead, extinct, historical, dialect, dialect group, language group, language family, constructed, fictional) are opt-in rules; a two-letter code exempts an item from the group and family types. **Tiers** by speakers, 100M down to 1k.  
**Tool:** `_scripts/languages.mjs` (output `_data/languages-run1.txt`).

**Check (2026-10-09):** 2,026 members (2,021 in #35's dump), 1,610 of them base, 304 base languages at a million speakers or more.

<!-- @agent(#35) from #38 · 2026-10-09 · OPEN
Decided: nothing yet; Trummler to confirm before you act. The language membership misses Hindi, Serbian, Bosnian, Montenegrin, Filipino, Mandarin and 12 sign languages, and the gate drops Ancient Greek, Old English, Gothic and the like (Languages => Membership by class loses major languages). Hindi is a Wikidata rank issue, fixed by hand; the rest is the class whitelist.
Ask: consider the code-based union (today's set plus every ISO 639-1 / 639-2 item plus ISO 639-3 items with speakers; a short exclusion list for `sgn` / `art`), and extending the two-letter exemption to dialect / dialect group (Persian, Tajik, Bokmål hidden today). Re-dump after Trummler's rank fix on Hindi either way.
Refs: this file, Languages; _scripts/languages.mjs
-->

### Membership by class loses major languages

Measured against ISO 639 codes: 122 items with an ISO 639-1 or 639-2 code are outside the membership, 19 of them with 100 or more sitelinks; so are 35 items with an ISO 639-3 code and a speaker count.

| Why it falls out | Languages (sitelinks) |
| :---- | :---- |
| typed only *standard variety* or *pluricentric language variant*, which aren't below any accepted class | Serbian (175), Bosnian (140), Montenegrin (104), Filipino (90) |
| typed only *language* (Q34770), the top class, which isn't accepted | Mandarin (135), Kalmyk (78), Banjar (68), Sorbian (83), Central Bikol, Cham, South Estonian, … |
| typed only *sign language* or *creole* | 12 sign languages (New Zealand, Auslan, Quebec, Dutch, Ukrainian, …), Chavacano (53) |
| a preferred P31 hid the accepted classes (Wikidata issue, below; fixed 2026-10-09) | **Hindi** (224) |
| in a type class, but with neither an ISO 639-1 code nor a speaker count: the gate drops them | Ancient Greek (156), Coptic, Gothic, Old English, Egyptian, Akkadian, Old Norse, Sumerian, Hittite, Ge'ez, Phoenician, Middle English, Old French, Elamite (each 64 to 112) |
| collective codes for families (no loss: they would only feed the family type) | Romance, Germanic, Semitic, Celtic, Indo-Aryan, Iranian, Bantu, Mayan, … |

**Cleaner membership** (proposal for #35): keep today's set and add every item with an ISO 639-1 or 639-2 code, and every item with an ISO 639-3 code and a positive speaker count. ISO 639 codes name languages, macrolanguages and collectives, never a class decision, so no further class has to be whitelisted. The classes keep their job of typing: Serbian, Filipino, Mandarin and the sign languages land in the base, Ancient Greek and the others under their dead / historical type.

- **Exclusion list** for collective codes that name a kind of language, not a language: *sign language* (Q34228, `sgn`), *constructed language* (Q33215, `art`), and the other three items typed *type of language*.
- **New namesake pairs** to expect: Mandarin beside Standard Chinese, Moldovan (typed only *register*) beside Romanian.

### Several items for one language

Wikidata keeps macrolanguage, individual language and standard apart. All of them are real items, and their names differ, so the build's namesake step doesn't merge them. The base shows them side by side:

| Language | Items in the base |
| :---- | :---- |
| Chinese | Chinese (zh, 1.3G), Standard Chinese (cmn, 897M); Mandarin would join |
| Arabic | Arabic (ar, 422M), Standard Arabic (arb, 335M), Modern Standard Arabic (no code) |
| Indonesian | Indonesian (id, 199M), Standard Indonesian (no code, 270M) |
| Persian | New Persian (no code, 96M) in the base; **Persian (fa) itself is hidden**, typed *dialect group* |
| Hindustani | Hindustani (no code, 490M), Urdu (ur); Hindi missing (above) |
| Levantine Arabic | Levantine Arabic and North Levantine Arabic, both with `apc` (ISO 639-3 merged South Levantine into `apc`; the older item kept the code) |

- **The two-letter exemption** covers only the group and family types. Six items with an ISO 639-1 code are hidden as *dialect* or *dialect group*: Persian (70M), Tajik (14M), Bokmål (4M), Ndonga, Kwanyama, and Iron Ossetic (`os`, which ISO 639-3 now names *Iron Ossetic*, so the code rightly sits on the dialect item). Extending the exemption to dialect and dialect group would put them in the base, Persian above all.
- **Base entries without any ISO code:** 23, five of them at a million speakers or more (Hindustani, Standard Indonesian, New Persian, Cantonese, Hindko). A rule `uncoded-varieties` (omittable) would take the standard and register duplicates out of the default view without dropping them. It is a candidate only; whether the duplicates are ballast is Trummler's call.

### Speaker counts: which figure sets the tier (second pass, 2026-10-20)

**What the dump reads** (#35, `dump-language-data.mjs`): the highest non-deprecated P1098 of all statements, so an extinct language keeps its peak instead of its preferred "0 today". **What the statements hold:** on the 186 ISO 639-1 languages, 383 statements; 339 dated (P585), 326 referenced; 89 languages have several, and 30 of them several truthy ones. The figures differ in kind, and the kind sits in qualifiers: *applies to part* (P518) *first language* 147, *second language* 55; a place (P3005 / P276 / P1001) on 23, such as Fijian's seven figures, one per country.

**The effect of MAX:** for every item with an ISO 639-1 or 639-3 code (1,815 with a positive count), compared with a cleaner pick (worldwide first-language figures only, preferred first, then the newest): 1,717 land in the same tier, 43 differ, MAX always higher (30 by one tier, 13 by two or more); 55 have no worldwide first-language figure at all (only L2, by country, or extinct). Where MAX lifts a language, it takes first plus second language for some (French 208M against 77M L1, Indonesian 199M against 44M, Esperanto 2M against 60k, Tok Pisin 4M against 122k, Scots 1.5M against 99k) and an older or regional figure for others (German 105M against 77M, Irish 1.03M against 141k).

**So the tiers mix two measures:** languages with an L2 figure on Wikidata rank by total speakers, those without by native speakers. For fame, total speakers is arguably the right measure (Esperanto, French and Indonesian are known for their L2 reach), but L2 figures are scarce (55 statements on the 186 ISO 639-1 languages, far fewer below them).  
**Options:** (a) L1 only, as above: consistent, available for nearly all; Esperanto, Tok Pisin and the lingua francas drop. (b) L1 + L2 where Wikidata has both, else L1 (today's effect, made explicit, and with the regional and old figures out). (c) MAX as now. Trummler's starting idea (2026-10-20): the newest figure for living languages, the maximum for historical ones.

**Rule (agreed with Trummler 2026-10-20):** P1098 is defined as "number of people who use a language", so its natural reading is all users, and under the completeness assumption a missing L2 figure means no L2 use worth counting. Per language: (1) dead, extinct or historical type: the maximum, as now (the peak). (2) Otherwise, worldwide figures only (no place qualifier): a figure without *applies to part* (or with *whole*) is the total; else the newest *first language* plus the newest *second language*; else the first-language figure alone. "Newest" means preferred rank first (Wikidata's own marker of the current value), then the latest P585. (3) Only figures by place (Fijian): the newest per place, summed. L2 coverage among the large languages is already decent: 55 of the 75 ISO 639-1 languages at 10M or more have an L2 figure; the 20 without are mostly languages with little L2 use (Japanese, Vietnamese, Hungarian, Czech), with a few real gaps (Malay and Hausa, both lingua francas), which are data to add, not a reason for another rule. Needs only the selection in the dump query (P518, P585, the place qualifiers and the rank), no hand-kept list. No Wikidata batch: the statements are mostly right, only read without their qualifiers.

**The rule in detail** (`_scripts/speakers.mjs`, output `_data/speakers-run1.txt`): the kind of a figure is its *applies to part* (P518): none, *whole*, *sum*, *worldwide* or *speaker* = total; *first language* or *native speaker* = L1; *second language* or *foreign language* = L2. The reference statement is the newest worldwide one (no place qualifier, preferred rank first, then the latest P585; a date after today is a projection and counts only when nothing else is left, as Occitan's 2030 estimate); if it is a total, that is the figure, else the newest L1 plus the newest L2. **Effect** on the 1,818 items with an ISO 639-1 or 639-3 code and a positive count: 1,374 by a total, 312 by L1 alone, 53 by L1 + L2, 31 by places, 43 dead or historical by their peak; against today's maximum 1,787 keep their tier, 25 drop (5 by two or more: Yiddish 11M in 1910 => 1M today, Manx, Nigerian Pidgin, Limbu, British Sign Language), 6 rise (Urdu and Swedish by adding L2). **Data notes, no batch:** P518 sometimes holds a place (Russia, Myanmar, the Philippines) or a group (castes, a conflict, a year) instead of a kind; such figures count as by place. Armenian's only figure is dated by century (21st, stored as 2100). L2 gaps among large lingua francas (Malay, Hausa) are figures to add, from a source, when the tiers are reviewed.

<!-- @agent(#35) from #38 · 2026-10-20 · OPEN
Decided (Trummler, 2026-10-20): the speaker figure for the language tiers. Dead, extinct or historical type: the maximum, as now. Otherwise the newest worldwide P1098 (no place qualifier; preferred rank first, then latest P585, future dates only as a last resort): a total as it stands (P518 none / whole / sum / worldwide / speaker), else newest L1 (first language, native speaker) plus newest L2 (second language, foreign language); only figures by place: newest per place, summed. Moves 31 of 1,818 languages by a tier against today's MAX.
Ask: replace MAX(?spk) in dump-language-data.mjs by this selection when you're back on languages; no hurry. The reference implementation is _scripts/speakers.mjs.
Refs: this file, Languages => Speaker counts: which figure sets the tier
-->

### Wikidata issue: Hindi

Hindi (Q1568) carries *instance of: register* (Q286576) with **preferred** rank and no reference, beside *language* and *modern language* (normal rank, referenced). A preferred rank on one class hides the others from the truthy reading, so every query by class misses Hindi. The classes aren't alternatives, so the preferred rank has no basis (Help:Ranking; a bot already removed another unnecessary preferred rank on Hindi in 2025).  
**Fixed by hand** (QuickStatements can't set ranks): Trummler set that statement's rank to normal; checked on the item 2026-10-09. Hindi now reads *language* and *modern language* again and enters the membership with #35's next re-dump.  
Other ISO 639-1 items with a preferred P31 (Turkish, Pali, Sanskrit) keep an accepted class in the truthy reading, so they are harmless.

**Rating:** usable, but the membership query misses languages it should hold; the code-based union above fixes that without hand-kept QIDs.

## [to Navigation](#navigation)
