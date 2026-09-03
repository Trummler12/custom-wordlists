# Wikidata Language Types Overlap Analysis

## Query

```sql
SELECT ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto ?Count ?InspectItems WHERE {
  {
    SELECT ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto (COUNT(DISTINCT ?lang) AS ?Count) (GROUP_CONCAT(DISTINCT ?conditionalStr; SEPARATOR=", ") AS ?rawInspect) WHERE {
      {
        SELECT ?lang
          (MAX(?langLabel) AS ?finalLabel)
          # 1. FIXED: Explicitly sample and bubble the string up through the group layer
          (SAMPLE(?isQid) AS ?qid)
          (MAX(?isHuman) AS ?Human)
          (MAX(?isModern) AS ?Modern)
          (MAX(?isNatural) AS ?Natural)
          (MAX(?isDead) AS ?Dead)
          (MAX(?isExtinct) AS ?Extinct)
          (MAX(?isArtificial) AS ?Artificial)
          (MAX(?isConstructed) AS ?Constructed)
          (MAX(?isHistorical) AS ?Historical)
          (MAX(?isProto) AS ?Proto)
        WHERE {
          ?lang wdt:P31/wdt:P279* ?type .
          VALUES ?type { wd:Q45762 wd:Q38058796 wd:Q2315359 wd:Q206577 wd:Q3247505 wd:Q33215 wd:Q20162172 wd:Q1288568 wd:Q33742 }
          
          # 2. Extract the QID string natively at the raw node
          BIND(STRAFTER(STR(?lang), "http://www.wikidata.org/entity/") AS ?isQid)
          
          BIND(IF(?type = wd:Q20162172, "Yes", "No") AS ?isHuman)
          BIND(IF(?type = wd:Q1288568, "Yes", "No") AS ?isModern)
          BIND(IF(?type = wd:Q33742, "Yes", "No") AS ?isNatural)
          BIND(IF(?type = wd:Q45762, "Yes", "No") AS ?isDead)
          BIND(IF(?type = wd:Q38058796, "Yes", "No") AS ?isExtinct)
          BIND(IF(?type = wd:Q3247505, "Yes", "No") AS ?isArtificial)
          BIND(IF(?type = wd:Q33215, "Yes", "No") AS ?isConstructed)
          BIND(IF(?type = wd:Q2315359, "Yes", "No") AS ?isHistorical)
          BIND(IF(?type = wd:Q206577, "Yes", "No") AS ?isProto)
          
          OPTIONAL { ?lang rdfs:label ?labelEn . FILTER(LANG(?labelEn) = "en") }
          BIND(COALESCE(?labelEn, "No Label") AS ?langLabel)
        } GROUP BY ?lang
      }
      
      # Exclude the large bulk combinations (>20 entries) to optimize performance
      BIND(IF(
        (?Human="Yes" && ?Modern="Yes" && ?Natural="No" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="Yes" && ?Natural="Yes" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="No" && ?Modern="No" && ?Natural="No" && ?Dead="No" && ?Extinct="No" && ?Artificial="Yes" && ?Constructed="Yes" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="Yes" && ?Extinct="Yes" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="Yes" && ?Proto="Yes") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="Yes" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="Yes" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="Yes" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="Yes" && ?Dead="Yes" && ?Extinct="Yes" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="Yes" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="Yes" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="Yes" && ?Extinct="Yes" && ?Artificial="No" && ?Constructed="No" && ?Historical="Yes" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="Yes" && ?Natural="No" && ?Dead="Yes" && ?Extinct="Yes" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No")
      , "", "Fetch") AS ?shouldFetch)

      # 3. Build the final string safely using variables guaranteed by the group structure
      BIND(IF(?shouldFetch = "Fetch", CONCAT(?finalLabel, " (", ?qid, ")"), "") AS ?conditionalStr)
    } GROUP BY ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto
  }
  BIND(IF(?Count < 20, STR(?rawInspect), "") AS ?InspectItems)
} ORDER BY DESC(?Count)
```

## URL

https://query.wikidata.org/

## Results

