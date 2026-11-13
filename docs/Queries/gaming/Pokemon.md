# Wikidata Query Analysis: Pokémon (Games)

What Wikidata offers for the Pokémon (Games) topics, and how far it can serve as their source.

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Navigation

[Gaming](../README.md#gaming)
- ☑️[Pokémon](#pokémon)
- ☑️[Abilities](#abilities)
- ✖️[Items](#items)
- ✖️[Moves](#moves)
- ✖️[Characters](#characters)
- ➕[Locations](#locations)
- ➕[Video Games](#video-games)

## ☑Pokémon

**Associated List:** [list of Pokémon species (Q236209)](https://www.wikidata.org/wiki/Q236209)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [Pokémon species](https://www.wikidata.org/wiki/Q3966183)  
**Released so far:** 1025  
**Base query:** `"instance of (P31)" matching Value "Pokémon species (Q3966183)"`, "Include related values in the search" = true (it is a superclass of "<type>-type Pokémon")  
**Results:** 1236  
**Difference:** +211, presumably mostly regional, Mega and other forms

**Omitted:**
- `Glitch Pokémon species "??????????"`: Q138840888 (1)

**Omittable:**
- Regional Forms: "Alolan form (Q56707595)" (18), "Galarian form (Q72918110)" (19+1), "Hisuian Form (Q108152260)" (16), "Paldean Form (Q113403839)" (2+3)
- Mega Evolutions: "Mega evolution (Q16577590)" (93)
- Special Forms: `Crowned *` (2), `* Zen Mode` (2), `Dawn Wings *` (1), `Dusk Mane *` (1), `* Rotom` (6), `* Forme` (2+2+2+3), `* Form` (13), `* Rider Calyrex` (2), `* Breed)` (3), `Primal *` (2), `Ultra *` (1), `* Plumage` (4), `* Mask` (4), `* Floette` (1), `* Eternatus` (1), `Hoopa *` (2), `* Kyurem` (2), `Bloodmoon *` (1)

**Results after all class-based filters:** 1080  
**Entries that need filtering by string matching:** 58 - 4 = 54  
1080 - 54 = 1026 = 1025 + 1; the one left over is "MissingNo. (Q1070682)"

[Full Query Builder Negative Query](https://query.wikidata.org/querybuilder/?uselang=en&query=%7B%22conditions%22%3A%5B%7B%22propertyId%22%3A%22P31%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q3966183%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3Anull%2C%22negate%22%3Afalse%7D%2C%7B%22propertyId%22%3A%22P31%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q56707595%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P31%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q72918110%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P31%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q108152260%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P31%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q16577590%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P31%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q113403839%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27118928%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27118900%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27118889%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27118795%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27118381%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27065429%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q26945334%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q61951126%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q111033398%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Atrue%7D%5D%2C%22limit%22%3A2000%2C%22useLimit%22%3Atrue%2C%22omitLabels%22%3Afalse%7D)  
**Query Service query:**

```
SELECT DISTINCT ?item ?itemLabel WHERE {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],mul,en". }
  {
    SELECT DISTINCT ?item WHERE {
      ?item p:P31 ?statement0.
      ?statement0 (ps:P31/(wdt:P279*)) wd:Q3966183.
      MINUS {
        ?item p:P31 ?statement1.
        ?statement1 (ps:P31/(wdt:P279*)) wd:Q56707595.
      }
      MINUS {
        ?item p:P31 ?statement2.
        ?statement2 (ps:P31/(wdt:P279*)) wd:Q72918110.
      }
      MINUS {
        ?item p:P31 ?statement3.
        ?statement3 (ps:P31/(wdt:P279*)) wd:Q108152260.
      }
      MINUS {
        ?item p:P31 ?statement4.
        ?statement4 (ps:P31/(wdt:P279*)) wd:Q16577590.
      }
      MINUS {
        ?item p:P31 ?statement5.
        ?statement5 (ps:P31/(wdt:P279*)) wd:Q113403839.
      }
      MINUS {
        ?item p:P4584 ?statement6.
        ?statement6 (ps:P4584/(wdt:P279*)) wd:Q27118928.
      }
      MINUS {
        ?item p:P4584 ?statement7.
        ?statement7 (ps:P4584/(wdt:P279*)) wd:Q27118900.
      }
      MINUS {
        ?item p:P4584 ?statement8.
        ?statement8 (ps:P4584/(wdt:P279*)) wd:Q27118889.
      }
      MINUS {
        ?item p:P4584 ?statement9.
        ?statement9 (ps:P4584/(wdt:P279*)) wd:Q27118795.
      }
      MINUS {
        ?item p:P4584 ?statement10.
        ?statement10 (ps:P4584/(wdt:P279*)) wd:Q27118381.
      }
      MINUS {
        ?item p:P4584 ?statement11.
        ?statement11 (ps:P4584/(wdt:P279*)) wd:Q27065429.
      }
      MINUS {
        ?item p:P4584 ?statement12.
        ?statement12 (ps:P4584/(wdt:P279*)) wd:Q26945334.
      }
      MINUS {
        ?item p:P4584 ?statement13.
        ?statement13 (ps:P4584/(wdt:P279*)) wd:Q61951126.
      }
      MINUS {
        ?item p:P4584 ?statement14.
        ?statement14 (ps:P4584/(wdt:P279*)) wd:Q111033398.
      }
    }
    LIMIT 2000
  }
}
```
**Notes:**

- The Pokémon generations, from `?statement6 (ps:P4584/(wdt:P279*)) wd:Q27118928.` on, ascend from "first generation".
- 4 Pokémon without a generation are (rightly) left out: "Gorochu (Q134971461)" (a hypothetical evolution of Raichu) and the 3 generation 10 starters "Pombon (Q138499281)", "Browt (Q138499282)" and "Gecqua (Q138499283)".

[Query for all Pokémon species with any generation given as its “first appearance”](https://query.wikidata.org/querybuilder/?uselang=en&query=%7B%22conditions%22%3A%5B%7B%22propertyId%22%3A%22P31%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q3966183%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3Anull%2C%22negate%22%3Afalse%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27118928%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22and%22%2C%22negate%22%3Afalse%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27118900%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22or%22%2C%22negate%22%3Afalse%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27118889%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22or%22%2C%22negate%22%3Afalse%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27118795%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22or%22%2C%22negate%22%3Afalse%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27118381%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22or%22%2C%22negate%22%3Afalse%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q27065429%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22or%22%2C%22negate%22%3Afalse%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q26945334%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22or%22%2C%22negate%22%3Afalse%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q61951126%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22or%22%2C%22negate%22%3Afalse%7D%2C%7B%22propertyId%22%3A%22P4584%22%2C%22propertyDataType%22%3A%22wikibase-item%22%2C%22propertyValueRelation%22%3A%22matching%22%2C%22referenceRelation%22%3A%22regardless%22%2C%22value%22%3A%22Q111033398%22%2C%22subclasses%22%3Atrue%2C%22conditionRelation%22%3A%22or%22%2C%22negate%22%3Afalse%7D%5D%2C%22limit%22%3A2000%2C%22useLimit%22%3Atrue%2C%22omitLabels%22%3Afalse%7D):
```
SELECT DISTINCT ?item ?itemLabel WHERE {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],mul,en". }
  {
    SELECT DISTINCT ?item WHERE {
      ?item p:P31 ?statement0.
      ?statement0 (ps:P31/(wdt:P279*)) wd:Q3966183.
      {
        ?item p:P4584 ?statement1.
        ?statement1 (ps:P4584/(wdt:P279*)) wd:Q27118928.
      }
      UNION
      {
        ?item p:P4584 ?statement2.
        ?statement2 (ps:P4584/(wdt:P279*)) wd:Q27118900.
      }
      UNION
      {
        ?item p:P4584 ?statement3.
        ?statement3 (ps:P4584/(wdt:P279*)) wd:Q27118889.
      }
      UNION
      {
        ?item p:P4584 ?statement4.
        ?statement4 (ps:P4584/(wdt:P279*)) wd:Q27118795.
      }
      UNION
      {
        ?item p:P4584 ?statement5.
        ?statement5 (ps:P4584/(wdt:P279*)) wd:Q27118381.
      }
      UNION
      {
        ?item p:P4584 ?statement6.
        ?statement6 (ps:P4584/(wdt:P279*)) wd:Q27065429.
      }
      UNION
      {
        ?item p:P4584 ?statement7.
        ?statement7 (ps:P4584/(wdt:P279*)) wd:Q26945334.
      }
      UNION
      {
        ?item p:P4584 ?statement8.
        ?statement8 (ps:P4584/(wdt:P279*)) wd:Q61951126.
      }
      UNION
      {
        ?item p:P4584 ?statement9.
        ?statement9 (ps:P4584/(wdt:P279*)) wd:Q111033398.
      }
    }
    LIMIT 2000
  }
}
```
(1232 results; Total - 4 = exactly matching expectations)

**Check (2026-10-07):** 1,235 species via `P31/P279*` (1,236 before); the class itself is never used directly (0).

**Built by** #35 from PokéAPI, not from Wikidata: `scripts/pokemon/` (names in the 11 languages the games ship in, `ja-Latn` derived), tiers per generation from Sporcle's guess rates. The two questions for this pass (plan doc, step 4): a number for the fame tiers, and how official each language's labels are.  
**Tool:** `_scripts/pokemon.mjs` (output `_data/pokemon-run1.txt`).

**Check (2026-10-09):** 1,232 species items carry a generation; all 1,025 entries of our generation lists match one by English name.

### Fame: sitelinks don't replace the tiers

Sitelinks against our tiers, per generation (Spearman's rho, negative = more sitelinks in the higher tiers; median sitelinks from tier 1 to tier 6):

| Gen | rho | Median per tier |
| ---: | ---: | :---- |
| 1 | -0.68 | 35 / 17 / 13 / 13 / 11 / 10 |
| 2 | -0.51 | 15 / 12 / 7 / 7 / 7 / 7 |
| 3 | -0.37 | 12 / 8 / 8 / 6 / 6 / 5 |
| 4 | -0.42 | 11 / 7 / 6 / 7 / 5 / 5 |
| 5 | -0.45 | 7 / 5 / 4 / 3 / 3 / 3 |
| 6 | -0.46 | 5 / 5 / 4 / 3 / 3 / 3 |
| 7 | -0.28 | 5 / 3 / 3 / 3 / 3 / 3 |
| 8 | -0.28 | 4 / 3 / 2 / 2 / 2 / 2 |
| 9 | -0.50 | 4 / 3 / 2 / 3 / 2 / 2 |

The direction is right everywhere, but from generation 5 on most species have 2 to 5 sitelinks (median over all 5; 840 of 1,025 below 10), so the number can't separate the lower tiers. The editorial tiers stay; sitelinks could at most break ties in generations 1 and 2. Pageviews could be finer (enwiki and jawiki hold a sitelink for over 1,160 species, on enwiki mostly to redirects into the lists), but they aren't Wikidata data and would need a measurement of their own: a candidate, not done here.

### Labels: official where the games are released, and only there

**The languages the games ship in** (the build's 11): Wikidata's labels are nearly complete and match the official names on 1,011 to 1,025 of 1,025 per language. The differences, by side:
- **Wikidata wrong** (batched, 20 edits): de Araquanid *Aranesto* (*Aranestro*); fr *Parécool*, *Feuilloutan*, *Troixhydre*, *Émolga* (*Parecool*, *Feuiloutan*, *Trioxhydre*, *Emolga*) and the English *Boldore* / *Durant* where French has *Géolithe* / *Fermite*; it Iron Treads *Solcoferro* (*Solcoferreo*); seven Korean labels (Poliwhirl, Tangela, Blissey, Pignite, Joltik, Xerneas, Cyclizar, the last one carrying another Pokémon's name); zh-Hant Cofagrigus, Runerigus and Kingambit with the Simplified-region names (*迭失棺*, *迭失板*, *仆斬將軍* against *死神棺*, *死神板*, *仆刀將軍*).
- **Our data wrong** (PokéAPI): zh-Hans Minun *負电拍拍* and Iron Treads *铁轍迹* each carry one Traditional character; Wikidata's *负电拍拍* and *铁辙迹* are right. A `corrections` entry each (message below).
- **Neither:** Porygon2 and Porygon-Z with a full-width or half-width digit / letter (ja, ko, zh-Hans), and *豔* / *艷* in Espathra's zh-Hant name: variant characters, not different names.

**Every other language** has no official names: the games were never released in them, and players there use the English ones. Wikidata agrees: cs (809 labels), nl (812), sk (662), nb (249) and the smaller ones repeat the English name, apart from a few slips (tr *Paras (Pokémon)*, pt *Família de Wailmer*, both batched). Where labels differ, they are transliterations of the English or Japanese names, used by fan sites and some anime dubs: all 134 ru labels (*Чармандер*), all 357 he labels, 9 of 15 el, and single bg / mk / sr / lv labels.

**Answer to the question:** the explicit list of sufficiently official languages is exactly the build's: en, de, fr, es (and es-419), it, ja (and the derived ja-Latn), ko, zh-Hans, zh-Hant. Every other language shows the English name, which is already what an absent key means. No threshold is needed, and Wikidata's transliterations stay out.

**Wikidata batch from this pass** (imported and checked on the items 2026-10-09):

| Batch | Edits | What |
| :---- | ----: | :---- |
| `2026-10-09_pokemon-species-labels.txt` | 20 | the 18 labels above in the official languages set to the official name, plus tr *Paras* and pt *Wailmer*; no aliases kept, since the old labels are typos or another species' or region's name |

**Second pass (2026-10-20): the string matching is gone.** The 54 special forms the query above filters by name (`* Forme`, `* Rotom`, `Crowned *`, …) now all carry the class *different form of Pokémon* (Q56707539); most were typed so in 2026. Measured: 1,235 species items; 54 of the form class, 152 regional or Mega; with a generation and none of these classes 1,027 (our 1,025 plus MissingNo. and the glitch species); requiring a National Pokédex number (P1685) as well gives **exactly 1,025**, MissingNo. and the glitch species having none. **MissingNo. stays** (Trummler, 2026-10-20): the one glitch species treated as a standard entry, for being iconic; no other exception. Both glitch items share the class *Glitch Pokémon* (Q99542925), so no class separates them; MissingNo. (Q1070682) is a one-line inclusion list beside the query, visible in `data-raw/`, as Carthage is for the historical countries. The build reads PokéAPI, which has no MissingNo., so it joins generation 1 by hand there too. **Membership query now:** `?i wdt:P31/wdt:P279* wd:Q3966183 ; wdt:P4584 ?gen ; wdt:P1685 [] .` minus the classes *different form of Pokémon*, *Alolan* / *Galarian* / *Hisuian* / *Paldean form* and *Mega evolution*: class-based throughout, no string list and no exclusion list. The forms keep their classes for the omittable rules (regional forms, Mega evolutions, special forms). A note on P1685: its values mix three- and four-digit padding (*022* Fearow, *0006* Charizard), so a sort has to read them as numbers. No research and no schema proposal needed: names were settled in the first pass, fame stays editorial.

### Forms: what exists, and how to group them (2026-10-20)

**Sources.** PokéAPI (the build's source) has 1,527 forms, 563 of them named; the **official Japanese Pokédex** (zukan.pokemon.co.jp, current through *Legends Z-A*) lists 277 forms as entries of their own (`detail/<no>-<sub>`): every Mega, Primal and Gigantamax form, every regional form, and the forms that change a Pokémon's look and often its type or stats (Rotom, Deoxys, Origin Dialga, the female Meowstic, Oricorio's styles, …). It does **not** list the purely cosmetic sets one by one: Vivillon's 20 patterns appear only as a sentence in Vivillon's entry ("現在20種類が確認されている", 20 kinds confirmed so far). That line is the natural, official boundary for Trummler's cosmetic forms. Tool: `_scripts/pokemon-forms.mjs` (outputs in `_data/pokemon-forms/`).

**Groups, each a rule candidate** (all omitted by default):

| Rule | What | Official Pokédex | On Wikidata |
| :---- | :---- | ----: | :---- |
| `mega-evolutions` | Mega and Primal forms | 94 | all (*Mega evolution* Q16577590; Primal by *form* class), incl. the *Legends Z-A* Megas PokéAPI lacks |
| `gigantamax` | Gigantamax forms | 34 | **none**; batch below |
| `regional-forms` | Alolan, Galarian, Hisuian, Paldean | 57 | 56, by their classes (the 57th, *Galarian Darmanitan*, under another label) |
| `special-forms` | other forms the official Pokédex lists | about 90 | about half; batch below |
| `cosmetic-forms` | forms PokéAPI names but the official Pokédex doesn't list: 200 with an English name, on 25 species: Alcremie 62 (63 with the default), Unown 27 (28), Vivillon 19 (20), Arceus 18, Pikachu's caps and costumes 14, Minior's cores 12, Furfrou 9, Flabébé / Floette / Florges 4 each, Genesect 4, Castform, Pumpkaboo / Gourgeist sizes, …; Silvally's 17 types and Koraidon's / Miraidon's modes have no names in PokéAPI, Scatterbug's and Spewpa's patterns exist only in the data | 0 | 3 (Zygarde 10% / 50%, Eternamax) |

- **Totem Pokémon** (11 in PokéAPI) are larger individuals, not forms: no rule.
- **Default forms** (*Normal Deoxys*, *Male Meowstic*, *Meadow Vivillon*). Decided (Trummler, 2026-10-20), as Giratina already has it: a default form that carries an official name gets an item of its own. The species item stays the general entry, and every variant, the default included, is *part of* it. The same holds one level down: *Mega Tatsugiri* is the general entry of its three styles, and *Paldean Tauros* of its three breeds. For the lists: the species entry stays in the base, and a form rule lists the whole set (Unown A to Z, ! and ?).
- **Not in PokéAPI:** the *Legends Z-A* Megas (44, all on Wikidata already), the gender forms of Unfezant, Frillish, Jellicent and Pyroar (in the official Pokédex as female forms), Spinda (its spots are generated per individual, not forms).

**Wikidata batches** (official Pokédex as the reference for class and species, PokéAPI for the generation a form came with; labels in en / de / fr from PokéAPI, a parenthetical display such as *Burmy (Sand)* kept as an alias):
- `2026-10-20_pokemon-forms-gigantamax-{1,2,3}.txt`: the 34 Gigantamax forms, typed *gigantamax* (Q107639880) as the Megas are typed *Mega evolution*, *part of* their species, generation 8.
- `2026-10-20_pokemon-forms-official-{1..4}.txt`: the other 37 official forms Wikidata lacks (cloaks, seasons, East Sea, Origin Dialga / Palkia, the female forms PokéAPI names, Oricorio's styles, …), typed *different form of Pokémon*.
- `2026-10-20_pokemon-forms-official-extra.txt`: the official entries first left out.
  - The four female forms PokéAPI has no names for (Unfezant, Frillish, Jellicent, Pyroar).
  - The Mega sub-forms: Mega Tatsugiri Droopy and Stretchy, Mega Magearna Original Color. These are typed and linked like the Megas (*Mega evolution*, P13044 the species) and are *part of* their Mega.
  - The existing *Mega Tatsugiri* (Q138081250) stays the general entry. Its curly form gets an item of its own, like the other two. Both Mega items gain a de label.
- `2026-10-20_pokemon-forms-defaults-{1..6}.txt` (55 items): the officially named default forms that had no item.
  - 44 from the official Pokédex, whose base entry names them; this count includes the eight Forces of Nature forms below. Among them are Normal Deoxys, Plant Burmy, Shield Aegislash and the male forms, plus the Gen 9 defaults with de names from Pokéwiki.
  - The Forces of Nature per species: Wikidata had only one shared *Incarnate Forme* / *Therian Forme* item for all four. Those two items stay as they are.
  - The defaults of the cosmetic sets PokéAPI names: Unown A, Meadow Vivillon, Red Flower Flabébé line, Natural Furfrou, Average Size, Normal Arceus, Neutral Xerneas, Vanilla Cream Strawberry Sweet.
  - Not created: Silvally's types, and Koraidon's and Miraidon's modes, since PokéAPI has no names for them. Spinda is no form.
- `2026-10-20_pokemon-forms-links-{1,2}.txt` (107 lines): of the 332 form items on Wikidata, 109 had no link to their species at all.
  - That covers every regional form (59), five Megas, Giratina's, Deoxys', Shaymin's, Lycanroc's, Basculin's and Toxtricity's forms, Kyurem's fusions and Necrozma's.
  - Each now gets *part of* its species, the Megas P13044 like the other Megas, and the three Paldean Tauros breeds *part of* Paldean Tauros.
  - References come from the official Pokédex entry; Eternamax uses its PokéAPI form, as the official Pokédex has no entry for it.
  - The two shared Forces of Nature items stay unlinked.

**The principle (Trummler, 2026-10-20):** what is officially addressed as a form of its own gets an item of its own, whether or not it looks different. "Official" means the official Pokédex or a form name in the games.
- **Spinda** is the exception: its spots are generated per individual. At most, the patterns Pokémon GO tells apart could become items; that remains an idea only.
- `2026-10-20_pokemon-forms-untyped.txt` (16 lines): eight items of 2016 (Meloetta's Aria and Pirouette, Castform's weather forms, Wormadam's three cloaks) modelled as *subclass of* their species with no class at all, which hid them from every form query; each gets *different form of Pokémon* and *part of* its species. A full-text search for each missing form found no other existing item (`_data/pokemon-forms/`). Every de / fr label checked against its species' label on Wikidata: two PokéAPI slips corrected in the batch, fr *Diagla Originel* (*Dialga Originel*) and de *Barschuft ♀* for the female Basculegion (*Salmagnis ♀*; *Barschuft* is Basculin).
- **Cosmetic forms** (`2026-10-20_pokemon-forms-cosmetic-{01..18}.txt`, 184 items, PokéAPI as the reference for all three statements). Decided (Trummler, 2026-10-20): each is a thing of its own and deserves an item, typed *different form of Pokémon* like every other form. A Vivillon pattern changes only the look, but so does an Unown letter or an Alcremie topping, and a class of their own would be an artificial line. The rule's name is `cosmetic-forms`, a collective term (Furfrou's trims are a player's choice, but splitting further would be overkill). The only sources are PokéAPI and the fan wikis.
  - **Left out (16):** what is not officially addressed as a form.
    - The ability variants (Battle Bond Greninja, Power Construct Zygarde, Own Tempo Rockruff) have no form name in the games and no entry in the official Pokédex, so they are PokéAPI's technical split.
    - Minior's six further meteor shells: the official Pokédex knows one *Meteor Form*, the species itself.
    - Arceus' ??? type exists in the data only.
    - Maushold's family of three is the species, as the official Pokédex has it. Also left out is what has an item already: Castform's weather forms, Zygarde 10%, Eternamax.
  - **Labels:** species plus form, the games' display as an alias, as in the official batches. de names from Pokéwiki where PokéAPI lacks them or has them wrong: Alcremie's 62 as *Pokusan <Creme> <Zucker-…>*, the cosplay Pikachus (*Rocker-*, *Damen-*, *Star-*, *Professoren-*, *Wrestler-*, *Cosplay-Pikachu*), *Ash-Quajutsu*, *Partner-Pikachu* / *-Evoli*, *Zarude Papa-Form*; *Vivillion* and *Noyeau* corrected.
  - **Checks:** a full-text search for every label and alias found no existing item.
- **Label corrections** (`2026-10-20_pokemon-forms-labels-{1,2}.txt`): a parenthetical display in the de name had made the four Toxtricity and Urshifu Gigantamax labels *Gigadynamax-Riffex Gigadynamax-Form* (and *-Wulaosu*), the form lost; *Magearna Original Color* got the bare species name in de; and PokéAPI has no de names for the female Oinkologne, Maushold, Palafin, Tatsugiri, Dudunsparce, Poltchageist and Sinistcha forms (taken from Pokéwiki: *Viererfamilie*, *Heldenform*, *Hängende* / *Gestreckte Form*, *Dreisegmentform*, *Kostbarkeitsform*, *Edle Form*). One more PokéAPI slip, fr *Météno Noyeau Rouge* (*Noyau*). All PokéAPI errors found so far, drafted as a report for its maintainers: `PokemonAPI.md` (temporary).
- **Check after the imports (2026-10-23):** all 318 created items and 130 edits of the 37 form batches are on Wikidata, each label, alias, description, statement and reference URL as written. One correction had slipped through when the label batch was split; it follows as `2026-10-23_pokemon-forms-label-magearna.txt` (de *Magearna Originalfarbe*). Every form item now links to its species, except the two shared Forces of Nature items (*Incarnate Forme*, *Therian Forme*), which stay as they are.

<!-- @agent(#35) from #38 · 2026-10-20 · OPEN
Decided (Trummler, 2026-10-20): MissingNo. joins generation 1 as a standard entry, the one glitch species and the one exception; the cosmetic forms (Vivillon, Alcremie, Unown, …) get an omitted rule of their own, `cosmetic-forms`, and Wikidata items typed *different form of Pokémon* like every other form. Proposed by #38, to confirm with Trummler: all forms as omitted rules, grouped by the official Japanese Pokédex (zukan.pokemon.co.jp lists 277 forms as entries): `mega-evolutions` (Mega and Primal), `gigantamax`, `regional-forms`, `special-forms` (the other forms the official Pokédex lists), and `cosmetic-forms` for the sets it doesn't list one by one (Alcremie, Unown, Vivillon, Arceus, Pikachu's caps, Minior, Furfrou, the Flabébé line, …). Totem Pokémon are no forms.
Ask: when you're back on Pokémon, build the forms from PokéAPI with this grouping; `_data/pokemon-forms/official.json` maps each official entry to its PokéAPI form, `cosmetic.json` lists the cosmetic forms (200 with an English name). PokéAPI name slips to correct when forms are built (until upstream fixes them): the full list is in `PokemonAPI.md`, issue 1 (wrong names, incl. three more zh-Hans species names: Minun, Flamigo, Iron Treads) and issue 2 (missing de form names). If the build reads the GraphQL beta: it lags `master`, and there zh-Hant / zh-Hans of Iron Boulder and Iron Crown are swapped; the REST API is right. No hurry.
Refs: this file, Pokémon => Forms: what exists, and how to group them; _scripts/pokemon-forms.mjs
-->

**Rating:** ☑️ stands; membership is now perfect by class (2026-10-20). Wikidata could supply the names (as good as PokéAPI after this batch, and better on two Chinese names), but not the fame.

<!-- @agent(#35) from #38 · 2026-10-09 · OPEN
Decided: Pokémon checked against Wikidata (this file, Pokémon). PokéAPI stays the source; fame stays editorial (sitelinks too coarse past gen 2); the official languages are exactly the build's 11, every other language falls back to English as it does now.
Ask: two zh-Hans names in our lists carry a Traditional character (PokéAPI's error): Minun 負电拍拍 => 负电拍拍 (generation-3) and Iron Treads 铁轍迹 => 铁辙迹 (generation-9); a `corrections` entry each.
Refs: this file, Pokémon => Labels: official where the games are released, and only there
-->

## ☑Abilities

**Associated List:** -  
**Definition:** -  
**Assessment:** No list defined yet  
**Released so far (per Google's AI answer):** 310 ("While the base list totals 310, some data indices and external databases count up to 319 to account for distinct in-battle variant forms, such as the various "Embody Aspect" iterations for Ogerpon")  
**Query:** `"instance of (P31)" matching Value "Ability (Q12640000)"`, "Include related values in the search" = false (makes no difference)  
**Results:** 314  
**Rating:**

- Complete as far as checked,
- but without a direct "first appearance (Q8563381)", "introduced in (P10695)" or similar.

=> Needs a mapping file, ideally generated once, by this rule: `for each ability: load every Pokémon species that has it; of those, take the lowest generation in "first appearance (Q8563381)"`

**Check (2026-10-07):** 314, unchanged.

**Check (2026-11-11), against PokéAPI:** its 314 main-series abilities (374 with the spin-off and unused ones) are all on Wikidata. Labels PokéAPI has and Wikidata lacks (fr, es, ko, zh-hans, zh-hant about 310 each, de 81, it 78): `2026-11-11_pokemon-abilities-labels-1.txt` to `-3.txt` (**pending**, 1,710 lines). The generation of an ability wasn't on Wikidata: `2026-11-11_pokemon-abilities-generation-1.txt` to `-3.txt` (**pending**, 314 lines) add it as the species have it, *first appearance* (P4584) = the generation item, from PokéAPI; the mapping file above becomes a query.

## ✖Items

**Associated List:** -  
**Definition:** -  
**Assessment:** No list defined yet  
**In our list so far:** 1396  
**Query:** `"instance of (P31)" matching Value "Pokémon item (Q27302146)"`, "Include related values in the search" = true (otherwise only 22 results)  
**Results:** 330  
**Rating:**

- **Unusable** for now:
- all berries and several item classes seem to be missing;
- needs extensive contributions before it can be used.

**Check (2026-10-07):** 330 with subclasses (22 direct), unchanged.
**Check (2026-11-11), against PokéAPI** (2,222 items in 55 categories; our list has 1,396): Wikidata types 330 as items, and they match only in a few categories: Mega Stones 92 of 92, Z-Crystals 29 of 29, machines 108 of 338, evolution items 25 of 40, balls 7 of 18; berries, healing items, held items (8 of 72), plates, memories, mints, mail and the rest have none. PokéAPI also counts game-internal sets that are hardly items of their own: 300 Dynamax Crystals, 222 TM materials, 81 picnic and 59 sandwich ingredients, 80 species candies, 27 data cards, 122 *unused*.
- **Proposal:** fill it like the moves, from PokéAPI, category by category, each with a class (*Poké Ball*, *Berry*, *held item* …, existing where Wikidata has one). Before about 1,000 to 1,500 CREATEs (15 to 25 parts one after the other) two choices are Trummler's: which categories (our 1,396 as the guide, or all but the game-internal sets), and whether the TMs get one item per machine and game (PokéAPI's 338) or per number, as Wikidata's 100 do now. **Generation:** PokéAPI has none per item, only the generations of the games it appears in (`game_indices`); the earliest of those is the item's P4584, as for moves.
- **Decided (Trummler, 2026-11-13):** everything the games themselves treat as an item of its own gets one (so the bag items PokéAPI counts as game-internal sets too: Dynamax Crystals, TM materials, ingredients, candies; not the *unused* ones, which were never released). Relations between items (a stronger version, what a machine teaches in which game, what an item is made from) go in statements and qualifiers; which properties fit is worked out before the CREATE batches are written. **What Wikidata does now** (SPARQL, 2026-11-13): the 100 TMs are one item per number (TM01 Q57170688), the game as *present in work* (P1441), and the move it teaches per game as *has part(s)* (P527) with *applies to part* (P518) the game (TM01: Mega Punch in Red/Blue/Yellow, Dynamic Punch in Gold/Silver/Crystal, Focus Punch from Ruby/Sapphire); evolution items carry *has use* (P366) *Pokémon evolution*, Mega Stones and Z-Crystals *used by* (P1535) their Pokémon; between items only *different from* (19), *modified version of* (8, Pokédexes) and *has part* / *part of*. So the TMs stay per number (PokéAPI's 338 machines are numbers too, TR and HM included), and no item links a stronger version yet; Wikidata has no *upgrade of* property, the candidates are *follows* / *followed by* (P155 / P156, a series order: Poké Ball => Great Ball => Ultra Ball) and *made from material* (P186, for crafted items and recipes). Open.
- **Model (draft, 2026-11-13):** `_data/Wikidata/Pokemon_Items_Model.md`. It covers:
  - Classes per group, following the names the games use (*Berry*, *Mint*, *Data Card*, *Tera Shard* …).
  - The statements every item gets.
  - One property per kind of relation:
    - P1535 *used by* for the Pokémon an item serves.
    - P366 *has use* for what it powers (the Z-Crystal model).
    - P5059 *modified version of* for a stronger dose (X Attack 2 => X Attack).
    - A shared class with P155 / P156 only for sizes of one item (Exp. Candy XS to XL; not the Balls, Trummler).
    - P186 *made from material* for recipes.
    - P138 *named after* for the Dynamax Crystals' stars.
  - Five open points before the CREATEs: the four Ball items modelled as subclasses, the type link, doses vs. sizes, drops and fossils, and P1441 per game.
  - The items of the newer games, which PokéAPI lacks (Legends: Arceus, Legends: Z-A), and the Scarlet / Violet TM recipes: research prompt `_data/Prompts/Pokemon_Items_Newer_Games.md`.

## ✖Moves

**Associated List:** -  
**Definition:** -  
**Assessment:** No list defined yet  
**Released so far (per Google's AI answer):** 934  
**Query:** `"instance of (P31)" matching Value "Pokémon move (Q15141195)"`, "Include related values in the search" = true (needed for the same reason as with the species)  
**Results:** 678  
**Rating:** the same as for the items.

**Check (2026-10-07):** 678 with subclasses (1 direct), unchanged.
**Check (2026-11-11), against PokéAPI** (937 moves, the Shadow moves of *Colosseum* and *XD* included): 694 on Wikidata, matched by an en, de, fr or ja label (*Vise Grip* is still *Vice Grip* there, the name before Gen 6). Missing: **243**, nearly all of generations 7 to 9 (51, 106, 67), the 18 Shadow moves, the 19 Max Moves, Lucky Chant (Gen 4), Comeuppance and Spotlight (whose de labels other moves carry: *Vergeltung* is Revenge, *Spotlight* Follow Me). The existing items are typed by type class (*fire-type Pokémon move*) and damage class (*physical move*), carry a Bulbapedia ID (P4845, all 678), en and ja labels, the description *Pokémon move*; the generation classes (*moves of seventh generation of Pokémon* …) exist but are unused, and Gen 8 has none.
- **Generation (Trummler, 2026-11-11: every Pokémon topic split by generation):** as the species carry it, *first appearance* (P4584) = the generation item (*first generation of Pokémon* Q27118928 … *ninth* Q111033398), the earliest only; every game a move appears in would be P1441 per game, which no Pokémon item does and no topic needs. PokéAPI gives the generation per move.
- **Batches:** `2026-11-11_pokemon-moves-generation-1.txt` to `-3.txt` (**pending**, 675 lines, P4584 for the existing moves); `2026-11-11_pokemon-moves-create-1.txt` to `-6.txt` (**pending, CREATE, one after the other**, 41 items per part, 38 in the last; regenerated 2026-11-11 with P4584): labels in en, de, fr, es, it, ja, ko, zh-hans, zh-hant from PokéAPI, the two descriptions, the type class and the damage class with the PokéAPI move as reference, the Bulbapedia ID in its usual form (`<Name>_(move)`, not checkable by script since Bulbapedia refuses it). The Shadow moves get only the damage class (Wikidata has no *shadow-type* class). Then `2026-11-11_pokemon-moves-labels-1.txt` to `-3.txt` (**pending**, 1,342 label lines): the labels PokéAPI has where the existing moves have none (636 each in zh-hans and zh-hant, 20 de, 16 fr / es / ko) and *Vise Grip* as the en label with *Vice Grip* kept as alias.
- **Label differences (decided, Trummler 2026-11-13: whatever is officially correct):** re-measured from PokéAPI's `move_names.csv` against Wikidata's labels (SPARQL, 921 moves): 255 differences. Each checked against the wiki of its language, which names its pages by the current game names (Pokéwiki, Poképédia, WikiDex, the Korean Pokémon Fandom): the page under PokéAPI's name, the Wikidata label a redirect or missing, means PokéAPI is right; so for 206 (11 of them Spanish, where WikiDex files both names under one combined page and the Wikidata label is the older, truncated one). The rest: 24 fr labels differ by the apostrophe only (' against ’; Poképédia writes ', so they stay); Wikidata had *Ewige Nacht* and *Schwarzes Loch des Grauens* swapped between Never-Ending Nightmare and Black Hole Eclipse, and Korean *절대영도* (Sheer Cold) on Muddy Water and *객기* (Facade) on Chip Away; where the wiki names neither, its page decides (ko Brick Break *깨트리기*, PokéAPI *깨뜨리다*; fr Shift Gear *Change-Vitesse*, PokéAPI the truncated *Chgt Vitesse*; fr Grass Pledge *Aire d'Herbe*). Width variants (full-width digits in ja and ko) stay. Batch `2026-11-13_pokemon-moves-label-fixes.txt` (224 labels): the older official names (the truncated Spanish ones like *Picotazo Ven*, the Korean spellings before Gen 9 like *스웹*, German *Giftblick*) become aliases; English strings, typos and other moves' names don't. (Imported.)
- **Former names (Trummler, 2026-11-13: model them, as the base for an `old` variant):** *official name* (P1448) allows *valid in period* (P1264), *start time* / *end time* and *applies to work*; the generations are items (*first generation of Pokémon* Q27118928 … *ninth* Q111033398, already the values of P4584). Model: each former name as P1448 in its language, with one P1264 per generation it was used in and P582 the release of the first game with the new name; the current name as P1448 with P580 that date. The generations come from the wiki of the language, which states them in its lead (Poképédia *Poing de Feu avant {{Jeu|EB}}*, WikiDex *llamado X antes de la novena generación*, Pokéwiki *Vor der achten Generation war der Name dieser Attacke …*, the Korean wiki *8세대까지의 명칭은 …*): from the move's first generation (Korean: none in Gen 1 and 3, which had no Korean release), up to the last generation before the change. Dates from the game items' P577 (Sword and Shield, Scarlet and Violet, X and Y, Legends: Z-A worldwide; Sun and Moon 2016-11-23 in Europe, 2016-11-18 in Korea; HeartGold / SoulSilver Europe); none where the switch game's regional date is missing on Wikidata (Black and White in Europe, Diamond and Pearl in Korea). Korean names changed with **Gen 9**, not Gen 7 as noted above. Batch `2026-11-13_pokemon-moves-former-names.txt` (277 lines: 143 former names, 132 current names, two older French names, *Poinglace* and *Prlvt Destin*, also as aliases). Left without P1448 (19): names the wiki doesn't mention at all, mostly truncations (*Veloc. Extrema*, *Mov. Espejo*, *DélugePlasma*), full-width spellings (*ＨＰ회복*), and four that look like typos rather than names (*Rayo Barbuja*, *Lame Ouinte*, *메지컬리프*, *드게인키스*); they stay aliases until a source shows them.
- **Rating after the import:** ➕ (all 937 by class; the list reads P31/P279* *Pokémon move*).

## ✖Characters

**Associated List:** [list of Pokémon characters (Q379199)](https://www.wikidata.org/wiki/Q379199)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [character](https://www.wikidata.org/wiki/Q95074), [from narrative universe](https://www.wikidata.org/wiki/Property:P1080): [Pokémon universe](https://www.wikidata.org/wiki/Q17562848)  
**Named characters so far (per Google's AI answer):** game-exclusive ~900 to 1,000+, anime-exclusive ~1,500 to 2,000+, "neither" (manga and other media exclusives) ~300 to 500+  
**Query:** none specific yet (to follow)  
**Results:** just over 100  
**Rating:** the worst case so far as completeness goes.

**Check (2026-10-07):** The definition finds 308 with subclasses (11 without), more than the "just over 100" above; 313 characters are linked to the Pokémon universe, anime, series or Adventures overall. Still far below the thousands of named characters.

## ➕Locations

**Sibling:** [Pokémon (Anime): Locations](../anime/Pokemon.md#locations)

**Associated List:** [list of locations in Pokémon (Q32860793)](https://www.wikidata.org/wiki/Q32860793)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): Pokémon fictional location  
**Released so far (per Google's AI answer):** "There is no official, exact single global count for non-route, non-cave, and non-region Pokémon towns, cities, and standalone landmarks across all nine generations, but individual major regions typically feature around 10 to 19 towns and cities each"  
**Query:** `"instance of (P31)" matching Value "Pokémon fictional location (Q32860792)"`, "Include related values in the search" = true (for the subclasses "Pokémon region (Q15830)", "Pokémon route (Q25991640)" and "cave in the Pokémon universe (Q26924395)")  
**Results:** 282  
**Rating:** worth considering, but the generation seems to be missing everywhere.

**Check (2026-10-07):** 282 with subclasses (154 direct), unchanged.

**Check (2026-11-11):** the region sits in *location* (P276) on 185 items (a few use P131, P361 or P706). Of the 66 without one, PokéAPI's location data names a single region for 41 (Paldea's towns, provinces and seas, Spikemuth, Verdanturf Town, Cerulean Cave, Cliff Edge Gate): batch `2026-11-11_pokemon-locations-region.txt` (**pending**, 41 lines). Left: the regions themselves (23), *Victory Road* and *Route 2*, which are one item for several regions. The region gives a generation by its games, which is the missing piece noted above.

## ➕Video Games

**Sibling:** [Pokémon (Anime): Video Games](../anime/Pokemon.md#video-games)

**Associated List:** [list of Pokémon video games (Q99485876)](https://www.wikidata.org/wiki/Q99485876)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [video game](https://www.wikidata.org/wiki/Q7889), [part of](https://www.wikidata.org/wiki/Property:P361): [Pokémon video games](https://www.wikidata.org/wiki/Q1079748)

**Check (2026-10-07):** The definition (*part of* = Pokémon video games) matches no video game; 103 games are linked via *media franchise* (P8345) = Pokémon (Q864).  
**Rating:** ➕ (was 🔵), assuming the real number is a little above that.

**Check (2026-11-06):** 102 games by P8345 Pokémon (98 *video game*, 3 DLC, 2 apps). Sitelinks can't rank them: the paired releases have their own items with few links (Pokémon Red 9, Sword 2), as the articles sit on the pair items. The series property is mixed (P179 *Pokémon* 39, *Pokémon video games* 13, spin-off series beside). Research: `optional/Pokemon_Games_List.md`; pokemon.com builds its game list by script, and Bulbapedia's Category:Games holds 263 pages with non-video games among them.

**Decided (Trummler, 2026-11-06):** tiers by sales only: units sold, or for free games like Pokémon GO downloads or peak players, whichever reflects fame better. Core series, spin-offs, mobile games and DLC become rules that combine freely, not tier conditions. Wikidata has *units sold* (P2664) on 14 of the 102 (Legends: Arceus 14.8 million, Platinum 7.1 million); research `Pokemon_Game_Sales.md`. Bulbapedia's overview of 122 games marks the core series (`done/Pokemon_Games_List.md`).

**Sales on Wikidata (2026-11-10):** the figures sit on the pair items (Scarlet and Violet, X and Y), so the 14 above undercount: 30 games carry P2664, the core pairs from Ruby and Sapphire on and the larger spin-offs, each with a quarterly series from Nintendo's IR reports and the latest in preferred rank (kept up by hand, last on 2026-09-20). Nintendo's IR lists as of 2026-09-30 (`ir/en/finance/software/`) are ahead by one quarter only, so no batch: a newer value needs the preferred rank moved, which QuickStatements can't do. Missing: Red and Blue, Yellow, Gold and Silver, Crystal, the N64 and GameCube spin-offs (Stadium, Snap, Colosseum) and the mobile games; Pokopia has its figures. A second research round (`_data/Prompts/done/Pokemon_Game_Sales.md`) found publisher pages only for Rescue Team DX and the core series as a whole: batch `2026-11-10_pokemon-sales.txt` (**pending**, 2 lines). The older games have no publisher page with a figure, so they stay without.
**Downloads:** Wikidata has no property for them (P2664 counts units sold), so Pokémon GO, TCG Pocket, Masters, Sleep and Quest can't hold their figures there; The Pokémon Company's press releases state them (press.pokemon.com, checked 2026-11-10: GO 500 million in 2016, TCG Pocket 150 million in 2025, Masters 10 million, Sleep 10 million, Quest 7.5 million). A property proposal or our own data, Trummler's call. Research: second prompt in `Pokemon_Game_Sales.md` for the missing boxed games.

## [to Navigation](#navigation)
