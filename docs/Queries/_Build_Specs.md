# Build specs (for the build PRs: #39 Science, then #4X)

One section per topic released by #38: what the build reads from Wikidata, how it tiers, which rules it carries, and which parts are provisional. The analysis files (`science/*.md` …) keep the reasoning; this file keeps only the result. A topic appears here once it's released. Its section is then the reference for the build, and changes to it are dated.

**Panels (Trummler, 2026-11-26), for every topic:**
- **Two panels, each group in exactly one** (corrected 2026-11-26). The **omission panel** holds only groups unfit to draw *whatever one's expertise*: cryptic names (designations, index names like *NGC 1234*, provisional names) and NSFW entries; entries without a label in the chosen language or with too long a name land there automatically. **Every other group is in the inclusion panel**, however specialised (Chinese constellations, mineral varieties, dwarf-planet moons). `omittable` / `omitted` is a separate axis: only the group's default (in / out), by what a layperson expects. Groups in the omission panel take priority over inclusion groups.
- **The base is a group too** (implicit, usually `omittable`): with it unticked, the list is only what the other inclusion groups add (only the named element groups, only the minerals of one chemical class).
- **Filters** (radio buttons) act on top of the groups, not as one more union: *Systems / Single stars / Both*, *Regular / Irregular / Both*.
- Entries without a label in the chosen language, or with too long a name, go to the omission panel automatically: no rule needed.
- **Labels: `mul` as a checked fallback (Trummler, 2026-11-26; narrowed 2026-11-27).** Where an item has no label in the chosen language but a `mul` label, the `mul` label serves **only if that language's Wikipedia article on the item has exactly that title** (its disambiguator removed: "Caribou (Maine)", "Caribou, Maine" => "Caribou"). No article in the language: no fallback, the entry goes to the omission panel as unlabelled. Why this test and not a cross-language one (`_data/science/mul-fallback-test.mjs`, samples of 400, 2026-11-27): "the same in every Latin-script language" almost never holds (Latvian *Čārlzs Darvins*, Czech *Kamala Harrisová*, Hungarian *Fukuda Jaszuo*), and a test on label and description counts lets wrong `mul` labels through (`mul` *Carl Linnaeus* where de and fr say *Carl von Linné*; `mul` *Biešankovičy*, a Belarusian romanization, where en says *Beshankovichy*). The per-language title test accepts 96 % (en) / 88 % (de) of people and 65 % of places and rejects exactly those. Non-Latin scripts never fall back to `mul`. Designation-only labels (NGC 3, HD 93129) still go to the omission panel through their index-name groups.

**Provisional parts** are marked **TODO** here; the build marks the same spot with a `TODO` comment that names this file and the open Wikidata item, so the stopgap is easy to find and replace.

## Contents

**Final** = complete on Wikidata as far as sources allow, tiers and every group decided; the build can translate it without waiting on #38. Later Wikidata edits change data, not the rules. Not final = the reason is given; build those last.