| Human | Modern | Natural | Dead | Extinct | Artificial | Constructed | Historical | Proto | Count | InspectItems |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Yes | Yes | No | No | No | No | No | No | No | 6077 |  |
| Yes | Yes | Yes | No | No | No | No | No | No | 970 |  |
| No | No | No | No | No | Yes | Yes | No | No | 716 |  |
| Yes | No | No | Yes | Yes | No | No | No | No | 686 |  |
| Yes | No | No | No | No | No | No | No | No | 544 |  |
| Yes | No | No | No | No | No | No | Yes | Yes | 347 |  |
| Yes | No | Yes | No | No | No | No | No | No | 243 |  |
| Yes | No | No | No | No | No | No | Yes | No | 152 |  |
| Yes | No | No | Yes | No | No | No | No | No | 105 |  |
| Yes | No | Yes | Yes | Yes | No | No | No | No | 71 |  |
| Yes | No | No | Yes | No | No | No | Yes | No | 64 |  |
| Yes | No | No | Yes | Yes | No | No | Yes | No | 52 |  |
| Yes | Yes | No | Yes | Yes | No | No | No | No | 49 |  |
| Yes | No | Yes | No | No | No | No | Yes | No | 16 | Telengit (Q3517319), Middle Dutch (Q178806), Old Dutch (Q443089), Sahaskriti (Q9332749), Navarro-Aragonese (Q2736184), Middle Low German (Q505674), Sant Bhasha (Q7419081), Old Welsh (Q2266723), Middle Persian (Q32063), Old Kerinci (Q117273410), Lemnian (Q36203), Ugaritic (Q36928), Old Bengali (Q113559926), Syriac (Q33538), Old Persian (Q35225), Raetic (Q36689) |
| Yes | No | Yes | Yes | No | No | No | No | No | 12 | Algonquian–Basque pidgin (Q2886400), Valencian Aragonese (Q940521), Unami (Q3549180), Navarrese Romance (Q3574226), Old Riojan (Q3574262), Community of Villages Aragonese (Q5851357), Yokohama Pidgin Japanese (Q8054636), Plains Apache (Q27861), Livonian (Q33698), Ebro Valley Aragonese (Q13048399), Mator (Q36453), Chukotka Pidgin English (Q139413736) |
| Yes | No | Yes | Yes | Yes | No | No | Yes | No | 9 | Tangut (Q2727930), Middle High German (Q837985), Frankish (Q10860505), Suebian (Q134600275), Old English (Q42365), Old Cham (Q105197086), Urartian (Q36934), Old Lombard (Q97165320), Hurrian (Q35740) |
| Yes | Yes | No | No | No | Yes | Yes | No | No | 5 | Eskayan (Q867086), Globasa (Q66311273), Esperanto (Q143), Toki Pona (Q36846), Luka Pona (Q116187421) |
| No | No | No | No | No | Yes | No | No | No | 4 | Yerkish (Q153630), Philosophical language (Q30892291), Cyrillic English (Q120794107), Alician (Q126459855) |
| Yes | No | Yes | No | No | Yes | Yes | No | No | 4 | Efatese (Q16977033), Belter Creole (Q108055510), Minionese (Q113510137), Viossa (Q115780261) |
| Yes | Yes | No | Yes | No | No | No | No | No | 4 | Cahuarano (Q2933175), Amurdag (Q3360016), Nila (Q7036821), Itza’ (Q35537) |
| Yes | Yes | Yes | Yes | Yes | No | No | No | No | 4 | Yaghan (Q531826), Thao (Q676492), Kansa (Q3192772), Western Yiddish (Q6593714) |
| Yes | No | Yes | Yes | No | No | No | Yes | No | 3 | Middle Welsh (Q2487263), Classical Nahuatl (Q559242), Anglo-Norman (Q35214) |
| Yes | Yes | Yes | Yes | No | No | No | No | No | 3 | Holikachuk (Q28508), Oroch (Q33650), Miami-Illinois (Q56523) |
| Yes | No | No | Yes | Yes | No | No | Yes | Yes | 2 | Proto-Indo-European (Q37178), Proto-Italic (Q17102720) |
| Yes | No | No | Yes | Yes | Yes | Yes | No | No | 1 | Labur (Q115321951) |
| Yes | No | No | Yes | No | No | No | Yes | Yes | 1 | Proto-Oghuz (Q20476512) |
| Yes | No | No | No | No | Yes | Yes | No | No | 1 | Learning English (Q2731224) |
| Yes | No | Yes | Yes | No | No | No | Yes | Yes | 1 | Jōmon (Q120487727) |
| Yes | Yes | Yes | No | No | Yes | Yes | No | No | 1 | Scottish Cant (Q3915671) |

