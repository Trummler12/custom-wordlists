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

**By hand:** QuickStatements can't set a rank, so Islamabad's P36 statement on Pakistan (Q843) was set *preferred* in the item's UI (done 2026-10-09), as Indonesia's current Jakarta statement already was.  
**Rating:** clean; the one modelling error on Wikidata is fixed. The build picks it up with the next re-dump.

<!-- @agent(#38) from #35 · 2026-10-09 · OPEN
Decided: the article-title rule is built (bucket-names.mjs: a language's Wikipedia title enters as `short` when shorter than the label, else as `others`; disambiguated titles drop out). Your capital batches and the Managua labels came in with the re-dump.
Ask: the pt label of Hargeisa (the capital of Somaliland) reads "JHHargeisa", a typo; a one-edit batch. Note also that Oslo's de / es / fr / it labels now sit only in `mul`, which the geo dump doesn't read yet (#35's strand Z), so no batch there.
Refs: this file, Capitals; data-raw/geography/countries/capital-names.json
-->

## 🔵Subdivisions

*Not analyzed yet.*

## 🔵Sub-Capitals

*Not analyzed yet.*

## 🔵Cities

*Not analyzed yet.*

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
| a preferred P31 hides the accepted classes (Wikidata issue, below) | **Hindi** (224) |
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

### Wikidata issue: Hindi

Hindi (Q1568) carries *instance of: register* (Q286576) with **preferred** rank and no reference, beside *language* and *modern language* (normal rank, referenced). A preferred rank on one class hides the others from the truthy reading, so every query by class misses Hindi. The classes aren't alternatives, so the preferred rank has no basis (Help:Ranking; a bot already removed another unnecessary preferred rank on Hindi in 2025).  
**Fix by hand** (QuickStatements can't set ranks): set that statement's rank to normal.  
Other ISO 639-1 items with a preferred P31 (Turkish, Pali, Sanskrit) keep an accepted class in the truthy reading, so they are harmless.

**Rating:** usable, but the membership query misses languages it should hold; the code-based union above fixes that without hand-kept QIDs.

## [to Navigation](#navigation)
