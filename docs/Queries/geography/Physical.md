# Wikidata Query Analysis: Physical Geography

What Wikidata offers for the Physical Geography topics, and how far it can serve as their source.

**Split by continent (planned, Trummler 2026-10-08):** all topics here but Continents (and probably Climate Zones) are to be split by continent later, like the human-geography leaves (`<continent>/<stem>.json` with `inheritsUpwards`, the world list one level up). So each analysis notes whether its items can be placed on a continent (P30 directly, via a *located in* chain, or by coordinates), how many can't, and which span several (Nile, Ural, Pacific, …).

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
- ✅[Continents](#continents)
- ➕[Oceans & Seas](#oceans--seas)
- ➕[Islands](#islands)
- ➕[Mountains](#mountains)
- ➕[Deserts](#deserts)
- ➕[Rivers](#rivers)
- ➕[Lakes](#lakes)
- ➕[Climate Zones](#climate-zones)
- ➕[Volcanoes](#volcanoes)
- ➕[Mountain Ranges](#mountain-ranges)
- ➕[Waterfalls](#waterfalls)
- ✖️[National Parks](#national-parks)
- [Candidates](#candidates)

## ✅Continents

**Associated List:** -  
**Definition:** -  
**Built by** #35: `scripts/geography/{dump-plate-data,build-continents}.mjs`. **Membership:** ten landmasses by hand (the seven continents, plus Eurasia, India and Australia as the short forms of their plates), the plates of en:List of tectonic plates in its three bands (major / minor / micro), ranked by Bird's (2003) areas from de:Liste der tektonischen Platten, and a catch-all tier of every item typed *tectonic plate* (Q215680) outside the bands, cleaned by a hand drop list (`CATCHALL_DROP`). Extinct plates are an `omitted` rule `ancient` over a hand list. **Wikidata supplies the names only.**  
**Tool:** `_scripts/continents.mjs` (output `_data/continents-run1.txt`).

**Check (2026-10-09):** P31 *continent* answers 15 items; 96 items are typed *tectonic plate*. Of the 86 banded rows, 9 have no item, 6 resolve to an item that isn't a plate, and one carries an area (P2046). 26 plate items sit outside the bands.

### Continents: the hand list holds

*continent* (Q5107) has the seven continents and eight more: the Americas, Afro-Eurasia, the *Australian continent* (Q3960, whose labels describe rather than name it, which is why the build reads the country Q408), Turtle Island, Insular India, and three Japanese-wiki landmass items (*African Continent*, *North* / *South American continent*). All of them are correctly typed; they just aren't entries. For ten entries a hand list is shorter and clearer than a filter with an exclusion list, so it stays.

**Candidate entry:** the **Americas** (Q828, 267 sitelinks), *Amerika*, which the five-continent model taught in German-, French-, Spanish- and Italian-speaking schools counts as one continent. A tier-0 short-only entry like Asia or Europe; Afro-Eurasia is the weaker case. Trummler's call.

### Plates: no structure on Wikidata

- **Bands:** Wikidata has no major / minor split, and *microplate* (Q1933940) has no instances: it was typed as a plate itself (fixed below). The en list stays the source of the bands.
- **Areas:** one banded plate carries P2046. Bird's figures are steradians, so carrying them over would mean converting them ourselves, which doesn't belong on Wikidata. The de list stays the source of the ranking.
- **Rating:** the structure comes from Wikipedia and has to; Wikidata gives the names in up to 29 languages, which is what the build takes from it.

### What the catch-all collects

The 26 plate items outside the bands, by what they are:

| Kind | Items | On Wikidata |
| :---- | :---- | :---- |
| class misuse | *microplate* (a class, typed as an instance too), *intraplate deformation* (a process), and the Sylhet Trough typed an instance of *Indian Plate*, which in turn carried P279 *tectonic plate* | **batch below** |
| duplicate | *Western Siberia Plate* (Q17115739, be / ru / uk) and *West Siberian Plate* (Q25473407, eo only): one structure | **merge batch below** |
| duplicate, not mergeable | *Futuna Plate* Q1135772 and Q2043096: ruwiki has an article on each, so the items can't be merged until ruwiki merges them | left as it is |
| no lithospheric plate | West Siberian, Turan and Timan-Pechora (Q7853562, no en label) are *plates* in the Russian platform sense (*плита*, a section of a platform under its sedimentary cover; ruwiki *Плита (геология)*, Q97132326); the Jan Mayen Microcontinent; the Central India Tectonic Zone (a belt of sutures and orogens); Intermontane and Lhasa, whose en articles are terranes | candidates: a class change needs a source per item (the Great Russian Encyclopedia for the *плиты*); Jan Mayen's P31 carries a reference, so it stays |
| extinct plate | Phoenix, Izanagi, Farallon, Kula, Bellingshausen, Charcot, Cimmerian, Baltic, Moa, and the **European plate** (Q19848929; nlwiki: the plate that joined Kazakhstania and Siberia to form Eurasia) | no signal on Wikidata (no end date, no class) |
| a real plate the bands miss or mislink | Iranian Plate (Q1187892), Altiplano Plate (Q1200986), North Galápagos Microplate (Q5361664), South Georgia Plate | the items are right; see the build notes below |

**Build notes** (for #35; the message below):
- **The European plate is no duplicate** of the Eurasian plate: it is an extinct plate and belongs to `ancient`, not `CATCHALL_DROP`.
- **Rows that resolve to the wrong item.** *North Galapagos microplate* reads Q1200979, which is the Galápagos microplate (its own enwiki article); the North Galápagos microplate is Q5361664. *Iranian plate* reads Q237660, the Iranian plateau (en *Iranian plate* redirects there); the plate is Q1187892 (en *Iranian Plate*). Likewise the Azores and Hreppar microplates read a plateau (Q60755163) and an article on Iceland's deformation (Q28224929).
- **Rows without the item they have.** *Galápagos microplate* (Q1200979, 16 sitelinks) and *Altiplano plate* (Q1200986, 14, no enwiki article, so the title lookup can't reach it) get English and Bird's German only, while Wikidata names them in a dozen languages.
- **Banded plates without P31:** Danakil microplate and Queen Elizabeth Islands Subplate carry no class; a P31 needs a source, so they're candidates, not a batch.

**Labels with a disambiguator:** two in the build's languages: South Sandwich Plate de *Sandwichplatte (tektonische Platte)* (the case the build's `tidy()` strips) and Azores Plateau ru *Асориш (плато)*. Batch below.

**Wikidata batches from this pass** (imported and checked on the items 2026-10-09):

| Batch | Edits | What |
| :---- | ----: | :---- |
| `2026-10-09_tectonic-plate-class-misuse.txt` | 5 | remove *microplate* P31 *tectonic plate* (it keeps P279), *Indian Plate* P279 *tectonic plate* (it keeps P31), *intraplate deformation* P31 *tectonic plate* (it keeps *deformation*); Sylhet Trough's P31 *Indian Plate* becomes P706 *Indian Plate*, its reference moved along |
| `2026-10-09_plates-labels-disambiguators.txt` | 4 | the two labels above without the disambiguator; the former ones kept as aliases |
| `2026-10-09_west-siberian-plate-merge.txt` | 1 | merge Q25473407 into Q17115739 |

With the import the catch-all loses *microplate* and *intraplate deformation*, so two `CATCHALL_DROP` entries become unnecessary, and the duplicate West Siberian item goes.  
**Second pass (2026-10-20):** the `ancient` rule is a hand list of eleven QIDs in `build-continents.mjs` (Phoenix, Izanagi, Farallon, Kula, Bellingshausen, Charcot, Cimmerian, Baltica, Moa, plus Intermontane and Lhasa, which are terranes rather than former plates), against the principle that gaps are fixed on Wikidata, not in the build. Wikidata has no class for a plate that no longer exists: *tectonic plate* (Q215680) has four subclasses (*microplate*, *oceanic plate*, and two items with a single sitelink each, nl *overrijdende plaat* and pl *płyta kontynentalna*), none for former plates, and the former plates carry no end date. **Proposal (agreed with Trummler 2026-10-20):** a class item *former tectonic plate* (P279 *tectonic plate*), and P31 on each former plate with a reference; `ancient` then reads `P31 former tectonic plate`, and the European plate joins it without a list. Intermontane and Lhasa would become *terranes* and the Russian *плиты* parts of a platform (class changes), which clears the catch-all of the non-plates. Research: `_data/Prompts/done/Tectonic_Plates_Former_and_Misclassified.md` (Gemini; every source checked on Crossref or the publisher's page). Confirmed: Bellingshausen (Eagles, Gohl and Larter 2004, doi:10.1029/2003GL019127: "the Bellingshausen plate ceased to move independently"), Izanagi (Seton et al. 2015, doi:10.1002/2015GL063057: "complete subduction of the Izanagi plate"), Farallon (USGS *This Dynamic Earth*: "the formerly very large Farallon Plate", consumed down to the Juan de Fuca, Rivera and Cocos remnants), and the Danakil microplate (Eagles, Gloaguen and Ebinger 2002, *Kinematics of the Danakil microplate*). Not confirmed: two of the cited papers don't exist as cited, one doesn't mention its plate, so Phoenix, Kula, Charcot, Moa, the Cimmerian, Baltic and European plates, the terranes (Lhasa, Intermontane), the *плиты* and the Queen Elizabeth Islands Subplate go to a second prompt asking for openly readable sources. **Batches:** part 1 `2026-10-20_plates-former-class-1.txt` creates *former tectonic plate* (aliases *extinct tectonic plate*, *fossil plate*; P279 *tectonic plate*), types the Danakil microplate (it had no P31) and adds Epirus' continent (Countries); part 2, after the import, puts the class on Bellingshausen, Izanagi and Farallon. Part 1 imported and checked (2026-10-20): the class is Q141789550. A second prompt (asking for sources that can be opened) settled three more: *Lhasa Terrane* (an open-access article of 2026 so named, doi:10.3390/min16010063), the *Intermontane terrane* (Lithosphere 2013, *Paleogeography of the Insular and Intermontane terranes reconsidered*, doi:10.1130/L288.1), and the Central India Tectonic Zone as "a major Proterozoic orogenic suture" (doi:10.63335/j.hp.2025.0023). It failed on the rest: its quote for Phoenix ("went extinct ... around 145 Ma") is about an island arc in the cited paper, Moa only appears in a ResearchGate listing, and for Charcot, Cimmerian, Baltic and European plates, the *плиты* (bigenc.ru refuses requests) and the Queen Elizabeth Islands Subplate it found nothing it could open. Research settled there (`_data/Prompts/done/`). **Part 2** `2026-10-20_plates-former-class-2.txt` (9 lines): *former tectonic plate* on Bellingshausen, Izanagi and Farallon; Lhasa and Intermontane from *tectonic plate* to *terrane* (Q509037), the Central India Tectonic Zone to *suture* (Q1509590), each referenced. After it, `ancient` = instances of Q141789550 plus a hand list of seven (Phoenix, Kula, Charcot, Cimmerian, Baltic, Moa, European) until sources turn up; Lhasa and Intermontane leave the plate list altogether.

**Part 2 imported and checked (2026-10-20).** **Former blocks beyond the plates** (Trummler's question: the European and the Siberian plate, merged into Eurasia): Wikidata models the old continental blocks not as plates but as *paleocontinent* (Q2284298), *craton* (Q191110) or *continental fragment* (Q2094611). Paleocontinents with 5+ sitelinks: Pangaea, Gondwana, Laurasia, Rodinia, Pannotia, Laurentia, **Siberia** (Q926051, *paleocontinent* and *craton*), Baltica, Vaalbara, Avalonia, Sahul, Euramerica, Columbia, Kenorland, Ur, Laramidia, Cimmeria, Nena, Atlantica, Arctica, Appalachia, South China, Mauritia, Asiamerica, Balkanatolia, Armorica, Greater Adria, Protolaurasia, Argoland. *Kazakhstania* (Q2283292) is typed only as a geological region. The plate items *Baltic plate* (Q13542800) and *European plate* (Q19848929, nlwiki only) stand beside the paleocontinent Baltica as the plate that carried it. **Reading:** *paleocontinent* is the class the `ancient` question really asks for, and it is clean (no current landmass: Eurasia, the Americas and Afro-Eurasia are typed *supercontinent* only, not *paleocontinent*). Cratons are not former plates; most still exist as cores of today's plates (the Arabian Plate is typed both *tectonic plate* and *craton*). **Decided (Trummler, 2026-10-20):** paleocontinents join the topic as their own `omitted` rule `paleocontinents` beside `ancient`, by class (instances of *paleocontinent*, the supercontinents among them), no hand list. Kazakhstania joins once a source for its class is found.

<!-- @agent(#38) from #35 · 2026-11-06 · RESOLVED (#38 answered 2026-11-06; #35 implemented 2026-11-06: the dump now fetches former plates' names and the build drops those outside the catch-all into the floor tier, hidden by `ancient` — the four returned, ANCIENT_HAND is down to the three unsourced. This also closes the 2026-10-20 ask below.)
A pure re-dump (scripts unchanged) picked up a plate reclassification: Phoenix (Q902322), Kula (Q1320205), Charcot (Q5074185) and Moa (Q6886313) now carry P31 *former tectonic plate* (Q141789550) — former-plates.json went 3 => 7, finishing the 2026-10-20 plan's "until each is sourced".
Build consequence (a #35 fix, not a #38 one): with the current build these four vanish from the continents list entirely — the floor tier and the `ancient` match both lose them — because `ancient` is still driven by the catch-all names (plate-names.json), which stops returning a plate once it has a classification. Izanagi, Farallon and Bellingshausen stay only because they are still in the catch-all. This is exactly the open 2026-10-20 ask below: #35 will move `ancient` to read P31 Q141789550 directly (plus the shrinking hand list), so a sourced former plate stays in the list (hidden by default) instead of disappearing. #35 does this as part of the build-continents work (Z-review strand Z-A).
Ask: (1) confirm the four were classified deliberately (source found), so #35 may drop them from ANCIENT_HAND. (2) Are the three still hand-listed — Cimmerian (Q5120147), Baltic (Q13542800), European (Q19848929) — also being sourced, or do they stay a hand list for now? (3) Any further plate reclassifications expected, so #35 knows the catch-all will keep shrinking?
Refs: this file, Continents; scripts/geography/build-continents.mjs (ANCIENT_HAND); the 2026-10-20 thread just below.
Answer (#38, 2026-11-06): (1) Yes, deliberately: `2026-11-04_former-plates-add.txt`, one source per plate that states the subduction (USGS for Phoenix, the GPlates Extinct Ridges Database for Kula, a paper in PubMed Central for Charcot, IODP for Moa); then `-remove.txt` took *tectonic plate* off, as *former tectonic plate* sits under it. Both imported and checked by Trummler on 2026-11-04, so drop the four from ANCIENT_HAND. (2) Cimmerian, Baltic and European stay a hand list: two research runs found nothing that calls them a plate that no longer exists (for Cimmerian only a sentence on its crustal blocks, for Baltic a ResearchGate page, for European only a synonym of the Russian Craton), and no further run is planned. (3) None expected: no plate batch is open. Kazakhstania still has no source for a class either.
-->

<!-- @agent(#38) from #35 · 2026-10-30 · RESOLVED (#38 answered 2026-10-30: data does not support area-ranking; no change to #35)
Context (so the premise itself is on the table, not just the questions): tiers 0 to 2 of the continents list rank strictly by Bird (2003) steradians, one closed model summing to 4π, deliberately single-source (see build-continents.mjs header). Extinct plates and paleocontinents are not in Bird's model, so they carry no steradian and sit in the floor tier, hidden by default. Trummler asks whether extinct plates (e.g. the European plate Q19848929, merged into Eurasia) could instead be tiered by a *current* area, treating Wikidata gaps as a data matter for you. #35's reading: that would mix a second source and unit (km²) into Bird's steradian column (a conversion, i.e. the arithmetic the design avoids), and an extinct plate's area is a function of geological time, not a measurement range. So before #35 designs anything, the open question is whether the data even supports area-ranking.
Ask: for the former-plate set (P31 Q141789550) and, secondarily, the paleocontinents (P31 Q2284298): (1) how many items carry P2046 (area)? (2) with which qualifiers, in particular point in time (P585) and determination method (P459), and do items carry several values (a min/max spread)? (3) for plates that merged into a larger one (the European plate): is there a coherent *present-day* crustal extent, distinct from a reconstruction-epoch area?
Open to the premise: if you see a cleaner fix further down (a different class model, or simply that no coherent current area exists and the question is moot), say so. A redefinition lower down may make several of these questions unnecessary.
Refs: this file, Continents; scripts/geography/build-continents.mjs (header, ANCIENT_HAND, paleoRule)
-->

<!-- @agent(#35) from #38 · 2026-10-30 · RESOLVED (#35 agrees, 2026-10-30: extinct plates stay at the floor, no change needed)
Decided: the data does not support area-ranking; the question is moot, so extinct plates stay at the floor as built. (1) Of the 10 former plates (P31 Q141789550 plus the seven hand entries), none carries P2046. Of the 40 paleocontinents (P31 Q2284298), one does: Siberia (Q926051), 4.0 million km², no qualifiers, no reference to an epoch. (2) So there are no qualifiers to read (no P585, no P459) and no item with several values. (3) A present-day extent for a merged plate such as the European plate does not exist as data: its crust is part of Eurasia today, bounded only in reconstructions, and Wikidata gives no area for it at all. Filling this on Wikidata would need a source per plate and per epoch, which is the epoch dependence you named; I see no cleaner model further down. Bird's single-source steradian column stands.
Ask: nothing; close this if you agree.
Refs: this file, Continents (P2046 on P31 Q141789550 / Q2284298, queried 2026-10-30)
-->

<!-- @agent(#35) from #38 · 2026-10-20 · OPEN
Decided (Trummler, 2026-10-20): former plates get a class on Wikidata, *former tectonic plate* (Q141789550, P279 tectonic plate); Bellingshausen, Izanagi and Farallon carry it (batch 2 pending import). Lhasa and Intermontane are now *terranes*, the Central India Tectonic Zone a *suture*, so they leave the tectonic-plate query. The European plate is a former plate too (no source yet).
Ask: build `ancient` from `?p wdt:P31 wd:Q141789550` plus the remaining hand entries (Phoenix Q902322, Kula Q1320205, Charcot Q5074185, Cimmerian Q5120147, Baltic Q13542800, Moa Q6886313, European Q19848929) until each is sourced; drop Lhasa and Intermontane from ANCIENT. Also (Trummler): a new `omitted` rule `paleocontinents`, from `?p wdt:P31 wd:Q2284298` (Pangaea, Gondwana, Laurasia, Rodinia, Laurentia, Siberia, Baltica, Avalonia, Cimmeria, …; about 30 at 5+ sitelinks), names from Wikidata like the plates. No hurry.
Refs: this file, Continents => What the catch-all collects (Second pass)
-->

**Former plates, last research (2026-11-13, `_data/Prompts/done/Open_Gaps_Multi_Source.md`):** the Cimmerian Plate is now a *former tectonic plate* (batch `2026-11-13_geography-multi-source.txt`, *Episodes* 1987). For the *European plate* (Q19848929, only an nlwiki sitelink), no source names a Paleozoic "European plate": the literature calls the plate that joined Siberia and Kazakhstania **Baltica** (also *East European plate*), and IODP's thesaurus uses *European Plate* only as a synonym of the Eurasian Plate. So Q19848929 may be the same thing as the *Baltic plate* (Q13542800, enwiki *Baltic plate*: Baltica). **Open:** compare the two articles before proposing a merge; until then it stays a hand entry.

**Rating:** clean for names, as designed. The class tree around *tectonic plate* had three misuses (batched); the catch-all still holds non-plates that only sourced class changes can clear.

<!-- @agent(#35) from #38 · 2026-10-09 · OPEN
Decided: Continents analysed (this file, Continents). Three batches imported and checked (2026-10-09): class misuses (microplate, intraplate deformation, Indian Plate as a class), two disambiguated labels, the West Siberian duplicate merged.
Ask: (1) the European plate Q19848929 is an extinct plate, not a duplicate of the Eurasian: move it from CATCHALL_DROP to ANCIENT; (2) structure.tsv maps North Galapagos microplate to Q1200979 (the Galápagos microplate; the right item is Q5361664) and Iranian plate to Q237660 (the plateau; the plate is Q1187892), and leaves Galápagos microplate (Q1200979) and Altiplano plate (Q1200986) without their items; (3) drop microplate and intraplate deformation from CATCHALL_DROP; (4) for Trummler: the Americas as a tier-0 short-only entry?
Refs: this file, Continents => What the catch-all collects; _scripts/continents.mjs
-->

## ➕Oceans & Seas

**Associated List:** -  
**Definition:** -  
**Tool:** `_scripts/seas.mjs`.

**Base (proposed, 2026-10-30):** instances of *ocean* (Q9430) or *sea* (Q165) or one of their 21 subclasses (*marginal sea*, *inland sea*, *adjacent sea*, *historic ocean* …), not dissolved. 175 items with 5 or more sitelinks, 127 with 20, 88 with 50, 38 with 100; by sitelinks the Mediterranean (276), the Atlantic (274) and the Pacific (265) lead.
**Fame (decided by Trummler, 2026-10-30):** tiers and the dump floor by size, not sitelinks: area (P2046) for oceans, seas, gulfs, bays and lakes, length (P2043) for rivers. Where the size varies by season or climate (Lake Eyre), the largest recorded value counts, not the latest. Where the latest value is 0, the entry goes to an `omitted` rule `dry-lakes` (and `dry-rivers`, once it is clear how Wikidata models a river that no longer flows). **Coverage** (`_scripts/water-size.mjs`, 2026-11-03; direct class, 5 or more sitelinks; last column for 50 or more):

| Class | Items | With the size | At 50+ sitelinks |
| :---- | ----: | ----: | ----: |
| rivers, length (P2043) | 35,937 | 83 % | 278 of 278 |
| lakes, area (P2046) | 7,288 | 58 % | 64 of 64 |
| oceans and seas, area | 175 | 40 % | 58 of 88 |
| gulfs, area | 145 | 7 % | 6 of 15 |
| bays, area | 1,775 | 6 % | 13 of 30 |
| fjords, area | 711 | 5 % | 1 of 3 |
| straits, area | 577 | 3 % | 1 of 43 |

Rivers and lakes can be tiered by size today (331 rivers and 157 lakes carry several values, so "the largest" matters). Seas, gulfs, bays and fjords need filling: research for the 54 with 50 or more sitelinks (`_data/Prompts/done/Water_Areas_1.md`, `_2.md`) gave 8, all from Britannica and checked on the page by Trummler: `QuickStatements/2026-11-03_water-areas.txt`. The other 46 had nothing checkable. Straits have no meaningful area at all; their size would be a length or width, to be decided.
**Dry lakes and rivers on Wikidata:** classes exist: *former lake* (Q47486890, 238: the Aral Sea), *dry lake* (Q3497768, 145), *intermittent lake* (Q10313934, 1,269: Kati Thanda–Lake Eyre), *former river* (Q27067659, 85), *seasonal river* (Q16465938, 28,836), *wadi* (Q187971, 52,127). So `dry-lakes` and `dry-rivers` can read the class instead of an area of 0, which only 6 lakes carry. Lake Eyre itself holds one undated value (9,300 km²), so "largest recorded" needs no special case there.
**Checked against a reader's list:** the five oceans, the Mediterranean, Black, Caspian, Baltic, North, Red and Caribbean Seas, the Gulf of Mexico and the Sea of Japan are in; the Dead Sea, the Aral Sea, the Sea of Galilee and the Salton Sea are not, rightly: Wikidata types them as lakes (salt, endorheic, the Aral Sea as a *former lake*; Lakes).
**Candidate rules:**
- `historic-oceans` (omitted; approved by Trummler, 2026-10-30): *historic ocean* and *historic superocean*, 20 items from 5 sitelinks: Tethys, Paratethys, Iapetus, Panthalassa, Rheic, Mirovia …, and the *Lunar magma ocean*, which is no ocean of the Earth and could go to the exclusion list. Like `paleocontinents` in Continents.
- **Grouping (decided by Trummler, 2026-10-30):** oceans always in; seas `omittable`; gulfs, bays, fjords and the like each an `omitted` group of their own by their typical size (gulfs one group, bays another). That needs gulfs told apart from bays, which Wikidata's typing does not do on its own (below); measured: 52 items carry both classes, and 83 are only *bay* while named Gulf (of Aqaba, of Thailand, of Finland, of Oman, of Riga, of Corinth …). Size does not separate them: the median area is 160,000 km² for items only in *gulf*, 3,200 km² for *bay* items named Gulf, 590 km² for other bays, so a Gulf of Naples is bay-sized by any measure. The name is what a reader goes by. *gulf* is a subclass of *bay* (as is *fjord*), so they are no opposites, and the superclass is usually not kept beside the subclass (22 % of gulfs also carry *bay*, 3 % of fjords). Batch `2026-11-03_gulfs-class.txt` therefore replaces *bay* with *gulf* on the 82 items named Gulf with 5 or more sitelinks; the group reads the class, and a query for bays takes the subclass tree or leaves gulfs out by choice.
- `gulfs-and-bays`, as measured: gulfs (Q1322134) and bays (Q39594) sit outside the sea tree, so the base misses the Bay of Bengal (130 sitelinks), the Gulf of Guinea, the Bay of Biscay, the Gulf of Aden, the Gulf of Bothnia; with 30 sitelinks or more there are 35 gulfs and 102 bays (Wikidata types many gulfs as *bay*: the Gulf of Finland, of Oman, of Thailand). The best-known ones (Persian Gulf, Gulf of Mexico, Hudson Bay) carry *sea* or *marginal sea* as well and are in the base.
- `straits` (omitted; approved by Trummler, 2026-10-30): straits (Q37901), 76 with 30 or more sitelinks (Hormuz, Bosporus, Gibraltar, Bering); the English Channel and the Kattegat carry *sea* or *bay* too and show up in the base or the gulf rule.
**Rating:** ➕ (was 🔵): the base is clean and small; what a reader may miss is the gulfs and bays, which their rules add.

**Research (2026-11-04; `done/Water_Areas_3.md`, `done/Water_Areas_4.md`):** thin. Bay of Fundy 16,000 km² in **batch** `2026-11-04_desert-and-bay-areas.txt` (**pending**). Rejected: Gulf of Guinea 106,400,000 km² (larger than the Atlantic), Gulf of Oman from an exam-coaching site, Fundy's 180,000 km² (with the Gulf of Maine). Kara, Chukchi and Timor Sea from Britannica, checked on the pages by Trummler: **batch** `2026-11-04_sea-and-desert-areas-britannica.txt` (**pending**). Rows left open: `Water_Areas_6.md`. The rest of `done/Water_Areas_5.md` returned none found, its ResearchGate rows are still to check.

## ➕Islands

**Associated List:** -  
**Definition:** -  
**Tool:** `_scripts/physical.mjs` (all of the sections below; 2026-11-03).

**Base (proposed):** instances of *island* (Q23442) or a class under it, not dissolved, without the countries: an item whose only island class is *island country* or *archipelagic state* is a country (Japan, Greenland Q223, Taiwan Q865), and the island has an item of its own where it matters (Greenland Q4148644, Taiwan Island Q22502, Bali Island Q4648, Tasmania Q3593416). 1,819 items from 20 sitelinks. **Fame:** area (P2046), as for the water topics: 96 of 96 from 100 sitelinks, 345 of 350 from 50, 1,759 of 1,819 from 20; the largest are Greenland, New Guinea, Borneo, Madagascar, Baffin Island.
**Candidate rules:** `artificial-islands` (omitted: *artificial island*, *artificial island airport*: Kansai, Hong Kong and Macau airports), `atolls` and `reefs` (omittable or omitted; 138 and 10), `former-islands` (omitted). **Noise:** a castle or quarter typed *island* (Eilean Donan, Kisimul Castle, the Venetian Ghetto, Jal Mahal): few, for the exclusion list.
**A value not to read:** Taiwan (Q865, the state) holds 11,418,174 km² without a reference, the area the Republic of China once claimed, beside 36,193 km². With "the largest value" it would beat Greenland; the country rule keeps it out. Left as it is.
**Gaps:** areas for the real islands among the 60 without one, optional research `_data/Prompts/optional/Island_Areas.md`.
**Rating:** ➕ (was 🔵).

## ➕Mountains

**Associated List:** -  
**Definition:** -  
**Base (proposed):** instances of *mountain* (Q8502) or a class under it (*volcano*, *stratovolcano*, *mons* …), 1,181 items from 20 sitelinks. **Fame:** elevation (P2044): 15 of 15 from 100 sitelinks, 125 of 125 from 50, 1,157 of 1,181 from 20. By elevation the top is the eight-thousanders; sitelinks would put Everest, Kilimanjaro, Fuji, Vesuvius and Mont Blanc first, so a low famous mountain (Vesuvius 1,281 m, Table Mountain) sits in a low tier by this measure: a choice to look at when the tiers are built.
**Candidate rules:** `extraterrestrial` (omitted: not on Earth, P376: Olympus Mons, the Tharsis Montes, Maxwell Montes; they lead by elevation otherwise), `volcanoes` (omittable: 171 *volcano*, 143 *stratovolcano*, 35 *shield volcano* and others, overlapping). **Mountain ranges** (*mountain range*, Q46831, 639 from 20 sitelinks; elevation 553 of them, 13 of 13 from 100) are their own class and fit as an `omitted` group or a topic of their own: Alps, Himalayas, Andes. Tibet and the Altiplano come in as *highland*. Gaps: optional research `_data/Prompts/optional/Range_Elevations.md`.
**Rating:** ➕ (was 🔵).

## ➕Deserts

**Associated List:** -  
**Definition:** -  
**Base (proposed):** instances of *desert* (Q8514) or a class under it, 83 items from 20 sitelinks. **Fame:** area (P2046): 24 of 24 from 50 sitelinks, 48 of 83 from 20; Sahara, Gobi, Arabian, Libyan, Kalahari lead. The Sinai Peninsula and Death Valley come in by a desert class, fair enough for a reader. An "Antarctic Desert" is not in the base by that name (~ the polar deserts may be missing, not checked further). **Gaps:** research for the 35 in `_data/Prompts/Desert_Areas.md`.
**Rating:** ➕ (was 🔵).

**Research (2026-11-04; `done/Desert_Areas.md`):** 6 of 35. Badain Jaran 50,000 km² and Gurbantünggüt 48,888 km² in **batch** `2026-11-04_desert-and-bay-areas.txt` (**pending**). Eastern Desert, Betpak-Dala, Great Basin and Painted Desert from Britannica, checked on the pages by Trummler: **batch** `2026-11-04_sea-and-desert-areas-britannica.txt` (**pending**). The other 29 returned none found: `Desert_Areas_2.md`.

## ➕Rivers

**Associated List:** -  
**Definition:** -  
**Base (proposed):** instances of *river* (Q4022) or a class under it, 2,063 items from 20 sitelinks. **Fame:** length (P2043): 42 of 42 from 100 sitelinks, 287 of 287 from 50, 2,041 of 2,063 from 20; 331 of the 35,937 rivers from 5 sitelinks hold several values, so "the largest" matters (the Amazon 6,992 km before the Nile 6,650 km on that reading). **Candidate rules:** `dry-rivers` (omitted: *former river*, 85), `wadis` (omitted: *wadi*, 52,127 in all, 7 from 20 sitelinks); *seasonal river* (28,836) is too large and too ordinary to call dry. **Noise:** *Mediterranean Games* carried P31 *river* (batch `2026-11-03_mediterranean-games.txt`).
**Rating:** ➕ (was 🔵).

## ➕Lakes

**Associated List:** -  
**Definition:** -  
**Base (proposed):** instances of *lake* (Q23397) or a class under it, 713 items from 20 sitelinks. **Fame:** area (P2046): 17 of 17 from 100 sitelinks, 94 of 97 from 50, 665 of 713 from 20. The Caspian Sea is both here and in Oceans & Seas, and the Dead Sea and the Aral Sea only here. **Candidate rules:** `reservoirs` (omittable: 78), `lagoons` (omitted: 17; Pearl Harbor, the Golden Horn and the Bay of Kotor come in this way and have no area), `dry-lakes` (omitted: *former lake*, *dry lake*; the Aral Sea, Lake Agassiz and Lake Bonneville lead by area otherwise; *intermittent lake* like Lake Eyre stays, with its largest area). **Gaps:** optional research `_data/Prompts/optional/Lake_Areas.md`.
**Rating:** ➕ (was 🔵).

## ➕Climate Zones

**Associated List:** -  
**Definition:** -  
**Base (proposed):** the values in use of *Köppen climate classification* (P2564): 47 values, the tropical rainforest climate on 673 items, humid subtropical 584, tropical monsoon 542. The list is the classification's own (about 30 types), plus a few wrong values to clean (*fog*, *steppe*, *doldrums*, *Neotropical realm*, *Semifreddo*). Items describe themselves as a "category in the Köppen climate classification systems", with no class of their own to query, so the classification's parts are the safer base: a small hand-checkable list.
**Fame:** no size here; sitelinks (Mediterranean climate 76, tropical climate 71, continental 67, oceanic 63, tundra 15) or use. **Rating:** ➕ (was 🔵).

## ➕Volcanoes

**Associated List:** -
**Definition:** -
**Approved as a topic (Trummler, 2026-11-02);** duplicates with Mountains are filtered anyway. `_scripts/candidates-metrics.mjs`.
**Base (proposed):** *volcano* (Q8072) or a class under it (366 from 20 sitelinks), plus items with a Global Volcanism Program number (P1886; 513 from 20 sitelinks, 1,851 in all). The number catches what the class misses: Krakatoa (*caldera*), Lake Toba (*crater lake*). Extraterrestrial volcanoes carry no such number and stay a rule of their own.
**Candidate rule:** `submarine` (below sea level, as Trummler proposed): only 6 of 359 have a negative elevation from 20 sitelinks, 177 items carry *submarine volcano* in all, so class and elevation together.

**Fame (Trummler: activity rather than height, Yellowstone near the top).** There is no volume per volcano in a table. What exists is the Smithsonian's eruption list ([GVP, WFS service](https://webservices.volcano.si.edu/geoserver/GVP-VOTW/ows)): 11,089 eruptions, 8,418 with a Volcanic Explosivity Index (VEI), on 915 volcanoes. A VEI step means about ten times the ejected volume, so 10^(VEI-5) gives km³.

- **Accumulated volume** is nearly the same order as the **largest eruption**, since one large eruption outweighs all small ones: Crater Lake 110, Santorini, Kikai, Rinjani, Tambora, Cerro Blanco and Kurile Lake about 100, Pinatubo 41, St. Helens 17, Krakatau 10, Vesuvius 6, Fuji 3, Etna 2, Stromboli 0.07, Kīlauea 0.11.
- **Proposed tiers: largest VEI,** which gives natural steps: 7 volcanoes at VEI 7, 41 at 6, 80 at 5, 140 at 4, and the rest. Accumulated volume can order within a tier.
- **Two limits.** The list covers the Holocene only: Yellowstone (a Pleistocene entry, no rows) and Toba have no eruption in it. Their VEI 8 has to come from elsewhere; Wikidata already has the *youngest Toba eruption* and the *Oruanui eruption* at VEI 8. And VEI measures explosive eruptions, so effusive giants stay low (Kīlauea 4, Mauna Loa), however active they are.
- **Coverage:** of the 513 items with a number from 20 sitelinks, 383 have eruption rows, 338 a VEI.

**Where the figure lives on Wikidata:** *volcanic explosivity index* (P1903) has the subject type *volcanic eruption*, so it belongs on an eruption item, not on the volcano, and a volcano has no VEI of its own (GVP rates eruptions only; Mauna Loa's 2 is its 1852 and 1868 eruptions). The build reads the highest P1903 among a volcano's eruption items, through P276, P706 or the volcano's P793.

**Batches, Trummler's route (2026-11-02): one item per volcano, for its largest confirmed eruption;** on a tie the one with a firm VEI, then the youngest. Date and VEI from GVP, "circa" and "presumably" as qualifiers where GVP is uncertain, and GVP's ± as *earliest date* and *latest date* (P1319, P1326) on the start date. Pre-1582 dates stay at the year.
- `2026-11-02_eruptions-vei5plus-part[1-3]of3`: 109 items. `2026-11-02_eruptions-vei4-part[1-3]of3`: 125. `2026-11-02_eruptions-vei3-and-below-part[1-3]of3`: 154, only volcanoes from 20 sitelinks: Wikidata's notability sets no VEI limit, so the stopping point is the topic's own: below that, no tier would show them (251 left out).
- `2026-11-02_eruptions-vei-on-existing`: VEI and place on existing items. Six planned creations already existed under other names (1257 Samalas, 946 Paektu, 1886 Tarawera, Huaynaputina, Kanlaon, Poás). Mount Bandai 1888 reads VEI 2 with a source, GVP 4: both stand, the build takes the higher.
- Wikidata rates some above GVP (Avellino 6, Hatepe 7, Paektu 7): left alone.
- **Part 1 of VEI 5+ is imported and checked:** 36 of 36 items, every statement, qualifier and reference as in the batch. It went in before the date ranges, so `2026-11-02_eruptions-vei5plus-part1-date-ranges` adds them to its 16 items with a ±.
- **Limit on the first import:** run in parallel, 51 of the 388 creations failed on Wikidata's limit for new IDs, with no stray statements on the items before them: `2026-11-03_eruptions-retry`.
- **All imported and checked (2026-11-03):** 394 new eruption items, every statement in place. `2026-11-03_volcanoes-significant-event-part[1-3]of3` adds the link from the volcano (398 P793, no reference: it follows from the eruption item's own place).
- **State:** 434 volcanoes with a number now have a VEI: 4 at VEI 8 (Toba, Aso, Yellowstone, Taupō), 11 at 7, 41 at 6, 76 at 5, 138 at 4, 76 at 3, 88 lower. The count of 7 is inflated by items sharing a GVP number (Santorini, its caldera and its archipelago), so a build has to read one volcano per number.
- **Older than the Holocene** (`_data/Prompts/done/Pleistocene_Eruptions.md`, `2026-11-03_eruptions-pleistocene`): Lava Creek at Yellowstone VEI 8 and Aso-4 VEI 8 as stated; the Campanian Ignimbrite VEI 7 on its existing item. Fish Canyon at La Garita is read from one USGS page, which sets VEI 8 at 1,000 km³ and gives more than 5,000. Whakamaru, Los Chocoyos, Bishop, Otowi and the Ito ignimbrite have a magnitude M only, and their source warns against reading M as VEI, so they stay out.
<!-- @agent(#35) from #38 · 2026-11-03 · OPEN
Decided (Trummler, 2026-11-02): Volcanoes, Mountain Ranges, Waterfalls and National Parks here, World Heritage Sites and Currencies in `Human.md`; each section holds base, measure and rules.
Volcanoes: tier = highest P1903 among eruption items linked by P276, P706 or the volcano's P793; one volcano per GVP number. The base must also take what an eruption item with a VEI points to, or La Garita falls out (a caldera with no GVP number).
Ranges: level 0 is a hand list of seven, level 1 the default, the rest opt-in; *highland* out of the class tree. Waterfalls: "Vertical area (m²)", hidden `former`. Currencies: users at the best moment, as in `Human.md`; groups `historical`, `coins`, `crypto`, `fictional`.
Ask: tell me if any of it doesn't fit the build; a re-dump after the P793 batch has the new data.
Refs: the sections named; `_data/QuickStatements/imported/`
-->
**Rating:** ➕.

**Research (2026-11-04; `done/Pleistocene_Eruptions_2.md`):** VEI 8 stated by the USGS for Cerro Galán and Los Chocoyos, in **batch** `2026-11-04_eruptions-pleistocene-2.txt` (**pending**). Bishop Tuff (VEI 7) and Bandelier (VEI ~8) are behind blocks, so Trummler checks them by hand. La Pacana and Aira returned none found.

**Hand check (2026-11-13; `_data/Prompts/done/_Hand_Check.md`):** both read on the page, so they become eruption items with the VEI (Otowi's as *circa*): `2026-11-13_eruptions-bishop-otowi-create_PRE6`, then the P793 links from the calderas (`POST6`). The other hand-checked rows (areas, range elevations, seats, the Baltic plate) are in `2026-11-13_geography-hand-check`.

## ➕Mountain Ranges

**Associated List:** -
**Definition:** -
**Approved as a topic of its own, tiers by elevation (Trummler, 2026-11-02).**
**Base:** *mountain range* (Q46831) or a class under it: 639 from 20 sitelinks, 3,988 from 5; elevation 553 of the 639. Research: `_data/Prompts/optional/Range_Elevations.md`.

**Levels (Trummler, 2026-11-02):** level 0 is a mountain system, level 1 a range with no range above it, level 2 one step below, and so on. Level 1 is on by default, level 0 and level 2 and deeper are opt-in. Links: *mountain range* (P4552), *part of* (P361), *located in/on physical feature* (P706); a system as parent doesn't add a step. Measured as it will stand after the batches below, without *highland*:

| Level | From 5 | From 20 | From 50 |
| --- | --- | --- | --- |
| 1 | 1,939 | 276 | 70 |
| 2 | 960 | 187 | 9 |
| 3 | 501 | 54 | 4 |
| 4 and deeper | 536 | 109 | 6 |

- **Level 1** holds what it should: Alps, Himalayas, Andes, Rocky Mountains, Urals, Pyrenees, Carpathians, Caucasus, Karakoram, Atlas, Appalachians, Altai, also Balkan Mountains, Ardennes, Cascades, Sudetes, Eifel.
- **Level 2** holds true parts: Greater and Lesser Caucasus, High Atlas, Western Alps, Canadian Rockies, Blue Ridge, Ore Mountains. Some famous names sit deeper: Tatras level 5, Annapurna level 2. They are opt-in, as subdivisions.
- **Level 0** is a hand list, as *mountain system* (Q1437459) is a mixed class. Giant chains and groupings: American Cordillera, Alpide belt, North American Cordillera, Pacific Coast Ranges, Rhenish Massif, Bohemian Massif, Balcanides. The rest of the class is no such thing and stays out of the topic: shields and cratons (Canadian, Guiana, Baltic), the Mid-Atlantic Ridge, the Armorican Massif, single mountains.

**Batches:**
- `2026-11-02_mountain-ranges-classes`: *mountain range* on 27 ranges held only as mountain systems (Altai, Scandinavian Mountains, Vosges, Alaska Range and so on); the North American Cordillera as a mountain system. `2026-11-02_north-american-cordillera-class-remove` takes its old classes off.
- `2026-11-02_mountain-systems-add` and `-remove`: Pacific Coast Ranges, Balcanides, Rhenish and Bohemian Massif as systems, which is what lifts the Cascades, Balkan Mountains, Ardennes and Sudetes to level 1.

**Still in level 1, to read through:** *highland* (Q878223) brings Tibet, the Altiplano and the Plain of Jars into the tree (19 from 20 sitelinks), so it goes out as a class. Items classed *mountain range* that aren't one: Phlegraean Fields, Lake District, Central Siberian Plateau.

**Rating:** ➕.

## ➕Waterfalls

**Associated List:** -
**Definition:** -
**Approved; tiers by height times width (Trummler, 2026-11-02).**
**Base:** *waterfall* (Q34038) or a class under it: 74 from 20 sitelinks, 1,234 from 5. Height (P2048) 58 of the 74, width (P2049) 32, both 31; discharge (P2225) 15.
**Name of the measure:** *vertical area* (m²), Guinness World Records' term for it ([largest waterfall by vertical area](https://guinnessworldrecords.com/world-records/92447-largest-waterfall-by-vertical-area)).

**The measure works.** By height times width (m²): Dry Falls 681,557, Iguaçu 221,400, Guaíra 193,120, Victoria 184,356, Angel 104,753, Seven Sisters 93,890, Ruacana 84,000, Shoshone 64,191, Niagara 45,030, Rhine Falls 34,500, Kaieteur 25,538, Yosemite 19,953, Tugela 14,220. Niagara moves from far down to ninth. Dry Falls is dry today and Guaíra drowned in 1982: an omitted rule `former` (Trummler, 2026-11-02). Also *Horseshoe Falls* stands beside Niagara as its part.
**Gap:** 42 had no width from 20 sitelinks. The research (`_data/Prompts/done/Waterfall_Widths.md`) cited homepages almost throughout, so it gave little: 4 from the [World Waterfall Database's width ranking](https://www.worldwaterfalldatabase.com/largest-waterfalls/total-width) (`2026-11-03_waterfall-widths`), 1 from Britannica (Boyoma, its largest cataract; `2026-11-03_waterfall-width-boyoma`). The sentences quoted for the Blue Nile Falls and Epupa are on no Britannica page. The 37 others keep no vertical area for now. The ranking is no complete list: Ngonye and Epupa, both wide, are missing from it.
**Rating:** ➕.

**Research (2026-11-04; `done/Waterfall_Widths_2.md`):** Venta Rapid 249 m and Keila 70 m in **batch** `2026-11-04_waterfall-widths-3.txt` (**pending**). Blue Nile 400 m is behind a block, so Trummler checks it by hand. The other 12 returned none found, so widths stay a weak measure.

## ✖National Parks

**Associated List:** -
**Definition:** -
**Approved; the area questions go to research (Trummler, 2026-11-02).**
**Base:** *national park* (Q46169) or a class under it: 746 from 20 sitelinks, area 723 of them. Also in: Israel's archaeological parks (Qumran, Herodium, Gezer), a candidate for an omitted rule. Visitors (P1174): none. WDPA ID (P809): 681.

**Checked against Protected Planet** (`_scripts/park-areas.mjs`): its page per WDPA ID states a *Reported Area* and opens by script. 570 of the 746 could be compared (no single WDPA ID or no area on Wikidata: 105; no area on the page: 71).

| Wikidata's largest value / Protected Planet | Parks |
| --- | --- |
| under 1/3 | 15 |
| 1/3 to 0.8 | 18 |
| 0.8 to 1.25 | 478 |
| 1.25 to 3 | 30 |
| 3 to 30 | 17 |
| 30 to 300 | 11 |
| over 300 | 1 |

So 84 % agree, and the errors are as suspected: hectares entered as km² (Western Pomerania Lagoon 78,600 for 786, Harz 24,703 for 247) and thousands read as decimals (Murchison Falls 3.877 for 3,877, Ruaha 20.226 for about 20,000). **Protected Planet is not always right either:** Pamir National Park has 26,117 km² on Wikidata and 2,600 there, Alexander von Humboldt 70.68 there for a park of about 700, Gates of the Arctic 12; these are mine to flag from general knowledge, unchecked, and it is why a single comparison doesn't justify a removal.

**Done with this:**
- `_data/QuickStatements/2026-11-02_national-park-areas-remove.txt`: 8 values off by a power of ten, without a source URL or qualifier, where another value on the item agrees with Protected Planet to within 3 %.
- `_data/Prompts/done/National_Park_Areas.md`: the other 42 at a factor of three or more, for an independent source. Only pages that state the figure count: of the Deep Research answer 9 rows, of the regular answer 4, whose other rows mostly quote a sentence absent from the page. Protected Planet is the wrong one for Gates of the Arctic, Pamir, Hohe Tauern and Omo; Wikidata for Denali, Los Arrayanes and Žemaitija (`2026-11-03_national-park-areas-3-add`, `-remove`). Checked in the browser by Trummler: Komodo's 219,322 ha stands on UNESCO's 1991 summary, Namaqua's 141,000 ha on SANParks (`2026-11-03_national-park-areas-4-add`, `-remove`; Komodo's 17,332 km² and Namaqua's 1,368.18 ha go, both imported from a Wikipedia only). Isalo stays open: the row's page is another park's; `National_Park_Areas_2.md` asks again.

**Sweep from 5 sitelinks** (1,781 compared, 416 off by a factor of three or more):
- `2026-11-02_national-park-areas-2-remove`: 143 more by the same rule.
- `2026-11-02_national-park-areas-2-hectares-add` and `-remove`: 28 parks whose only value holds their hectares as km² (Alto Purús, Bahuaja-Sonene, Great Sandy): same digits, unit corrected.
- 244 stay in doubt, 38 of them from 20 sitelinks, all in that prompt. The rest wait until the tier cut is set.

**Rating:** ✖️ until the values are fixed, then ➕.

**Research (2026-11-04; `done/National_Park_Areas_2.md`):** several Wikidata values had a wrong unit or scale: Isalo 8,154 km² (81,540 ha), Gunung Mulu 52,864 km² (52,864 ha), Murchison Falls 3.877 km² (3,840 km²), Kellerwald-Edersee 5,738 km² (its first area, in ha). **Batches** `2026-11-04_national-park-areas-5-add.txt`, then `-remove.txt` (**pending**); Borjomi-Kharagauli 107,649 ha is added too. Humboldt, Bale, Abel Tasman, Pendjari and Agulhas, checked on the pages by Trummler: **batches** `2026-11-04_national-park-areas-6-add.txt`, then `-remove.txt` (**pending**), the latter for Humboldt's 7,068 km² and Abel Tasman's 2,253 km², each ten times too large. Calilegua (76.3 against 763.06 km²) looks ten times off too, but its source didn't load.

## Candidates

Not approved as topics yet. **Check (2026-11-02):** `_scripts/candidates-geo.mjs`, `_scripts/candidates-metrics.mjs`; members with 20 or more sitelinks, and the three columns count those carrying the size.

| Candidate | Root class | Members | Size | From 20 | From 50 | From 100 |
| --- | --- | --- | --- | --- | --- | --- |
| Peninsulas | Q34763 | 246 | area | 66 | 28 of 47 | 13 of 15 |
| Straits | Q37901 | 145 | width | 37 | 13 of 45 | |
| Canals | Q12284 | 58 | length | 39 | 9 of 9 | 2 of 2 |

- **Peninsulas (put back, Trummler, 2026-11-02: what counts as a peninsula is too uncertain):** *cape* and *headland* sit under the root (73 and 54 of the members) and would go out, leaving about 168. Some members are regions as much as peninsulas (Calabria, Horn of Africa, Mainland Southeast Asia).
- **Straits (decision by the best metric, Trummler, 2026-11-02):** length is no natural figure, since nobody defines where a strait starts. Ships per period would fit, but Wikidata has no such property (*annual average daily traffic*, P8753, is for roads and none of the straits carries it), and published counts exist only for the great chokepoints (Hormuz, Malacca, Suez and so on), not for 145 straits. On the items are depth 49, width 37, length 33. **So no metric promises a tier list**; the approved `straits` group under Oceans & Seas needs none and stays, with no topic of its own (Trummler, 2026-11-02; sitelinks as the fallback should tiers ever be wanted).
- **Canals (put back):** 201 from 10 sitelinks with length on 99, discharge on 9; the class tree pulls in the Amstel, Pontcysyllte Aqueduct and a rowing course. Length would work once the list is read through; traffic has the same lack as straits.

## [to Navigation](#navigation)
