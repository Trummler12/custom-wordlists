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
- ☑️[Pokémon](#️pokémon)
- ☑️[Abilities](#️abilities)
- ✖️[Items](#️items)
- ✖️[Moves](#️moves)
- ✖️[Characters](#️characters)
- ➕[Locations](#locations)
- ➕[Video Games](#video-games)

## ☑️Pokémon

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

## ☑️Abilities

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

## ✖️Items

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

## ✖️Moves

**Associated List:** -  
**Definition:** -  
**Assessment:** No list defined yet  
**Released so far (per Google's AI answer):** 934  
**Query:** `"instance of (P31)" matching Value "Pokémon move (Q15141195)"`, "Include related values in the search" = true (needed for the same reason as with the species)  
**Results:** 678  
**Rating:** the same as for the items.

**Check (2026-10-07):** 678 with subclasses (1 direct), unchanged.

## ✖️Characters

**Associated List:** [list of Pokémon characters (Q379199)](https://www.wikidata.org/wiki/Q379199)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [character](https://www.wikidata.org/wiki/Q95074), [from narrative universe](https://www.wikidata.org/wiki/Property:P1080): [Pokémon universe](https://www.wikidata.org/wiki/Q17562848)  
**Named characters so far (per Google's AI answer):** game-exclusive ~900 to 1,000+, anime-exclusive ~1,500 to 2,000+, "neither" (manga and other media exclusives) ~300 to 500+  
**Query:** none specific yet (to follow)  
**Results:** just over 100  
**Rating:** the worst case so far as far as completeness goes.

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

## ➕Video Games

**Sibling:** [Pokémon (Anime): Video Games](../anime/Pokemon.md#video-games)

**Associated List:** [list of Pokémon video games (Q99485876)](https://www.wikidata.org/wiki/Q99485876)  
**Definition:** [is a list of](https://www.wikidata.org/wiki/Property:P360): [video game](https://www.wikidata.org/wiki/Q7889), [part of](https://www.wikidata.org/wiki/Property:P361): [Pokémon video games](https://www.wikidata.org/wiki/Q1079748)

**Check (2026-10-07):** The definition (*part of* = Pokémon video games) matches no video game; 103 games are linked via *media franchise* (P8345) = Pokémon (Q864).  
**Rating:** ➕ (was 🔵), assuming the real number is a little above that.

## [to Navigation](#navigation)