**Final (2026-11-27):**
- [Chemical Elements: inclusion groups](#chemical-elements-inclusion-groups) (an addition to the built topic; category file sourced from Vernon 2013 and the RSC)
- [Periodic Groups](#periodic-groups) (tiers confirmed by Trummler 2026-11-26, labels fixed)
- [Substance Classes](#substance-classes) (in #39's PR since 2026-11-23; no element groups since 2026-11-26)
- [Moons](#moons) (regular / irregular basis complete since 2026-11-26)
- [Stars](#stars) (tiers and *Always include* matrix decided; radius / mass / luminosity gaps stay where no citable catalogue covers the famous giants)
- [Minerals](#minerals) (base widened, default cut at 40 sitelinks; no silicate subgroups)
- [Organs & Organelles](#organs--organelles) (after the anatomy batches)
- [Bones](#bones) (renamed from Human Bones)
- [SI Units](#si-units) (collections in three sections; astronomical units with the time units, Trummler 2026-11-27)
- [Constellations](#constellations) (Western and Chinese topics since 2026-11-26; Ptolemy's groups from a sourced file, final as such: Trummler, 2026-11-27)

**Not final yet:** none (2026-11-27).

## Chemical Elements: inclusion groups

**Final:** 2026-11-27. **Decided:** Trummler, 2026-11-26 (plan change the same day: the groups' names became a topic of their own, [Periodic Groups](#periodic-groups)). **Analysis:** `science/Chemistry.md#selection-options-2026-11-25-trummlers-list`. The topic itself is built (#35); this adds groups.

| Group | Default | Panel | Read from |
| --- | --- | --- | --- |
| `chemical-elements` (the 118; implicit base) | `omittable` | inclusion | as built |
| `alkali-metals` | `omittable` | inclusion | group 1 without hydrogen (atomic number P1086) |
| `alkaline-earth-metals` | `omittable` | inclusion | group 2 |
| `transition-metals`, **expandable** into `lanthanides`, `actinides` | `omittable` | inclusion | groups 3–12; 57–71; 89–103 |
| `metals` | `omittable` | inclusion | `_data/science/element-categories.json` |
| `metalloids` | `omittable` | inclusion | the same file |
| `nonmetals` | `omittable` | inclusion | the same file |
| `halogens` | `omittable` | inclusion | group 17 (tennessine included: IUPAC gave it the halogen ending) |
| `noble-gases` | `omittable` | inclusion | group 18 (oganesson included) |
| `synthetic-elements` (only made artificially) | `omitted` | **omission** (Trummler) | atomic number 95–118 |

- **Group, period and block** follow from the atomic number: no statement needed (the build computes them already). Wikidata agrees for alkali, alkaline earth, transition metals, lanthanides, actinides, halogens and noble gases (all members linked, checked 2026-11-26, `_data/science/element-categories.mjs`).
- **Metals / metalloids / nonmetals** (`_data/science/element-categories.json`, sourced 2026-11-26): Wikidata is thin (metal 6 elements, nonmetal 10, metalloid 8), so the build reads the file. Metalloids from Vernon's survey of 194 lists (*J. Chem. Educ.* 2013): from 20 % of the lists (B, Si, Ge, As, Sb, Te at 86–100 %; Po 49, At 40, Se 23 %); below 50 % the element keeps its other class too (Po metal + metalloid; At, Se nonmetal + metalloid); C and Al (9 %) not. Elements 104–118 metal, as the RSC periodic table describes each (tennessine and oganesson too). Hydrogen and the noble gases nonmetals. Counts: metal 94, nonmetal 18, metalloid 9.
- **Synthetic:** "only artificially" = not found in nature: 95–118. Technetium, promethium, neptunium and plutonium occur in traces, so they are not. Wikidata's *synthetic element* class (Q755992) disagrees (it has astatine, misses americium): not read.

## Periodic Groups

**Final:** 2026-11-27 (tiers confirmed by Trummler 2026-11-26). A topic of its own (Trummler, 2026-11-26), the groups' names as entries ("halogens", "noble gases", "Titangruppe"). **Base:** a hand-curated list, `_data/science/periodic-groups.json` (Q-ids and tiers), as `sovereign-territories.json` does: Wikidata has no class that holds exactly these, and sitelinks rank them poorly (the numbered subgroups outrank heavy metals). Names from Wikidata.

| Tier | What | Count |
| ---: | --- | ---: |
| 1 | what every school names: metals, nonmetals, metalloids, alkali metals, alkaline earth metals, halogens, noble gases, transition metals, noble metals, heavy metals | 10 |
| 2 | the other main groups (boron, carbon, nitrogen groups, chalcogens), the best-known subgroup (copper group: coinage metals), lanthanides, actinides, rare earths | 8 |
| 3 | the other subgroups (groups 3–10, 12: Scandiumgruppe … Zinkgruppe) | 9 |
| 4 | further groups: platinum group, precious, light, refractory, base metals, post-transition metals, transuranium, transactinide, synthetic, radioactive elements | 10 |
| 5 | specialist classifications: Goldschmidt's lithophile, siderophile, chalcophile, atmophile elements; minor actinides | 5 |

- **Tier 5, evaluated:** it carries, as a set of real but specialist classes (geochemistry, nuclear fuel); thin (3–8 sitelinks, no de labels yet), so `omitted` by default would suit it. A sixth tier has nothing left to hold.
- **Left out:** periods and blocks (structure, not names); group 1 (the alkali metals stand for it); groups 2, 17, 18 are the same items as alkaline earth metals, halogens, noble gases; *coinage metals* (Q4301709, the same set as group 11); the hypothetical superactinides; *diatomic* / *polyatomic nonmetal* (categories of one encyclopedia).
- **Labels:** en labels of the numbered subgroups are *group 3* … *group 12* (no en names in use); de has names since `2026-11-26_element-groups-de-labels.txt`. *noble metal* and *precious metal* are both *Edelmetall(e)* in German: two near-identical de entries; tier 4's *precious metal* is the one to drop in de if the build dedups.

## Substance Classes

**Final:** 2026-11-27. **Released:** 2026-11-23 (taken into #39's PR then; this section collects it, 2026-11-26). **Analysis:** `science/Chemistry.md#substance-classes`.

- **Base:** the union of *structural class of chemical entities* (Q47154513), *imprecise class of chemical entities* (Q74892521), *class of chemical entities with similar applications or functions* (Q56256173), each item once; from 5 sitelinks: 1,068.
- **Tiers:** sitelinks 120 / 80 / 40 / 20 / 10 / 5.
- **Exclusion:** *hazardous substances* (Q757138): a legal category.

| Group | Default | Panel | Read from |
| --- | --- | --- | --- |
| `functional-classes` (antibiotic, toxin, pheromone, antioxidant: 127) | `omittable` | inclusion | only in Q56256173 |
| super- and subgroups (haloalkanes under halogenated hydrocarbons, carboxylic acids under organic acids) | `omittable` | inclusion | the class tree (P279), grouped by the top classes the build meets |

- **Changed 2026-11-26:** the rule `element-groups` (halogens, noble gases as substance classes) is dropped: the element groups are a topic of their own now, [Periodic Groups](#periodic-groups).

## Constellations

**Final:** 2026-11-27. **Released:** 2026-11-26. **Analysis:** `science/Astronomy.md#constellations`.

### Base

- **Western:** P31 *constellation* (Q8928) or *zodiacal constellation* (Q4193029), from 5 sitelinks: exactly the IAU's 88 (all also carry *IAU constellation*, Q131403485, read **`p:P31/ps:P31`**: on Aries it sits at normal rank beside a preferred P31, so `wdt:P31` shows 87). The seven items below 5 sitelinks are strays (Sah, Yakana): the floor is what separates them.
- **Former:** P31 *former constellation* (Q1620914), from 5 sitelinks (30 items; Argo Navis, Q9258, among them).
- **Chinese:** the members (P527) of *Four Symbols* (Q1073260), *Twenty-Eight Mansions* (Q1378760), *Three Enclosures* (Q1131585) and of the three enclosures: *Purple Forbidden* (Q1145852, 39 asterisms), *Heavenly Market* (Q1145862, 19), *Supreme Palace* (Q1145944, 20; five of its P527 pointed to namesakes, fixed by `2026-11-26_chinese-asterisms-namesakes.txt`). Members read with class *Chinese constellation* (Q1074076); *Big Dipper* (Q10460) is the item for 北斗 too and enters under its en name.
- **Not in it:** *gamma-ray constellation* (21 items), *astrological sign* (Q40540: the signs are items of their own).

### Tiers (Trummler, 2026-11-24): each Western group paired with a Chinese one

| Tier | Western | Read from | Chinese | Read from |
| ---: | --- | --- | --- | --- |
| 1 | the 12 zodiac constellations | P31 Q4193029, **without Ophiuchus** (the class holds 13) | the Four Symbols (4) | P527 of Q1073260 |
| 2 | Ptolemy's northern (21) | `_data/science/ptolemaic-groups.json`, group `northern` | the Twenty-Eight Mansions (28) | P527 of Q1378760 |
| 3 | Ptolemy's southern (15, Argo Navis included) | the same file, group `southern` | the Three Enclosures (3) | P527 of Q1131585 |
| 4 | early modern (17) | the other 41 of the 88 whose earliest *time of discovery* (P575) is before 1650 | the Purple Forbidden enclosure's asterisms (39) | P527 of Q1145852 |
| 5 | later modern (24) | the other 41 whose earliest P575 is 1650 or later | the Heavenly Market enclosure's asterisms (19) | P527 of Q1145862 |
| 6 | former (29 besides Argo Navis) | P31 Q1620914, from 5 sitelinks, without the Ptolemaic Argo Navis | the Supreme Palace enclosure's asterisms (20) | P527 of Q1145944 |

- Counts check: 12 + 21 + 14 (+ Argo Navis) + 17 + 24 = 88 + Argo Navis. Ptolemy's 48 are the file's three groups (the zodiacal group equals tier 1).
- Early vs later modern: Plancius / Keyser–de Houtman 1597–1612, Hevelius 1683–1687, Lacaille 1750–1763; Musca has 1598 (tier 4). Checked on Wikidata 2026-11-26: all 41 carry P575, 17 before 1650 and 24 after.
- **Tiers 2 and 3 read a file, final as such (Trummler, 2026-11-27):** Wikidata doesn't mark Ptolemy's groups. `ptolemaic-groups.json` holds the 48 by Q-id in the Almagest's order (Toomer's translation, pp. 341–399). It is the same list the class chain *Ptolemaic constellation* => northern / zodiacal / southern will carry once WikiProject Astronomy has answered (`_data/Wikidata/Constellation_Classes.md`). Should those classes ever exist, the build can switch to them; nothing waits on it. The file is exact, not an approximation: declination can't reproduce the Almagest's groups (it counts Orion, Cetus, Eridanus as southern though they straddle the equator).

### Two topics (Trummler, 2026-11-26, with #39)

*Constellations* is a category with one topic per culture: **Western Constellations** (the Western column of the tier table) and **Chinese Constellations** (the Chinese column). Further cultures can join as topics of their own. The tiers stay as in the table, each topic reading its own column; a topic's tiers are **not** shared with the category node (the cultures' tiers match in tendency only).

- **Western:** tiers 1–6; tier 6 is the former constellations, so leaving out the last tier is the way to leave them out (no group needed). Argo Navis, though former, sits in tier 3 (Ptolemy's southern).
- **Chinese:** tiers 1–6 of the Chinese column.
- **No inclusion groups** any more: *Western*, *Chinese* and *former* were the three, and the split makes them unnecessary.

### Inclusion option "South > North", per topic

Each topic has its own; the category node may inherit it (Trummler: yes for this option, no for the fame ruler).

- **Western:** swaps tiers 2 and 3 (Ptolemy's southern moves up). Where a constellation lies: the Almagest's own north / south for the Ptolemaic tiers (the file above); the IAU boundaries' declination range, `_data/science/constellation-dec-ranges.json` (VizieR VI/49, J2000: 28 wholly north, 45 wholly south, 15 straddling), for anything beyond them.
- **Chinese (agreed by Trummler, 2026-11-26):** the Chinese tiers have no southern group: the Three Enclosures are circumpolar, the mansions run along the ecliptic, and the 23 southern asterisms (added in the late Ming, P361 their region, 20 of 23) are outside the tiers now. The option brings the southern asterisms in at tier 4 and moves the enclosures' asterisms down by one tier.

### Labels

- zh-Hant from the Hong Kong Space Museum and Taipei Astronomical Museum (`2026-11-25_constellations-zh-hant.txt`); the Chinese asterisms' zh-Hant from the Hong Kong Space Museum's glossary (`2026-11-25_chinese-asterisms-zh-hant.txt`).
- Tagalog: 73 of 88 have no tl label and no source: they stay out of tl, as elsewhere.
- `mul`: the checked fallback of the general rules above (replacing the topic's earlier "no fallback", 2026-11-24).

### Beyond the tiers (not in the topic now)

- The mansions' further asterisms point to their mansion by P361 (138 of 187); the southern asterisms to their region (20 of 23). A later extension could hang them under the mansion's tier; not part of this release.

## Moons

**Released:** 2026-11-26. **Final:** 2026-11-27. **Analysis:** `science/Astronomy.md#moons`.

### Base

- Under *natural satellite* (Q2537, P31/P279*), without *hypothetical astronomical object* (that also drops the Black Knight satellite, whose class *claimed moons of Earth* sits under *natural satellite*): 453 items, 178 named moons of planets.
- **Exclusions:** the temporary satellites 2024 PT5 and 2020 CD3, the exomoons, *Taiyin*, *Veronica My Daughter*.

### Tiers

Radius (P2120, else half of P2386), the asteroid steps, no inclusion limit: from 1,000 km (7: Ganymede … Triton), 300 km (8), 100 km (7), 30 km (24), 10 km (27), 3 km (25), 1 km (44), the rest (smaller or no size). Every named moon of a planet has a size (checked 2026-11-25).

### Rules (Trummler, 2026-11-26)

| Group | Default | Panel | Read from |
| --- | --- | --- | --- |
| one per planet with moons: `earth-moon`, `mars-moons`, `jupiter-moons`, `saturn-moons`, `uranus-moons`, `neptune-moons` | `omittable` | inclusion | P397 the planet |
| *Always include Mars' moons* (an option: Phobos and Deimos in even when the tier cut would drop them) | on | inclusion | class *moon of Mars* (Q177268), P397 Mars |
| `dwarf-planet-moons` (Charon, Nix, Dysnomia) | `omitted` | inclusion | P397 on a dwarf planet |
| `minor-planet-moons` (Dactyl, Dimorphos) | `omitted` | inclusion | P397 on another minor planet |
| `provisional-names` (cryptic: *S/2004 S 12*) | `omitted` | **omission** | see below |
| `propeller-moons` | `omitted` | inclusion | 12 (Earhart, Blériot) |

- **Filter** *Regular / Irregular / Both* (default Both), on top of the groups. Not redundant with the size tiers: the irregular moons are small, but so are many regular ones (the inner moons of Jupiter and Uranus), so the filter is the only way to a list of irregular moons alone. **Basis (2026-11-26):** Scott S. Sheppard's moon pages (Carnegie Science) class every moon they list under *Regular Satellites* / *Irregular* or a named Jupiter group: `2026-11-26_moons-regular-irregular.txt` and `-2.txt` (75 P31, 66 P361 dynamical groups) and `2026-11-26_moons-parent-body.txt` (13 moons lacked P397). With them, Saturn's 2019 discoveries are classed too (most had it; 3 by `2026-11-26_saturn-moons-2019-irregular.txt`, from Sheppard's announcement: outer moons of the Inuit, Norse and Gallic groups); to be rechecked once imported that no named moon is left; the gaps left are unnamed moons, which `provisional-names` omits anyway. So the filter can be built; it reads P31 *regular moon* (Q1086783) / *irregular moon* (Q1632885), all ranks.
- `provisional-names` (shared with Planets & Asteroids and Comets): the build strips numbers and brackets and matches the rest by glob (`S/*`, `Jupiter [IVXLC]*` and the other giants, `[12][0-9][0-9][0-9] [A-Z][A-Z]*`, `[CPDX]/[0-9]*`, plus `[Mm]oon of *`), cross-checked against P490. A leading number is stripped only where no designation follows (*2020 CD3* stays whole); *152830 I Selam* needs the roman numeral stripped too.

## Stars

**Final:** 2026-11-27. **Released:** 2026-11-26 (`2026-11-26_star-names-iau-2026.txt` imported). **Analysis:** `science/Astronomy.md#stars`.

### Base

- P31 under *star* (Q523, P279*) or one of the six star-system classes (*double star* Q13890, *binary star* Q50053, *multiple star* Q878367, *triple star system* Q2088753, *spectroscopic binary* Q1993624, *star system* Q595871), from 20 sitelinks: 626. Read on QLever (`_data/science/stars-base.mjs`): *star* has millions of instances and the query service times out; walking P279* under *binary star* is too heavy too, so take the six classes by name.
- **Exclusions:** Sagittarius A*, the Star of Bethlehem, Nemesis (*hypothetical star*), the Trapezium Cluster (open cluster), NGC 1420 (an asterism typed *star system*), NGC 7287 (*geographical object*), GW170817.

### Tiers

Apparent magnitude (P1215, V band; the lowest value where several), on 482 of the 597 stars (626 less the rule groups and exclusions); systems whose magnitude sits on the components (Aldebaran system, Fomalhaut, Regulus, Mizar, Albireo: 13) read it from the brightest component (P527). **Steps decided (Trummler, 2026-11-26)**, below the table; the counts come from the table (`_data/science/stars-mag-steps.mjs`, 2026-11-26; without the 134 NGC / IC double stars, which their omission group takes).

| Magnitude from | Stars | Total | Brightest by sitelinks |
| ---: | ---: | ---: | --- |
| below −1 | 2 | 2 | Sun, Sirius |
| −1.0 | 1 | 3 | Canopus |
| −0.5 | 2 | 5 | Alpha Centauri, Arcturus |
| 0.0 | 6 | 11 | Vega, Capella, Rigel, Betelgeuse |
| 0.5 | 5 | 16 | Aldebaran, Altair, Spica |
| 1.0 | 6 | 22 | Fomalhaut, Deneb, Pollux, Regulus |
| 1.5 | 24 | 46 | Castor, Bellatrix, Alnilam, Alnitak |
| 2.0 | 46 | 92 | Polaris, Algol, Mizar, Alpha Andromedae |
| 2.5 | 64 | 156 | Alcyone, Cor Caroli |
| 3.0 | 42 | 198 | Albireo, Alpha Herculis |
| 3.5 | 53 | 251 | Tau Ceti, Thuban, Delta Cephei |
| 4.0 | 35 | 286 | Mu Cephei, Alcor, Merope |
| 4.5 | 16 | 302 | VV Cephei, Epsilon Indi |
| 5.0 | 15 | 317 | 51 Pegasi, 61 Cygni |
| 5.5 | 14 | 331 | 55 Cancri, Zeta Reticuli |
| 6.0–6.5 | 14 | 345 | Eta Carinae, Mira |
| 7.0–9.5 | 23 | 368 | VY Canis Majoris, Barnard's Star |
| 10.0 and fainter | 77 | 445 | Proxima Centauri, UY Scuti, Ross 128 |
| no magnitude | 18 | 463 | Pistol Star, RR Lyrae, V838 Monocerotis |

**Tiers (Trummler, 2026-11-26):**

| Tier | Magnitude | Stars | Shown |
| ---: | --- | ---: | --- |
| 1 | brighter than 1.0 (with the Sun) | 16 | by default |
| 2 | 1.0–1.5 | 6 | by default |
| 3 | 1.5–2.0 | 24 | by default |
| 4 | 2.0–2.5 | 46 | by default |
| 5 | 2.5–3.0 | 64 | by default (156 in all) |
| 6 | 3.0–3.5 | 42 | behind **[ ] allow stars fainter than magnitude 3.0** |
| 7 | 3.5–4.0 | 53 | the same |
| 8 | 4.0–5.0 | 51 | the same |
| 9 | 5.0–6.0 | 29 | the same |
| 10 | fainter than 6.0, or no magnitude | 132 | the same (Proxima Centauri, UY Scuti: the *Always include* matrix is their usual way in) |

**Always include (inclusion matrix, Trummler's option c):** one row per factor (four), the columns *Top 5 / 10 / 20 / 35 / 50*; one choice per row (none by default), like the sovereignty matrix but independent between rows. An entry ticked in any row is in, whatever its tier. Coverage on the 463 (2026-11-26, `_data/science/stars-factors.mjs`; systems read their components):

| Factor | Read from | Has it | Top of the list |
| --- | --- | ---: | --- |
| closest | distance (P2583; ly, pc, kpc, au normalised), else parallax (P2214: 1000 / mas = pc) | 440 | Sun, Proxima Centauri, Alpha Centauri, Barnard's Star, Wolf 359 |
| **brightest** (tooltip / `long`: *intrinsically brightest*; one row for absolute magnitude and luminosity, decided on Trummler's question 2026-11-26) | luminosity (P2060, solar units), else from the absolute magnitude (P1457, else computed from P1215 and the distance): L = 10^(0.4 × (4.83 − M)) | 265 + about 180 by absolute magnitude | R136a1, WR 102ka, HD 93129, Alnilam, Epsilon Aurigae, UY Scuti, Eta Carinae, Rigel |
| largest | radius (P2120; solar radii, Jupiter radii normalised) | 326 | NML Cygni, Stephenson 2 DFK 1, WOH G64, VY Canis Majoris |
| most massive | mass (P2067; solar, Jupiter, Earth masses normalised) | 275 | R136a1, LBV 1806-20, Cygnus OB2 #12, Zeta Puppis |

- **Why four, not five:** *apparent* magnitude (P1215) is how bright a star looks from Earth (the tiers); *absolute* magnitude (P1457) is how bright it would look in visible light from 10 parsecs; *luminosity* (P2060) is its total output over all wavelengths. The last two measure the same thing, the star's own brightness, and differ only by the light outside the visible (hot stars shine mostly in ultraviolet): one row.
- Columns per row by coverage (final): all five for *closest*, up to *Top 35* for the other rows. Gaps filled later on Wikidata only change which stars a row reaches, not the rule.
- **Data completion (Trummler: much potential):** 23 stars lack both distance and parallax (mostly systems whose components have it; 1 filled from SIMBAD, `2026-11-26_stars-parallax-simbad.txt`), 139 an absolute magnitude (the build can compute it where P1215 and P2583 exist), 137 a radius, 188 a mass, 198 a luminosity, 18 a magnitude. Planned as gap batches from a citable catalogue per property (Gaia DR3 astrophysical parameters, SIMBAD); one research prompt for the bright stars Gaia can't measure.
- **Labels:** 39 of the base have no en label, only `mul` (most are designations, rightly in the omission panel). Proper names among them (Antares, Adhara, Alnair, Cursa, Pherkad, Aladfar, Albaldah, Epsilon Eridani) get en / de labels: `2026-11-26_star-names-en-labels.txt`.

### Rules

- `supernovae` (`omitted`, inclusion panel): *supernova* sits under *star* on Wikidata (P279), so SN 1006, SN 1181, the *type Ib and Ic* classes and kilonovae come in by class.
- `pulsars` (`omitted`, inclusion panel): 5 from 20 sitelinks.
- Index-name group for NGC / IC double stars (**omission panel**: cryptic names) (94 without magnitude, mostly bot sitelinks), the same pattern as for deep-sky objects.

### Groups (Trummler, 2026-11-26)

| Group | Default | Panel | Read from |
| --- | --- | --- | --- |
| `navigational-stars` | `omittable` | inclusion | P31 *navigational star* (Q1547772), read **`p:P31/ps:P31`** (`wdt:P31` hides 13: normal rank beside a preferred P31) |
| `iau-named-stars` | `omittable` | inclusion | P2561 with qualifier *named by* (P3938) IAU (Q6867), **on the item or on one of its components** (P527) |
| `unnamed-stars` (no IAU name) | `omitted` | inclusion | the base less the two above |

- **Filter** *Systems / Single stars / Both* (default Both): a system is an item with one of the six system classes above (190 of 463).
- **Components:** the IAU names a star, so a system item often has its name only on a component: Sirius (Sirius A), Alpha Centauri (Rigil Kentaurus), Fomalhaut, Regulus, Shaula and 11 more. Read on the item alone, the group would lose them; with the components, 259 of the 463 are IAU-named (2026-11-26). The **Sun** has no IAU name: a fixed entry of tier 1.
- Default list by step (IAU-named or navigational): below 1.5: 20 of 22; 1.5–2.5: 65 of 70; 2.5–3.5: 84 of 106; 3.5–4.5: 65 of 88; 4.5–6: 16 of 45; fainter: 9 of 132.
- Spectral classes: not a group (Trummler, 2026-11-26).

## Minerals

**Released:** 2026-11-26. **Final:** 2026-11-27. **Analysis:** `science/Geology.md#minerals`.

### Base

- P31 *mineral species* (Q12089225), *mineral group* (Q1936581), *mineral variety* (Q429795), and (added 2026-11-26) *mineral supergroup* (Q3977918: mica 82, tourmalines 66, amphibole 56), *mineral series* (Q3965281: 17, biotite 53, hornblende, monazite, lepidolite), *mineral subclass* (Q3965272: zeolite 57); from 20 sitelinks: about 380. Without the three new classes the base lost mica and tourmaline, names everyone knows. Below 20, names only mineralogists know. Rocks (granite, obsidian) and organic gems (amber, pearl) are rightly out.
- **Fixed entries** (in no mineral class): jade (74) and asbestos (85, a trade name for six fibrous silicates): with the varieties and the groups respectively.
- **Native elements:** the fame sits on the element (gold 277), the mineral items are small (native gold 19, native copper 28) and fall below the floor or near it. Not patched: the element is in Chemical Elements.

### Tiers

Sitelinks, ranked together whatever the class (Trummler, 2026-11-26). Checked: the order follows fame well at the top (diamond, emerald, quartz, ruby, sapphire, graphite, amethyst, gypsum, topaz) and fades into collectors' names around 40 (covellite, boulangerite, acanthite at 39). So finer steps than Substance Classes' 120 / 80 / 40 / 20, which would put 96 entries into one tier:

| Tier | Sitelinks | Entries (about) | Shown | Examples |
| ---: | --- | ---: | --- | --- |
| 1 | 100+ | 5 | by default | diamond, emerald, quartz, ruby, sapphire |
| 2 | 80–99 | 10 | by default | graphite, amethyst, gypsum, topaz, turquoise, asbestos, mica |
| 3 | 60–79 | 31 | by default | feldspar, calcite, pyrite, opal, malachite, jade, tourmalines |
| 4 | 50–59 | 23 | by default | sphalerite, muscovite, rutile, zeolite, biotite (about 69 so far) |
| 5 | 40–49 | 47 | by default (about 116 in all) | almandine, chromite, citrine, moonstone, peridot, jadeite |
| 6 | 30–39 | 88 | behind **[ ] allow minerals below 40 sitelinks** | tanzanite, sodalite, chrysotile, rose quartz |
| 7 | 20–29 | about 165 | the same | zincite, benitoite, schorl |

### Groups (Trummler, 2026-11-26; evaluated here)

| Group | Default | Panel | Read from (at floor 20, 2026-11-26) |
| --- | --- | --- | --- |
| `mineral-species` (the implicit base) | `omittable` | inclusion | P31 Q12089225: 312 |
| `mineral-groups` | `omittable` | inclusion | P31 *group* Q1936581 (14: feldspar, garnet, apatite, olivine, pyroxene), *supergroup* Q3977918 (3: mica, amphibole, tourmalines), *series* Q3965281 (17: biotite, hornblende, monazite), *subclass* Q3965272 (zeolite), plus asbestos |
| `quartz-varieties` | `omittable` | inclusion | varieties whose P279 / P361 chain reaches quartz: 12 (amethyst, agate, chalcedony, onyx, jasper, carnelian, citrine, rose quartz) |
| `feldspar-varieties` | `omittable` | inclusion | reaching feldspar (plagioclase, anorthite, albite, microcline): 6 (labradorite, moonstone, amazonite, oligoclase, andesine, bytownite) |
| `beryl-varieties` | `omittable` | inclusion | reaching beryl: 3 (emerald, aquamarine, morganite) |
| `other-varieties` | `omittable` | inclusion | the other varieties: 12 (ruby, sapphire, peridot, alexandrite, tanzanite, alabaster, selenite, electrum, Iceland spar, wolframite, argentite, kamacite), plus **jade** |

- All in the inclusion panel (none is unfit to draw: Trummler, 2026-11-26). A variety gets a group of its own from **3 varieties of one species**; the rest go to `other-varieties`. Read from the chain, not a fixed list (chalcedony is a variety of quartz, onyx of chalcedony: both count for quartz).
- **All `omittable`: nothing against it.** Every group holds names a layperson knows (amethyst, emerald, moonstone, ruby), so none should be out by default; the floor of 20 already keeps out the names only mineralogists know. The weakest are oligoclase, andesine, bytownite (plagioclase compositions, no IMA species) and the discredited argentite, but the tiers rank them low. An `omitted` group would only pay for a set that is mostly obscure, and there is none.
- **Jade** (74 sitelinks; a trade name for jadeite and nephrite, in none of the three classes): a fixed entry in `other-varieties`, as it behaves like one: a gem name for minerals (decided here, 2026-11-26).

### Chemical classes (Trummler, 2026-11-26: the most common system)

`omitted`, inclusion panel: with the base unticked, a list of one class. The **Nickel–Strunz classes**, the system the IMA and the mineral databases use and the one Wikidata's class items follow (*carbonate and nitrate class*, *sulfosalt subclass*, *hydroxide auxiliary subclass* are Strunz's names). Dana's classes are nearly the same at the top level; they differ further down, so the top level fits both. Read by P279 / P361 (transitive) to the class item; counts at floor 20 (some minerals reach two):

| Group | Class items | Entries |
| --- | --- | ---: |
| `native-elements` | Q723127 | 9 |
| `sulfides` (with sulfosalts) | Q927407, Q416949 | 63 |
| `halides` | Q729283 | 13 |
| `oxides` (with hydroxides) | Q945532, Q13379369 | 46 |
| `carbonates` (with nitrates) | Q1073138 | 26 |
| `borates` | Q3447203, Q421726 | 6 |
| `sulfates` | Q764802 | 28 |
| `phosphates` (with arsenates, vanadates) | Q3092395, Q4796437, Q76388571 | 32 |
| `silicates` | Q178977 | 146 |

- The silicate subclasses (tecto 44, neso 26, nesosilicate-like 33, cyclo 32, ino 23, phyllo 23, soro 12) are **not** groups (decided 2026-11-27): Strunz's top level is what a reader knows.
- Info field, not a tier: Mohs hardness (P1088) on 935 species.

## SI Units

**Final:** 2026-11-27. **Released:** 2026-11-26 (`2026-11-26_deca-si-prefix.txt` imported; the prefix rule reads the class). **Analysis:** `science/Physics.md#si-units`.

### Base and tiers

| Tier | What | Read from |
| ---: | --- | --- |
| 1 | the 7 base units | P31 *SI base unit* (Q223662) |
| 2 | the 22 units with a special name | P31 *SI unit with special name* (Q68618328): exactly 22 since `si-special-name-remove` |
| 3+ | the rest, by rule | below |

### Rules (decided)

- `si-accepted` (`omittable`): *SI-accepted non-SI unit* (Q106839753), from 20 sitelinks (day, hour, minute, litre, hectare, tonne).
- `si-derived` (`omitted`): the other *SI derived units* (square kilometre, kilometre, gram, cubic metre).
- `si-prefixes` (`omitted`): P31 *SI prefix* (Q131299), best rank: the 24 from quetta to quecto. *semi-*, *demi-* and the single character ㍲ are exclusions (*null morpheme* has the class only deprecated, so `wdt:P31` already drops it).

### Collections (Trummler, 2026-11-26)

Each collection of units is an inclusion group: SI `omittable`, all others `omitted`. The inclusion panel shows them in **three sections**, in this order. Combined groups get an **expand** button (an idea for the UI, not required): unfolded, their parts appear indented and can be ticked one by one. Counts 2026-11-26 (`_data/science/unit-collections-floor.mjs`): units linked to the collection by P361 (system) or P31 (class); all / from 5 / from 10 sitelinks.

**1. International sets**

| Group | Read from | Units | Status |
| --- | --- | ---: | --- |
| `si-units` (implicit base: tiers 1–2 and the SI rules above) | the classes above | | `omittable` |
| `information-units` (bit, byte, kibibyte) | P31 *unit of information* (Q3550873) | 64 / 49 / 44 | basis exists (a class) |
| `astronomical-units` (astronomical unit, parsec, solar mass / radius / luminosity, Jupiter and Earth mass, day; **with the time units**: year, month, week, century, millennium, tropical / sidereal / Julian year, lunar month, sol, galactic year, Metonic cycle, olympiad …) | P361 *astronomical system of units* (Q751930), **plus** P31 *unit of time* (Q1790144) from 20 sitelinks without the SI ones (base, special name, derived, SI-accepted), geochronological ranks (Q142082299: period, era, epoch), notations and techniques (Earthly Branches, Sexagenary cycle), temporal entities (academic term) and Planck units; exclusion: *svedberg* (Q1472674, a sedimentation unit) | 9 + 20 | batch `2026-11-27_astronomical-units-system.txt` (IAU 2012 B2, 2015 B3, IERS TN 21); light-year and Julian year left out (only a FITS table citing the IAU Style Manual opened) |
| `cgs-units` (erg, dyne, gauss, poise), expandable: CGS, Gaussian, electrostatic, electromagnetic | P361 Q26240, Q3234036, Q1370826, Q27666180 | 30 / 23 / 17 | basis exists |
| `natural-units` (Planck length, Planck time, atomic units) | P361 *Planck units* (Q468999), *atomic units* (Q757568) | 26 / 19 / 18 | basis exists |
| `technical-units` (kilopond, technical atmosphere) | P361 *gravitational metric system* (Q1213508) | 10 / 5 / 5 | basis exists |
| `typographic-units` (point, pica) | P31 *typographic unit* (Q1869496) | 7 / 5 / 3 | basis exists |

**2. Regional collections**, by relevance

| Group | Read from | Units | Status |
| --- | --- | ---: | --- |
| `us-customary-units` | P361 Q1116609 | 43 / 29 / 27 | solid (NIST Handbook 44) |
| `imperial-units` | P361 Q641227 | 40 / 28 / 24 | solid (Weights and Measures Act 1985) |
| `chinese-units` | P31 Q435922; Hong Kong P361 Q5895496 | 17 / 9 / 8 | solid (1929 Act, Art. 6) |
| `japanese-units` (shaku, ri, tsubo, koku) | P361 Q1029751 | 20 / 8 / 4 | basis exists |
| `russian-units` (verst, arshin, pood) | P361 Q435964 | 60 / 32 / 20 | basis exists; no full source for a check (research 2026-11-27: the 1835 decree and 1899 Regulations are only catalogued), read as linked |
| `other-regional-units`, expandable: Ottoman (Q435966), Spanish (Q1414173), Korean (Q30117850), Lithuanian (Q4420945), Dutch (Q2555843) | P361 of each | about 40 / 6 / 3 | basis exists, thin |

**3. Set apart for other reasons**

| Group | Read from | Units | Status |
| --- | --- | ---: | --- |
| `ancient-units`, expandable: Roman (Q1161819), Greek (Q607056), Mesopotamian (Q3631579), Egyptian (Q435967), Biblical (Q794587) | P361 of each | 73 / 19 / 10 | basis exists |
| `humorous-units` (beard-second, Sagan, donkey power) | P31 *humorous units of measurement* (Q131302471) | 8 / 2 / 1 | basis exists, small |

- **Floor (decided here, 2026-11-26): none for the collections**, except `information-units` from 5. The sitelinks mislead here: the variants a collection needs have few (*gallon (US)*, *fluid ounce*, *market catty*, *beard-second*: 1–2 each), as the general item (*gallon*) holds the articles; and what the collection's own membership lets in is ballast-free enough (Russian *half shtof*, Roman *digitus*: real units). Information units are the exception: a class, not a curated system, and its tail is coinage (*robibyte*, *Gigapackets*, *decabit*). Entries without a label in the language drop out by the general rule, which already halves the thin regional ones. Within a collection the tiers run by sitelinks.
- **Grouping cut:** a regional collection stands alone from about 10 units with a name in the language; smaller ones go to `other-regional-units`.
- **Not on Wikidata as collections:** French (pre-metric), German, Scottish, Welsh, Scandinavian, Hungarian, Italian, Portuguese, Persian, Thai, Vietnamese, Indian (Tamil), Byzantine, Ethiopian units: the system items exist, but 0 or 1 unit links to them. Each would need a P361 batch from its source; they'd join `other-regional-units` (or `ancient-units`). Arabic / Islamic units: no system item found.
- **Time units (Trummler, 2026-11-27: with the astronomical units):** no official collection holds week, month, year or century (Wikidata links them only as parts of each other: week => month => year), and *astronomical system of units* would be wrong data for them (the IAU system holds the day and the Julian century). So the group reads them by class (above), not by a P361 batch. The calendar units derive from astronomical cycles (day, month, year), which is why they sit there.
- English units before 1824 (class Q16782623, 23) overlap the imperial ones: not a group of their own.

## Organs & Organelles

**Final:** 2026-11-27. **Released:** 2026-11-26 (`2026-11-25_anatomy-found-in-taxon-inferred.txt` imported and verified). **Analysis:** `science/Biology.md#organs--organelles`.

### Base and tiers

- **Organs:** P31 *organ type* (Q103812529): 99. **Organelles:** under *organelle* (Q45948, P279+), from 5 sitelinks: 126. Tiers by sitelinks (eye 261, heart 256, brain 226; mitochondrion 110, nucleus 105, ribosome 96). The two columns of the inclusion table: *Organs*, *Organelles*.
- **Exclusions:** the single human chromosomes, the Y-chromosome haplogroups, artificial chromosomes, *liposome*, *Councilman body*.
- **Not the base:** everything under *organ* (Q712378) by P279*: it holds the foods (apple, rice, banana sit under *fruit* / *seed*), ivory, parchment, a dog breed. The *organ type* class avoids them.

### Groups (Trummler, 2026-11-26)

| Group | Default | Panel | Read from |
| --- | --- | --- | --- |
| a row per kingdom: Animalia (with **Humans** as its subgroup), Plantae, Fungi, Chromista, Protozoa, Archaea, Bacteria | `omittable` | inclusion | organs: below |
| `unclassified` (no kingdom found) | `omitted` | inclusion | the rest |
| `not-safe-for-work` | `omitted` | **omission** | under *sex organ* (Q4620674) by P279*, plus breast and buttock by hand |
| `chromosome-types` (autosome, X / Y chromosome, chromatid, Barr body) | `omittable` | inclusion | the list in `science/Biology.md`; *chromosome* itself stays |

- **Kingdom of an organ:** *found in taxon* (P703) walked up by *parent taxon* (P171) to the kingdom, on the item **or a superclass** (P279*), or the class roots *animal organ* (Q24060765) => Animalia, *plant organ* (Q24060707) => Plantae, *fungal structure* (Q56883667) => Fungi. On the 99 (2026-11-26, `_data/science/organ-type-kingdoms.mjs`): 60 human, 26 more Animalia, 6 Plantae (gametangium in Plantae, as P703 says), 9 left over: *visual organ*, *vital organ*, *touch organ*, *reproductive organ* and other general types with 0–1 sitelinks: `unclassified` is the right place.
- **Humans:** an FMA ID (P1402), or a subclass with one (*human heart* under *heart*), or under *human organ* (Q25449120). The general organs carry Animalia, their human counterparts the FMA ID: both groups get the heart.
- **Kingdom of an organelle:** the forms-of-life table `_data/science/organelle-forms.tsv` (78 organelles × animals, plants, fungi, protists, bacteria, archaea, viruses; 48 cells still open) plus P703 from the Gene Ontology (`2026-11-24_organelles-found-in-taxon.txt`). *Protists* splits into Chromista and Protozoa by lineage (Alveolata, Stramenopiles, Rhizaria, Haptista, Cryptophyceae => Chromista; Euglenozoa, Amoebozoa, Metamonada, Choanoflagellata => Protozoa; Rhodophyta => Plantae): a mapping in the build. The *viruses* column has no kingdom row: those organelles (viral capsid) go to `unclassified` unless another row takes them.
- Groups overlap (the mitochondrion is in four), as inclusion groups may.

## Bones

**Final:** 2026-11-27. **Released:** 2026-11-26 (renamed from *Human Bones*). **Analysis:** `science/Biology.md#human-bones`.

- **Base:** *bone* (Q265868) and its tree by P279*, from 5 sitelinks: 140. Tiers by sitelinks (rib 110, clavicle 85, scapula 84).
- **Exclusions** (things, not bones): ivory (Q82001), walrus ivory (Q2352389), oracle bone (Q283127), *bone marrow as food* (Q1378736); *Tianyuan man* (Q2431198) and bone tool leave the tree by `2026-11-26_not-bone-subclass.txt` (a fossil specimen and a tool, each with a wrong P279 *bone*); and the general types long, flat, short, irregular, sesamoid bone, dentin, pterygopalatine fossa.

| Group | Default | Panel | Read from |
| --- | --- | --- | --- |
| `human-bones` (implicit base) | `omittable` | inclusion | under *human bone* (Q25513701), or an FMA ID: 88 from 5 sitelinks |
| `non-human-bones` (pygostyle, baculum, coracoid, keel, carapace) | `omitted` | inclusion | the rest of the base: P703 below Animalia on 119 of 140 since the Uberon batches; the few without (keel, squamosal, pterygoid, notarium, predentary) are bones of birds and reptiles, so the group reads "not human" rather than P703 |