## Ordered Results

| Human | Modern | Natural | Dead | Extinct | Artificial | Constructed | Historical | Proto | Count |
|:------|:-------|:--------|:-----|:--------|:-----------|:------------|:-----------|:------|:------|
| Yes   | Yes    | Yes     | No   | No      | No         | No          | No         | No    | 970   |
| Yes   | Yes    | Yes     | No   | No      | Yes        | Yes         | No         | No    | 1     |
| Yes   | Yes    | Yes     | Yes  | No      | No         | No          | No         | No    | 3     |
| Yes   | Yes    | Yes     | Yes  | Yes     | No         | No          | No         | No    | 4     |
| Yes   | Yes    | No      | No   | No      | No         | No          | No         | No    | 6077  |
| Yes   | Yes    | No      | No   | No      | Yes        | Yes         | No         | No    | 5     |
| Yes   | Yes    | No      | Yes  | No      | No         | No          | No         | No    | 4     |
| Yes   | Yes    | No      | Yes  | Yes     | No         | No          | No         | No    | 49    |
| Yes   | No     | Yes     | No   | No      | No         | No          | No         | No    | 243   |
| Yes   | No     | Yes     | No   | No      | No         | No          | Yes        | No    | 16    |
| Yes   | No     | Yes     | No   | No      | Yes        | Yes         | No         | No    | 4     |
| Yes   | No     | Yes     | Yes  | No      | No         | No          | No         | No    | 12    |
| Yes   | No     | Yes     | Yes  | No      | No         | No          | Yes        | No    | 3     |
| Yes   | No     | Yes     | Yes  | No      | No         | No          | Yes        | Yes   | 1     |
| Yes   | No     | Yes     | Yes  | Yes     | No         | No          | No         | No    | 71    |
| Yes   | No     | Yes     | Yes  | Yes     | No         | No          | Yes        | No    | 9     |
| Yes   | No     | No      | No   | No      | No         | No          | No         | No    | 544   |
| Yes   | No     | No      | No   | No      | No         | No          | Yes        | No    | 152   |
| Yes   | No     | No      | No   | No      | No         | No          | Yes        | Yes   | 347   |
| Yes   | No     | No      | No   | No      | Yes        | Yes         | No         | No    | 1     |
| Yes   | No     | No      | Yes  | No      | No         | No          | No         | No    | 105   |
| Yes   | No     | No      | Yes  | No      | No         | No          | Yes        | No    | 64    |
| Yes   | No     | No      | Yes  | No      | No         | No          | Yes        | Yes   | 1     |
| Yes   | No     | No      | Yes  | Yes     | No         | No          | No         | No    | 686   |
| Yes   | No     | No      | Yes  | Yes     | No         | No          | Yes        | No    | 52    |
| Yes   | No     | No      | Yes  | Yes     | No         | No          | Yes        | Yes   | 2     |
| Yes   | No     | No      | Yes  | Yes     | Yes        | Yes         | No         | No    | 1     |
| No    | No     | No      | No   | No      | Yes        | No          | No         | No    | 4     |
| No    | No     | No      | No   | No      | Yes        | Yes         | No         | No    | 716   |











## Query B

