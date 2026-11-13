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

- **Batch** `2026-11-03_si-special-name-remove.txt` (**pending**): the special-name class holds 25, as second, kelvin and mole carry it too. The class's own description says 22, and the three are base units. All 22 official ones are in.
- **Rules:**
  - `si-accepted` (`omittable`): *SI-accepted non-SI unit* (Q106839753), from 20 sitelinks (day, hour, minute, litre, hectare, tonne).
  - `si-derived` (`omitted`): the other *SI derived units* (square kilometre, kilometre, gram, cubic metre).
  - `si-prefixes` (`omitted`): *SI prefix* (Q131299), 23 of the 24 from quetta to quecto, as *deca* isn't found in the class (to check); *semi-*, *demi-* and one character are exclusions.

**Rating:** clean after the batch.

## [to Navigation](#navigation)
