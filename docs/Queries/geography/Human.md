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
