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
- 🔵[Islands](#islands)
- 🔵[Mountains](#mountains)
- 🔵[Deserts](#deserts)
- 🔵[Rivers](#rivers)
- 🔵[Lakes](#lakes)
- 🔵[Climate Zones](#climate-zones)

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

**Wikidata batches from this pass** (imported and checked on the items 2026-10-09; files in `_data/QuickStatements/imported/`):

| Batch | Edits | What |
| :---- | ----: | :---- |
| `2026-10-09_tectonic-plate-class-misuse.txt` | 5 | remove *microplate* P31 *tectonic plate* (it keeps P279), *Indian Plate* P279 *tectonic plate* (it keeps P31), *intraplate deformation* P31 *tectonic plate* (it keeps *deformation*); Sylhet Trough's P31 *Indian Plate* becomes P706 *Indian Plate*, its reference moved along |
| `2026-10-09_plates-labels-disambiguators.txt` | 4 | the two labels above without the disambiguator; the former ones kept as aliases |
| `2026-10-09_west-siberian-plate-merge.txt` | 1 | merge Q25473407 into Q17115739 |

With the import the catch-all loses *microplate* and *intraplate deformation*, so two `CATCHALL_DROP` entries become unnecessary, and the duplicate West Siberian item goes.  
**Second pass (2026-10-20):** the `ancient` rule is a hand list of eleven QIDs in `build-continents.mjs` (Phoenix, Izanagi, Farallon, Kula, Bellingshausen, Charcot, Cimmerian, Baltica, Moa, plus Intermontane and Lhasa, which are terranes rather than former plates), against the principle that gaps are fixed on Wikidata, not in the build. Wikidata has no class for a plate that no longer exists: *tectonic plate* (Q215680) has four subclasses (*microplate*, *oceanic plate*, and two items with a single sitelink each, nl *overrijdende plaat* and pl *płyta kontynentalna*), none for former plates, and the former plates carry no end date. **Proposal (agreed with Trummler 2026-10-20):** a class item *former tectonic plate* (P279 *tectonic plate*), and P31 on each former plate with a reference; `ancient` then reads `P31 former tectonic plate`, and the European plate joins it without a list. Intermontane and Lhasa would become *terranes* and the Russian *плиты* parts of a platform (class changes), which clears the catch-all of the non-plates. Research: `_data/Prompts/done/Tectonic_Plates_Former_and_Misclassified.md` (Gemini; every source checked on Crossref or the publisher's page). Confirmed: Bellingshausen (Eagles, Gohl and Larter 2004, doi:10.1029/2003GL019127: "the Bellingshausen plate ceased to move independently"), Izanagi (Seton et al. 2015, doi:10.1002/2015GL063057: "complete subduction of the Izanagi plate"), Farallon (USGS *This Dynamic Earth*: "the formerly very large Farallon Plate", consumed down to the Juan de Fuca, Rivera and Cocos remnants), and the Danakil microplate (Eagles, Gloaguen and Ebinger 2002, *Kinematics of the Danakil microplate*). Not confirmed: two of the cited papers don't exist as cited, one doesn't mention its plate, so Phoenix, Kula, Charcot, Moa, the Cimmerian, Baltic and European plates, the terranes (Lhasa, Intermontane), the *плиты* and the Queen Elizabeth Islands Subplate go to a second prompt asking for openly readable sources. **Batches:** part 1 `2026-10-20_plates-former-class-1.txt` creates *former tectonic plate* (aliases *extinct tectonic plate*, *fossil plate*; P279 *tectonic plate*), types the Danakil microplate (it had no P31) and adds Epirus' continent (Countries); part 2, after the import, puts the class on Bellingshausen, Izanagi and Farallon. Part 1 imported and checked (2026-10-20): the class is Q141789550. A second prompt (asking for sources that can be opened) settled three more: *Lhasa Terrane* (an open-access article of 2026 so named, doi:10.3390/min16010063), the *Intermontane terrane* (Lithosphere 2013, *Paleogeography of the Insular and Intermontane terranes reconsidered*, doi:10.1130/L288.1), and the Central India Tectonic Zone as "a major Proterozoic orogenic suture" (doi:10.63335/j.hp.2025.0023). It failed on the rest: its quote for Phoenix ("went extinct ... around 145 Ma") is about an island arc in the cited paper, Moa only appears in a ResearchGate listing, and for Charcot, Cimmerian, Baltic and European plates, the *плиты* (bigenc.ru refuses requests) and the Queen Elizabeth Islands Subplate it found nothing it could open. Research settled there (`_data/Prompts/done/`). **Part 2** `2026-10-20_plates-former-class-2.txt` (9 lines): *former tectonic plate* on Bellingshausen, Izanagi and Farallon; Lhasa and Intermontane from *tectonic plate* to *terrane* (Q509037), the Central India Tectonic Zone to *suture* (Q1509590), each referenced. After it, `ancient` = instances of Q141789550 plus a hand list of seven (Phoenix, Kula, Charcot, Cimmerian, Baltic, Moa, European) until sources turn up; Lhasa and Intermontane leave the plate list altogether.

**Part 2 imported and checked (2026-10-20).** **Former blocks beyond the plates** (Trummler's question: the European and the Siberian plate, merged into Eurasia): Wikidata models the old continental blocks not as plates but as *paleocontinent* (Q2284298), *craton* (Q191110) or *continental fragment* (Q2094611). Paleocontinents with 5+ sitelinks: Pangaea, Gondwana, Laurasia, Rodinia, Pannotia, Laurentia, **Siberia** (Q926051, *paleocontinent* and *craton*), Baltica, Vaalbara, Avalonia, Sahul, Euramerica, Columbia, Kenorland, Ur, Laramidia, Cimmeria, Nena, Atlantica, Arctica, Appalachia, South China, Mauritia, Asiamerica, Balkanatolia, Armorica, Greater Adria, Protolaurasia, Argoland. *Kazakhstania* (Q2283292) is typed only as a geological region. The plate items *Baltic plate* (Q13542800) and *European plate* (Q19848929, nlwiki only) stand beside the paleocontinent Baltica as the plate that carried it. **Reading:** *paleocontinent* is the class the `ancient` question really asks for, and it is clean (no current landmass: Eurasia, the Americas and Afro-Eurasia are typed *supercontinent* only, not *paleocontinent*). Cratons are not former plates; most still exist as cores of today's plates (the Arabian Plate is typed both *tectonic plate* and *craton*). **Decided (Trummler, 2026-10-20):** paleocontinents join the topic as their own `omitted` rule `paleocontinents` beside `ancient`, by class (instances of *paleocontinent*, the supercontinents among them), no hand list. Kazakhstania joins once a source for its class is found.

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
**Fame (decided by Trummler, 2026-10-30):** tiers and the dump floor by size, not sitelinks: area (P2046) for oceans, seas, gulfs, bays and lakes, length (P2043) for rivers. Where the size varies by season or climate (Lake Eyre), the largest recorded value counts, not the latest. Where the latest value is 0, the entry goes to an `omitted` rule `dry-lakes` (and `dry-rivers`, once it is clear how Wikidata models a river that no longer flows). Coverage of P2046 / P2043 on these classes is still to be measured.
**Checked against a reader's list:** the five oceans, the Mediterranean, Black, Caspian, Baltic, North, Red and Caribbean Seas, the Gulf of Mexico and the Sea of Japan are in; the Dead Sea, the Aral Sea, the Sea of Galilee and the Salton Sea are not, rightly: Wikidata types them as lakes (salt, endorheic, the Aral Sea as a *former lake*; Lakes).
**Candidate rules:**
- `historic-oceans` (omitted; approved by Trummler, 2026-10-30): *historic ocean* and *historic superocean*, 20 items from 5 sitelinks: Tethys, Paratethys, Iapetus, Panthalassa, Rheic, Mirovia …, and the *Lunar magma ocean*, which is no ocean of the Earth and could go to the exclusion list. Like `paleocontinents` in Continents.
- **Grouping (decided by Trummler, 2026-10-30):** oceans always in; seas `omittable`; gulfs, bays, fjords and the like each an `omitted` group of their own by their typical size (gulfs one group, bays another). That needs gulfs told apart from bays, which Wikidata's typing does not do on its own (below); open: by class where an item has only one of the two, and by size (a gulf being a large bay) or the name where it has both or the "wrong" one, to be measured.
- `gulfs-and-bays`, as measured: gulfs (Q1322134) and bays (Q39594) sit outside the sea tree, so the base misses the Bay of Bengal (130 sitelinks), the Gulf of Guinea, the Bay of Biscay, the Gulf of Aden, the Gulf of Bothnia; with 30 sitelinks or more there are 35 gulfs and 102 bays (Wikidata types many gulfs as *bay*: the Gulf of Finland, of Oman, of Thailand). The best-known ones (Persian Gulf, Gulf of Mexico, Hudson Bay) carry *sea* or *marginal sea* as well and are in the base.
- `straits` (omitted; approved by Trummler, 2026-10-30): straits (Q37901), 76 with 30 or more sitelinks (Hormuz, Bosporus, Gibraltar, Bering); the English Channel and the Kattegat carry *sea* or *bay* too and show up in the base or the gulf rule.
**Rating:** ➕ (was 🔵): the base is clean and small; what a reader may miss is the gulfs and bays, which their rules add.

## 🔵Islands

*Not analyzed yet.*

## 🔵Mountains

*Not analyzed yet.*

## 🔵Deserts

*Not analyzed yet.*

## 🔵Rivers

*Not analyzed yet.*

## 🔵Lakes

*Not analyzed yet.*

## 🔵Climate Zones

*Not analyzed yet.*

## [to Navigation](#navigation)
