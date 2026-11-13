# PokéAPI: errors to report upstream (temporary)

Errors in PokéAPI's localized names that the Wikidata analysis turned up (`Pokemon.md`), collected for a report to the PokéAPI maintainers. Temporary: this file goes once the report is filed and answered.

## Where and how to report

- **Channel:** a GitHub issue on [PokeAPI/pokeapi](https://github.com/PokeAPI/pokeapi/issues/new/choose), form **Bug report**. Blank issues are disabled; questions go to Discussions or Discord, data errors to the bug form.
- **Form fields:**
  - *Describe the Bug*, which asks for the sources backing a data correction.
  - *Steps to Reproduce*, an endpoint or file that shows the problem.
  - *Resolving the Bug*, a dropdown: "Anyone is open to making a PR" or "I plan on making a PR".
- **The data lives in two CSVs:** `data/v2/csv/pokemon_species_names.csv` and `data/v2/csv/pokemon_form_names.csv` (columns `pokemon_form_id, local_language_id, form_name, pokemon_name`). Language ids used below: 4 zh-Hant, 5 fr, 6 de, 12 zh-Hans.
- **Alternative, a pull request** editing those two CSVs. The template itself says many issues can be solved this way. CONTRIBUTING requires tests to pass, and for AI-assisted changes, that a human has reviewed them and owns them.
- **Already tracked upstream:** [#1401](https://github.com/PokeAPI/pokeapi/issues/1401) covers the missing "Combat Breed" names of Paldean Tauros, so its forms stay out of issue 2.
- **Checked against master on 2026-10-20:** every row below is still wrong in the CSVs on `master`.
  - The GraphQL beta (`beta.pokeapi.co/graphql/v1beta`) additionally lags `master`. There, zh-Hant and zh-Hans of Iron Boulder (1022) and Iron Crown (1023) are swapped, while `master` and the REST API are right. That needs no report, only a note to #35 if the build reads the beta.

## Issue 1 (ready to paste): wrong names

**Title:** `Wrong localized names: Traditional characters in zh-Hans, typos in de / fr form names`

**Describe the Bug:**

```markdown
Several localized names in `pokemon_species_names.csv` and `pokemon_form_names.csv` are wrong (checked against `master`, October 2026). Language ids: 5 = fr, 6 = de, 12 = zh-Hans.

**zh-Hans names containing a Traditional character** (the zh-Hant row of the same Pokémon is right; the Simplified names are the official ones, e.g. on Wikidata and 52poke):

| File | id | Pokémon | Current (12) | Correct |
| :-- | --: | :-- | :-- | :-- |
| species_names | 312 | Minun | 負电拍拍 | 负电拍拍 |
| species_names | 973 | Flamigo | 纏红鹤 | 缠红鹤 |
| species_names | 990 | Iron Treads | 铁轍迹 | 铁辙迹 |
| form_names | 10444 | Ogerpon (Cornerstone Mask) | 礎石面具 | 础石面具 |
| form_names | 1012 | Poltchageist (Counterfeit Form) | 高檔貨的樣子 | 冒牌货的样子 |

The last one is also the wrong form: 高檔貨 is the *Artisan* form (10447, zh-Hans 高档货的样子); the zh-Hant row of 1012 is right (冒牌貨的樣子), so zh-Hans should be 冒牌货的样子.

**de (`pokemon_name` column):**

| id | Form | Current | Correct |
| --: | :-- | :-- | :-- |
| 10088-10102, 10161, 10162 | all 17 Vivillon patterns | Vivillion (…) | Vivillon (…) (the species is *Vivillon* in German) |
| 10090 | Vivillon Garden | Vivillion (Ziergatten) | Vivillon (Ziergarten) (`form_name` is already *Ziergartenmuster*) |
| 10162 | Vivillon Poké Ball | Vivillion (Pokeball) | Vivillon (Pokéball) (`form_name` is already *Pokéball-Muster*) |
| 10417 | Basculegion female | Barschuft ♀ | Salmagnis ♀ (*Barschuft* is Basculin) |
| 10418 | Enamorus Therian | Enamorus (Tiergeist) | Cupidos (Tiergeist) (*Cupidos* is the German species name) |
| 10266 | Magearna Original Color | Magearna | Magearna (Originalfarbe) (`form_name` is already *Originalfarbe*) |

**fr (`pokemon_name` column):**

| id | Form | Current | Correct |
| --: | :-- | :-- | :-- |
| 10414 | Dialga Origin | Diagla Originel | Dialga Originel |
| 774, 10249-10261 | all 14 Minior forms | … Noyeau … | … Noyau … (`form_name` already has *Noyau*) |
| 10362 | Calyrex Ice Rider | Calyrex Cavalier du Froid | Sylveroy Cavalier du Froid (*Sylveroy* is the French species name) |
| 10363 | Calyrex Shadow Rider | Calyrex Cavalier d’Effroi | Sylveroy Cavalier d’Effroi |

Sources: German names per Pokéwiki (pokewiki.de, e.g. the *Vivillon* and *Cupidos* articles); French names per Poképédia (pokepedia.fr: *Sylveroy, le Cavalier du Froid*, *Météno Noyau Rouge*, …); Chinese names per Wikidata (zh-hans / zh-hant labels of each species) and the zh-Hant rows already in PokéAPI.
```

**Steps to Reproduce:**

```markdown
- https://pokeapi.co/api/v2/pokemon-species/312/ (`names`, language `zh-hans`); likewise 973 and 990
- https://pokeapi.co/api/v2/pokemon-form/vivillon-garden/ (`names`, language `de`); likewise the other `vivillon-*` forms, `basculegion-female`, `enamorus-therian`, `magearna-original`
- https://pokeapi.co/api/v2/pokemon-form/dialga-origin/, `minior-red`, `calyrex-ice` (`names`, language `fr`)
- In the data: `data/v2/csv/pokemon_species_names.csv`, `data/v2/csv/pokemon_form_names.csv`, rows by the ids in the tables above
```

**Resolving the Bug:** "Anyone is open to making a PR for this issue." (or "I plan on making a PR", if Trummler edits the CSVs directly)

## Issue 2 (draft): missing German form names

Missing data rather than wrong data, so a separate issue. In `pokemon_form_names.csv`, these forms have English and French names but no German row (language 6). The Paldean Tauros forms are covered by #1401.
- **Alcremie:** 54 of the 63 forms have no German name. The 9 Strawberry Sweet forms do have one, but it names only the cream: *Pokusan (Ruby-Creme)* does not say which sweet.
- **Generation 9:**
  - Oinkologne ♂/♀, Maushold, Squawkabilly ×4
  - Palafin ×2, Tatsugiri ×3, Dudunsparce ×2
  - Gimmighoul ×2, Koraidon ×5, Miraidon ×5
  - Paldean Wooper, Terapagos
- **Generation 8 legends:** Enamorus Incarnate, Basculegion ♂.

German names for the Generation 9 forms, from Pokéwiki:
- Palafin: *Alltagsform* / *Heldenform*
- Maushold: *Viererfamilie* / *Dreierfamilie*
- Tatsugiri: *Gebogene* / *Hängende* / *Gestreckte Form*
- Dudunsparce: *Zweisegmentform* / *Dreisegmentform*
- Poltchageist: *Imitationsform* / *Kostbarkeitsform*
- Sinistcha: *Simple Form* / *Edle Form*

The rest still needs looking up before this goes out.

## Not errors

- **Duplicate names for Zygarde's forms.** `zygarde-10` and `zygarde-10-power-construct` carry the same name, and so do the 50% forms. They differ only by ability, so the shared name is by design.
- **Taiwanese characters such as 岩, 后, 托.** Characters like these in the zh-Hant species names (尼多后, 隆隆岩, 洛托姆) are the official Taiwanese names, not Simplified slips. A converter flags them; checking showed them to be right.
