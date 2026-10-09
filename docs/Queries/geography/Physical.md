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
- 🔵[Oceans & Seas](#oceans--seas)
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

**Wikidata batches from this pass** (awaiting import; files in `_data/QuickStatements/`):

| Batch | Edits | What |
| :---- | ----: | :---- |
| `2026-10-09_tectonic-plate-class-misuse.txt` | 5 | remove *microplate* P31 *tectonic plate* (it keeps P279), *Indian Plate* P279 *tectonic plate* (it keeps P31), *intraplate deformation* P31 *tectonic plate* (it keeps *deformation*); Sylhet Trough's P31 *Indian Plate* becomes P706 *Indian Plate*, its reference moved along |
| `2026-10-09_plates-labels-disambiguators.txt` | 4 | the two labels above without the disambiguator; the former ones kept as aliases |
| `2026-10-09_west-siberian-plate-merge.txt` | 1 | merge Q25473407 into Q17115739 |

After the import the catch-all loses *microplate* and *intraplate deformation*, so two `CATCHALL_DROP` entries become unnecessary, and the duplicate West Siberian item goes.  
**Rating:** clean for names, as designed. The class tree around *tectonic plate* had three misuses (batched); the catch-all still holds non-plates that only sourced class changes can clear.

<!-- @agent(#35) from #38 · 2026-10-09 · OPEN
Decided: Continents analysed (this file, Continents). Three batches await Trummler's import: class misuses (microplate, intraplate deformation, Indian Plate as a class), two disambiguated labels, the West Siberian duplicate merged.
Ask: (1) the European plate Q19848929 is an extinct plate, not a duplicate of the Eurasian: move it from CATCHALL_DROP to ANCIENT; (2) structure.tsv maps North Galapagos microplate to Q1200979 (the Galápagos microplate; the right item is Q5361664) and Iranian plate to Q237660 (the plateau; the plate is Q1187892), and leaves Galápagos microplate (Q1200979) and Altiplano plate (Q1200986) without their items; (3) after the import, drop microplate and intraplate deformation from CATCHALL_DROP; (4) for Trummler: the Americas as a tier-0 short-only entry?
Refs: this file, Continents => What the catch-all collects; _scripts/continents.mjs
-->

## 🔵Oceans & Seas

*Not analyzed yet.*

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
