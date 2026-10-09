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
- 🔵[Subdivisions](#subdivisions)
- 🔵[Sub-Capitals](#sub-capitals)
- 🔵[Cities](#cities)
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
**Wikidata fix candidate:** Sark, Alderney, Herm, Jethou and Brecqhou carry *instance of: Crown Dependencies*, though only the bailiwick they belong to is one; a removal batch, prepared once the sources are clear.

**Curated QIDs pointing to the wrong item** (handed to #35): three curated territories name a region item rather than the polity the cell means. The polity item carries the population and capital that are hand-filled today:

| Curated | QID now | Polity item | Population | Capital |
| :---- | :---- | :---- | :---- | :---- |
| Iraqi Kurdistan | Q41470 *Kurdistan* (the whole cultural region, 152 sitelinks) | Q205047 *Kurdistan Region of Iraq* (102) | 6,171,083 (2020) | Erbil |
| Transnistria | Q648767 *Administrative-Territorial Units of the Left Bank of the Dniester* (Moldova's unit, 22) | Q907112 *Transnistria* (168) | 367,776 (2024) | Tiraspol |
| Abkhazia | Q23334 *Abkhazia* (historical region, 18) | Q31354462 *Republic of Abkhazia* (211) | 244,000 (2025) | Sokhumi |

<!-- @agent(#38) from #35 · 2026-10-08 · OPEN
Decided: the three swaps are done (sovereign-territories.json now keys Q205047, Q907112, Q31354462; both hand `pop` fields gone, populations and capitals from Wikidata; the ko override moved to Q31354462), re-dumped and rebuilt. Transnistria gained a lot (de "Pridnestrowien" etc. instead of the administrative unit's titles). But the polity items' labels are formal titles, and bucket-names.mjs takes rdfs:label as the drawable name, a shorter P1813 (short name) as `short`: Abkhazia now reads de "Republik Abchasien", es "República de Abjasia", it "Repubblica d'Abcasia", ja "アブハジア共和国" (before: Abchasien, Abjasia, Abcasia, アブハジア); Iraqi Kurdistan de "Autonome Region Kurdistan" (before "Kurdistan", the region). Separately, the re-dump picked up a Wikidata change: Nicaragua's capital (P36) now points to a new city item Q131546626 whose labels carry a disambiguator ("Managua (City)" in fr / it / cs / da, "マナグア（都市）", "마나과(도시)", "马那瓜 (城市)"), instead of the municipality Q3274.
Ask: prepare a QuickStatements batch (referenced, certain facts only): P1813 short names per language on Q31354462 (and Q205047 where a short form is established), so the drawable name comes back without a hand override; and the Managua labels without the disambiguator (labels are no place for it; a description is), or say whether P36 should rather stay on Q3274. Also note anything else in the formal-label pattern among the other matrix territories (Northern Cyprus already has a de override in name-overrides.json).
Refs: data-raw/geography/countries/{sovereign-territories,name-overrides}.json; scripts/geography/bucket-names.mjs (header); this file, Countries => Build query and the sovereignty matrix
-->

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
**Rating:** usable; the rule can be built from this query.

### Spans and continents (for the century slider)

**Items:** 930 (the 929 at ≥ 30 sitelinks, plus Carthage, Q6343, from the inclusion list; Assyria is the *Assyrian Empire*, Q41137, already among them). Tool: `_scripts/historical-spans.mjs`.  
**Date coverage:** inception (P571) 901, dissolved (P576) 903, start time (P580) 29, end time (P582) 24. Taking P571 else P580 as the start and P576 else P582 as the end: 23 lack a start, 22 an end, 14 both. No item starts after it ends, none ends after 2026.  
**Start centuries:** sparse before the 13th century BC (31 items spread over 61st to 14th century BC), then 4 to 15 per century until the 1st century AD, 16 to 49 per century from the 5th to the 18th, then 110 in the 19th, 207 in the 20th, 3 in the 21st.  
**End centuries:** from the 23rd century BC; up to 12 per century before AD, 3 to 60 per century after, then 131 in the 19th, 305 in the 20th, 13 in the 21st.  
**Earliest bucket:** "11th century BC or earlier" would hold 45 starts, about the load of an ordinary century in the Middle Ages; "13th century BC or earlier" 31.  
**Continents:** P30 on the item for 771, via the capital (P36) for 18 more; 141 have neither, but 124 of those carry coordinates (P625, on the item or its capital) that could place them; 17 remain. 26 items span several continents.  
**Dates to check rather than special-case:** some starts are a settlement's or a legend's, not the state's: Ugarit (6000 BC, the city's first settlement; the kingdom is c. 1450 to 1185 BC), Ancient Egypt (4000 BC), Gojoseon (2333 BC, the legendary founding), Xia dynasty (2205 BC, semi-legendary). Candidates for referenced corrections on Wikidata once sources are found; the rest of the 18 starts before 2000 BC (Ebla, Elam, Akkadian Empire, Third Dynasty of Ur, …) look plausible.


## ✅Capitals

*Not analyzed yet.*

## 🔵Subdivisions

*Not analyzed yet.*

## 🔵Sub-Capitals

*Not analyzed yet.*

## 🔵Cities

*Not analyzed yet.*

## ✅Languages

*Not analyzed yet.*

## [to Navigation](#navigation)
