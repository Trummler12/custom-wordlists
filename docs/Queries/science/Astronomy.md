# Wikidata Query Analysis: Astronomy

What Wikidata offers for the Astronomy topics, and how far it can serve as their source. Constellations stand here by their use in the sky; astrology's signs are separate items and stay out.

## Legend

✅ Wikidata **already in use** as Source
☑️ Wikidata **approved** as Source
🔵 Good Wikidata Coverage expected (**not checked yet**)
➕ Wikidata only has **minor Gaps**
✖️ Wikidata has **LOTS of Gaps**
❌ Wikidata **not viable** at all
❓ Viability not yet clear

## Navigation

[Science](../README.md#science)
- ☑️[Planets & Asteroids](#planets--asteroids)
- ➕[Comets](#comets)
- ➕[Exoplanets](#exoplanets)
- ☑️[Moons](#moons)
- ☑️[Constellations](#constellations)
- ☑️[Stars](#stars)
- ❓[Deep-Sky Objects](#deep-sky-objects)

<!-- @agent(#35) from #38 · 2026-11-05 · OPEN
Decided (Trummler, 2026-11-03): three schema wishes from this file.
1. A third rule type beside omitted and omittable: `includible`, which takes entries in regardless of the tier ruler and other settings. First use: `mars-moons` (default on), as Phobos and Deimos sit in low radius tiers. Possible, or what does it need?
2. An inclusion option "Also show objects with a radius below X km" on Planets & Asteroids, working like the one on Languages.
3. Biology: an inclusion table with columns Organs and Organelles and one row per form of life, with cells greyed out where they don't apply.
No hurry. Details in the sections.
Refs: science/Astronomy.md, Planets & Asteroids, Moons; science/Biology.md, Organs & Organelles
-->

## ☑Planets & Asteroids

**Long name:** Planets and Asteroids: everything bound directly to the Sun (Trummler, 2026-11-03).
**Measure:** radius throughout, not diameter (`P2120`, else half of `P2386`), as *r* is the better known variable and one measure avoids confusion.

| Tier | Members | Who |
| ---: | ---: | --- |
| 1 | 8 | the planets |
| 2 | 5 | the dwarf planets the IAU recognises: Pluto, Ceres, Eris, Haumea, Makemake |
| 3 | 5 | the rest of the class: Sedna, Quaoar, Orcus, Gonggong, Salacia |
| 4 | 13 | from 300 km: Varuna 450, Máni 398, Ixion 355, Varda 353 ... |
| 5 | 38 | from 100 km: Vesta 263, Pallas 257, Hygiea 204, Psyche 111 ... |
| 6 | 573 | from 30 km: Iris, Hebe, Flora, Comet Hale-Bopp ... |
| 7 | 1,604 | from 10 km: Ida 16, Mathilde 26, Arrokoth 18 ... |
| below | 14,481 | under 10 km, behind the inclusion option (6,546 from 3 km, 7,869 from 1 km, 66 under that, by named items measured) |

Named minor bodies only, 16,709 of the 50,711 with a size and P397 Sun. Steps are half decades (1,000, 300, 100, 30, 10, 3, 1); 1,000-500-200-100-50-20 gave uneven counts.

- **Base:** P397 Sun with P31/P279* *planet*, *minor planet* (Q1022867) or *comet*, without *hypothetical astronomical object* (Theia, Planet Nine). It has to walk the subclasses: a direct `wdt:P31` on *dwarf planet* misses Makemake, whose preferred classes are *plutoid* and *cubewano*.
- **Inclusion option (proposal):** "Also show objects with a radius below 10 km". Well-known small ones (Eros 8.4, Gaspra 6.1, Toutatis 2.7, Apophis 0.2, Bennu 0.2, Itokawa 0.2) would need an `includible` rule, a short hand list. Sitelinks can't draw it: bots give low-numbered asteroids 40 to 50 each.
- **Names:** asteroid labels carry the number (5,207 of 5,211 from 25 sitelinks), so the build strips it. Stripped, several meet a moon or a myth (52 Europa, 113 Amalthea, 106 Dione, 55 Pandora). Designation-only objects are out.
- **Size gaps:** of 1,889 minor planets from 35 sitelinks, 36 have no size (719 Albert, 1134 Kepler); these need a look, not yet a batch.
- **Labels (Trummler, 2026-11-05, provisional; `_data/Wikidata/Minor_Planet_Labels.md`):** dwarf planets carry the bare name in every language and in `mul`, the numbered form as an alias; descriptions in English and German name where they lie. Other minor planets stay untouched.

## ➕Comets

**Base:** under *comet* (Q3559), a subset of Planets & Asteroids, without hypothetical ones: 1,420; from 5 sitelinks 446, from 10 192, from 20 63, from 30 25.
**Measure:** sitelinks. Size fails: only 116 have one, and not Kohoutek, NEOWISE or the Great Comets. Trummler: at the same size, comets are far better known than asteroids; so they keep their own ranking, also inside the parent topic.

- **Names:** mixed: *Comet Hale-Bopp*, *67P/Churyumov–Gerasimenko*, *C/2020 F3 (NEOWISE)*, bare designations for ISON (C/2012 S1), McNaught (C/2006 P1) and Lovejoy (C/2011 W3). The build needs a rule, and these labels perhaps a batch.
- **Overlap:** 2060 Chiron, 4015 Wilson–Harrington and others are in both classes.

## ➕Exoplanets

Kept apart from Planets & Asteroids (Trummler).
6,275 items, nearly all designations. 141 carry a proper name in P1448 or P2561 (51 Pegasi b = Dimidium 49, 55 Cancri e = Janssen 36), the IAU's NameExoWorlds names; only 101 have it as label, so the entry name has to come from those properties. These 141 are the base; designations stay out, even known ones (Kepler-22 b 63, Proxima Centauri b 61, TRAPPIST-1e 30), unless Trummler wants them as a rule of their own.

## ☑Moons

**Base:** under *natural satellite* (Q2537) without *hypothetical astronomical object* (which also removes the Black Knight satellite, whose class *claimed moons of Earth* sits under *natural satellite*); 453 items, 178 named on a planet.
**Tiers (Trummler):** radius, in the same steps as asteroids, with no inclusion limit.

| From | Moons | Who |
| ---: | ---: | --- |
| 1,000 km | 7 | Ganymede 2,631, Titan, Callisto, Io, the Moon, Europa, Triton |
| 300 km | 8 | Titania 788 ... Tethys 531 |
| 100 km | 7 | Enceladus 252, Miranda, Proteus, Mimas, Nereid, Hyperion, Phoebe |
| 30 km | 24 | Larissa 97, Janus, Amalthea ... Pasiphae 30 |
| 10 km | 27 | Prospero 25 ... Phobos 11 ... Leda 10 |
| 3 km | 25 | Ymir 10 ... Deimos 6 ... |
| 1 km | 44 | Iocaste 3 ... |
| rest | 36 | smaller or no known size, before `moon-sizes` |

**Rules:**
- **`mars-moons`** (`includible`, default on; Trummler): Phobos and Deimos are always in. Clean: class *moon of Mars* (Q177268), P397 Mars. See the mail to #35 above.
- **`dwarf-planet-moons`** (`omitted`; Trummler): 13 by P397 on a dwarf planet (Charon 94, Nix, Hydra, Dysnomia ...).
- **`provisional-moons`** (`omitted`; Trummler): 120 with only a designation (S/2003 J 12, Jupiter LXXIII). They rank high by sitelinks (up to 52), so the rule can't lean on the floor.
- **`asteroid-moons`** (`omitted`): *minor planet moon* without the dwarf planets' (Dactyl, Dimorphos, Linus).
- **`propeller-moons`** (`omitted`): 12 (Earhart, Blériot).
- **Exclusions:** the temporary satellites 2024 PT5 and 2020 CD3, the exomoons, *Taiyin* and *Veronica My Daughter*.

**Research (2026-11-04; `done/Moon_Sizes.md`):** all 20 from NASA pages, in **batch** `2026-11-04_moon-sizes.txt` (**pending**).
Earlier: 11 mean radii from [JPL](https://ssd.jpl.nasa.gov/sats/phys_par/), imported 2026-11-03 (`2026-11-03_moon-radii.txt`).

## ☑Constellations

**Base:** P31 *constellation* (Q8928) or *zodiacal constellation* (Q4193029), not *former constellation*, from 5 sitelinks. **Results: exactly the IAU's 88**; the seven below 5 are strays (Sah, Yakana). The floor is what separates them.
**Tiers (Trummler):** the 12 traditional zodiac signs on top, the rest from Tier 2, Ophiuchus (93) among them though the class holds 13. So no measure is needed.

- **Rules (`omitted`):** `former-constellations` (30 from 5; Argo Navis), `chinese-constellations` (42 from 5). *Gamma-ray constellation* (21) is an exclusion.
- **Astrology:** the signs are items of their own (*astrological sign*, Q40540), so nothing mixes unless asked to.

## ☑Stars

Approved (Trummler, 2026-11-03).
**Base:** under *star* (Q523), 503 from 20 sitelinks.
**Tiers:** apparent magnitude (P1215), on 433 of them; brightness is what makes a star known, and it follows sitelinks at the top (Sirius, Canopus, Arcturus, Vega).

- **Star systems:** Alpha Centauri is a *triple star system*, Aldebaran's item a *binary star*, so the base needs those classes too. To measure before the build.
- **Out:** Sagittarius A* sits in the class.

## ❓Deep-Sky Objects

Name after *deep-sky object* (Q249389), long name Galaxies, Nebulae & Star Clusters (Trummler's idea, 2026-11-03).
**Does brightness work?** Only in part:

| Class | From | Members | With magnitude | Finding |
| --- | ---: | ---: | ---: | --- |
| galaxy (two class levels) | 20 | 3,172 | 3,015 | works: Large Magellanic Cloud 0.4, Small 2.2, Centaurus A 6.84 |
| star cluster | 10 | 913 | 743 | works: Hyades 0.5, Pleiades 1.6 |
| nebula | 10 | 380 | 228 | fails: planetary nebulae carry their central star's value (Ring 15.8, Dumbbell 14.1, far fainter than they look), dark nebulae have none (Horsehead, Coalsack) |

- **Sitelinks don't help alone:** bots give every Messier and NGC object 50 or more; of the 3,172 galaxies only 40 have a real name by label.
- **Proposal:** tiers by catalogue and name, not by a number: objects with a real name, then the Messier catalogue (112 by P528 with P972), then NGC as an `omitted` rule. Brightness at most inside a tier.
- **Open:** Andromeda and the Milky Way aren't within two class levels; the query times out on the full tree, so the base needs a dump.

## [to Navigation](#navigation)