```
# COMMENT OUT A:
# SELECT ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto ?Count ?InspectItems WHERE {
SELECT                  ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto ?Count ?InspectItems WHERE {
  {
    SELECT ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto (COUNT(DISTINCT ?lang) AS ?Count) (GROUP_CONCAT(DISTINCT ?conditionalStr; SEPARATOR=", ") AS ?rawInspect) WHERE {
      {
        SELECT ?lang
          (MAX(?langLabel) AS ?finalLabel)
          # 1. FIXED: Explicitly sample and bubble the string up through the group layer
          (SAMPLE(?isQid) AS ?qid)
# COMMENT OUT B:
#          (MAX(?isHuman) AS ?Human)
#          (MAX(?isModern) AS ?Modern)
          (MAX(?isNatural) AS ?Natural)
          (MAX(?isDead) AS ?Dead)
          (MAX(?isExtinct) AS ?Extinct)
          (MAX(?isArtificial) AS ?Artificial)
          (MAX(?isConstructed) AS ?Constructed)
          (MAX(?isHistorical) AS ?Historical)
          (MAX(?isProto) AS ?Proto)
        WHERE {
          ?lang wdt:P31/wdt:P279* ?type .
# COMMENT OUT C:
#         VALUES ?type { wd:Q20162172 wd:Q1288568 wd:Q33742 wd:Q45762 wd:Q38058796 wd:Q3247505 wd:Q33215 wd:Q2315359 wd:Q206577 }
          VALUES ?type {                          wd:Q33742 wd:Q45762 wd:Q38058796 wd:Q3247505 wd:Q33215 wd:Q2315359 wd:Q206577 }
          
          # 2. Extract the QID string natively at the raw node
          BIND(STRAFTER(STR(?lang), "http://www.wikidata.org/entity/") AS ?isQid)

# COMMENT OUT D:
#          BIND(IF(?type = wd:Q20162172, "Yes", "No") AS ?isHuman)
#          BIND(IF(?type = wd:Q1288568, "Yes", "No") AS ?isModern)
          BIND(IF(?type = wd:Q33742, "Yes", "No") AS ?isNatural)
          BIND(IF(?type = wd:Q45762, "Yes", "No") AS ?isDead)
          BIND(IF(?type = wd:Q38058796, "Yes", "No") AS ?isExtinct)
          BIND(IF(?type = wd:Q3247505, "Yes", "No") AS ?isArtificial)
          BIND(IF(?type = wd:Q33215, "Yes", "No") AS ?isConstructed)
          BIND(IF(?type = wd:Q2315359, "Yes", "No") AS ?isHistorical)
          BIND(IF(?type = wd:Q206577, "Yes", "No") AS ?isProto)
          
          OPTIONAL { ?lang rdfs:label ?labelEn . FILTER(LANG(?labelEn) = "en") }
          BIND(COALESCE(?labelEn, "No Label") AS ?langLabel)
        } GROUP BY ?lang
      }
      
      # Exclude the large bulk combinations (>20 entries) to optimize performance
      BIND(IF(
# COMMENT OUT E:
        (?Human="Yes" && ?Modern="Yes" && ?Natural="No" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="Yes" && ?Natural="Yes" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="No" && ?Modern="No" && ?Natural="No" && ?Dead="No" && ?Extinct="No" && ?Artificial="Yes" && ?Constructed="Yes" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="Yes" && ?Extinct="Yes" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="Yes" && ?Proto="Yes") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="Yes" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="No" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="Yes" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="Yes" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="Yes" && ?Dead="Yes" && ?Extinct="Yes" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="Yes" && ?Extinct="No" && ?Artificial="No" && ?Constructed="No" && ?Historical="Yes" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="No" && ?Natural="No" && ?Dead="Yes" && ?Extinct="Yes" && ?Artificial="No" && ?Constructed="No" && ?Historical="Yes" && ?Proto="No") ||
        (?Human="Yes" && ?Modern="Yes" && ?Natural="No" && ?Dead="Yes" && ?Extinct="Yes" && ?Artificial="No" && ?Constructed="No" && ?Historical="No" && ?Proto="No")
      , "", "Fetch") AS ?shouldFetch)

      # 3. Build the final string safely using variables guaranteed by the group structure
      BIND(IF(?shouldFetch = "Fetch", CONCAT(?finalLabel, " (", ?qid, ")"), "") AS ?conditionalStr)
    } GROUP BY ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto
  }
  BIND(IF(?Count < 20, STR(?rawInspect), "") AS ?InspectItems)
} ORDER BY DESC(?Count)
```
