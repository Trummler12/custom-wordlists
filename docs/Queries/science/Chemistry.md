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
- ☑️[Chemical Elements](#️chemical-elements)

## ☑️Chemical Elements

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

## [to Navigation](#navigation)
