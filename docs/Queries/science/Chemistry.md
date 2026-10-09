# Wikidata Query Analysis: Chemistry

What Wikidata offers for the Chemistry topics, and how far it can serve as their source.

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
- ✅[Chemical Elements](#chemical-elements)

## ✅Chemical Elements

**Elements:** 118  
**[Query](https://w.wiki/V3Aa):**

```
SELECT DISTINCT ?item ?itemLabel WHERE {
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],mul,en". }
  {
    SELECT DISTINCT ?item WHERE {
      ?item p:P31 ?statement0.
      ?statement0 (ps:P31) wd:Q11344.
      MINUS {
        ?item p:P31 ?statement1.
        ?statement1 (ps:P31/(wdt:P279*)) wd:Q1299291.
      }
    }
    LIMIT 2000
  }
}
```
**Results:** 118  
**Rating:** **perfect**

**Check (2026-10-07):** The query above still gives exactly 118. Without its MINUS, *chemical element* has 174 instances: the hypothetical ones it filters out.

**Built by** #35: `scripts/science/{dump-element-names,build-elements}.mjs`, with the query above as membership. The names come from Wikidata; tiers and order stay editorial.  
**Tool:** `_scripts/elements.mjs` (output `_data/elements-run1.txt`).

**Check (2026-10-09):** 118 items, atomic numbers 1 to 118, each once.

**Labels in the build's 30 languages:**
- **No gaps:** every element has a label down every fallback chain.
- **Clean:** no invisible characters, no disambiguators, no stray spaces (the Simplified Chinese left-to-right mark the build strips is gone from Wikidata).
- **Simplified Chinese** comes from `zh` for 8 elements (xenon, neodymium, samarium, gadolinium, terbium, dysprosium, lutetium, rhenium); all 8 are already the simplified characters, so the fallback is harmless.
- **Label against article title:** 88 differ beyond case. Most are a regional standard, not an error: pt labels follow European Portuguese (*arsénio*), ptwiki Brazilian (*Arsênio*); Italian *xeno* and Dutch *titaan* / *uraan* are the standard names beside their articles' *Xenon* / *Titanium* / *Uranium*. Tagalog has no settled chemical names: about 40 tl labels and tlwiki titles disagree, often an English word against a Tagalog form. That needs a Tagalog speaker, not a batch.
- **Errors**, batched: the placeholder names IUPAC replaced in 2016 still stand as labels (tr *ununtriyum* and *ununseptiyum*, da *ununpentium*, tl *Ununquadium* and *ununoctium*); the nl label of zirconium is *zirkoon*, the mineral zircon; fr *prométhéum* is the old spelling of *prométhium*.

**Wikidata batch from this pass** (awaiting import; file in `_data/QuickStatements/`):

| Batch | Edits | What |
| :---- | ----: | :---- |
| `2026-10-09_elements-labels.txt` | 13 | the seven labels above, named as the language's Wikipedia article; the placeholders and the old spelling kept as aliases, *zirkoon* not (it names another thing) |

**Rating:** still perfect for membership; the names were 7 labels short of clean (batched), Tagalog is the one weak language.

## [to Navigation](#navigation)
