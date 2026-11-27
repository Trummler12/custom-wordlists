# Wikidata Query Analysis: Physics

What Wikidata offers for the SI Units topic, and how far it can serve as its source.

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
- ☑️[SI Units](#si-units)

## ☑SI Units

**Base:** *SI base unit* (Q223662): the 7. *SI unit with special name* (Q68618328): the 22.
**Tiers:** base units on top, the 22 next, the rest by rule; no measure needed.

- **Batch** `2026-11-03_si-special-name-remove.txt` (live, checked 2026-11-23): the special-name class holds 25, as second, kelvin and mole carry it too. The class's own description says 22, and the three are base units. All 22 official ones are in.
- **Rules:**
  - `si-accepted` (`omittable`): *SI-accepted non-SI unit* (Q106839753), from 20 sitelinks (day, hour, minute, litre, hectare, tonne).
  - `si-derived` (`omitted`): the other *SI derived units* (square kilometre, kilometre, gram, cubic metre).
  - `si-prefixes` (`omitted`): *SI prefix* (Q131299), the 24 from quetta to quecto: *deca* (Q152516) had *subclass of* instead of *instance of* (fixed 2026-11-26, `2026-11-26_deca-si-prefix.txt`; the P279 in `_Hand_Edits.md`); *null morpheme* carries the class only deprecated; *semi-*, *demi-* and one character are exclusions.

**Rating:** clean after the batch.

## Selection options (2026-11-25)

- **Decided (Trummler, 2026-11-26):** each unit collection an inclusion group, SI `omittable`, the rest `omitted`, small ones in *other units*. Counted on Wikidata 2026-11-26: besides imperial, US and Chinese, Russian (49), CGS (about 36), natural / Planck (25), information (64), ancient (74), Japanese (20) have a basis; astronomical units (au, light-year, parsec) have none; French, German, Persian, Thai and a dozen more exist as system items without members. `_Build_Specs.md#si-units`.

- *Not supported yet:* non-SI systems as groups (imperial, US customary, Chinese, Japanese, ancient Roman / Greek, obsolete). Wikidata links a unit to its system by *part of* (P361), but thinly: Russian 49, Roman 26, Mesopotamian 23, Japanese 20, Greek 20, imperial 13, US customary 4, Chinese none found. The basis would be a batch per system from its defining source (the UK Weights and Measures Act 1985 for imperial, NIST Handbook 44 for US customary, the official definitions of the Chinese market units): a research prompt each, then P361.
- **Imperial and US customary: done (2026-11-25):** both lists from their defining sources (`done/Units_Imperial.md`, `done/Units_US_Customary.md`), P361 on 27 + 39 unit items: `2026-11-25_imperial-us-units.txt`. Chinese: see below.
- **Chinese units (2026-11-26, `_data/Prompts/done/Units_Chinese.md`):** in use? The PRC allowed the market units (市制) in daily life only to 1990 (State Council order 1984) and lists them as prohibited in trade since 2024 (SAMR Order 90); jin and mu live on colloquially and in farmland. Hong Kong keeps catty, tael, chek as legal units (Cap. 68); Taiwan the tai jin and ping (BSMI scale rules, land offices). So a real group, but a regional one.
  - **Source:** the ROC Weights and Measures Act of 1929 (度量衡法, Q18901830), Art. 6 lists the market units; the PRC order of 1959 kept them (the liang decimal). Official text on the BSMI site, read here.
  - **Wikidata:** the class is *Chinese unit of measurement* (Q435922, under *regional units of measurement*), the system *Chinese system of measurement* (Q28648897). P31 of the class sat on chi, li, mu, candareen; `2026-11-26_chinese-units-class.txt` adds it to cun, zhang, tael, mace, picul, cash (厘) and *market catty* (Q108934447; the main *jin* item, Q892596, is a multi-topic article item, so not that one). Volume units (升, 斗, 合) have only the Japanese items (shō, to, gō): no Chinese item, nothing to tag. Hong Kong's chek, cheung, tsun, fan carry P361 *Hong Kong units of measurement*; Taiwan's none.
  - **Group:** *worth considering:* "Chinese units" = P31 Q435922 (plus P361 Q5895496 / Q715103 for Hong Kong / Taiwan). Small (about a dozen items with sitelinks), so likely an `includible` group rather than a tier.
- *Worth considering:* *obsolete* / *replaced* units by an end date or the class *obsolete unit of measurement*; *ancient units* by their system (Roman, Greek, Mesopotamian), which exists.

## [to Navigation](#navigation)
