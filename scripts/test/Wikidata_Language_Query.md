# Wikidata Language Types Overlap Analysis

## Query

```sql
# COMMENT OUT A:
# SELECT ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto ?Count ?InspectItems WHERE {
SELECT   ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto ?Count ?InspectItems WHERE {
  {
# COMMENT OUT B:
#   SELECT ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto (COUNT(DISTINCT ?lang) AS ?Count) (GROUP_CONCAT(DISTINCT ?conditionalStr; SEPARATOR=", ") AS ?rawInspect) WHERE {
    SELECT ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto (COUNT(DISTINCT ?lang) AS ?Count) (GROUP_CONCAT(DISTINCT ?conditionalStr; SEPARATOR=", ") AS ?rawInspect) WHERE {
      {
        SELECT ?lang
          (MAX(?langLabel) AS ?finalLabel)
          (SAMPLE(?isQid) AS ?qid)
# COMMENT OUT C:
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
          # Schalter: (1 1 1) = Alle aktiv | (0 0 0) = Human, Modern, Natural deaktiviert
          VALUES (?useHuman ?useModern ?useNatural) { (1 1 1) }
          
          ?lang wdt:P31/wdt:P279* ?type .
# COMMENT OUT D:
#         VALUES ?type { wd:Q20162172 wd:Q1288568 wd:Q33742 wd:Q45762 wd:Q38058796 wd:Q3247505 wd:Q33215 wd:Q2315359 wd:Q206577 }
          VALUES ?type { wd:Q20162172 wd:Q1288568 wd:Q33742 wd:Q45762 wd:Q38058796 wd:Q3247505 wd:Q33215 wd:Q2315359 wd:Q206577 }
          
          BIND(STRAFTER(STR(?lang), "http://www.wikidata.org/entity/") AS ?isQid)
          
# COMMENT OUT E:
          BIND(IF(?useHuman = 1,  IF(?type = wd:Q20162172, "Yes", "No"), "N/A") AS ?isHuman)
          BIND(IF(?useModern = 1, IF(?type = wd:Q1288568,  "Yes", "No"), "N/A") AS ?isModern)
          BIND(IF(?useNatural = 1,IF(?type = wd:Q33742,   "Yes", "No"), "N/A") AS ?isNatural)
          
          BIND(IF(?type = wd:Q45762,   "Yes", "No") AS ?isDead)
          BIND(IF(?type = wd:Q38058796, "Yes", "No") AS ?isExtinct)
          BIND(IF(?type = wd:Q3247505,  "Yes", "No") AS ?isArtificial)
          BIND(IF(?type = wd:Q33215,    "Yes", "No") AS ?isConstructed)
          BIND(IF(?type = wd:Q2315359,  "Yes", "No") AS ?isHistorical)
          BIND(IF(?type = wd:Q206577,   "Yes", "No") AS ?isProto)
          
          OPTIONAL { ?lang rdfs:label ?labelEn . FILTER(LANG(?labelEn) = "en") }
          BIND(COALESCE(?labelEn, "No Label") AS ?langLabel)
        } GROUP BY ?lang
      }
      
# COMMENT OUT F:
#     BIND(CONCAT(?Human, ?Modern, ?Natural, ?Dead, ?Extinct, ?Artificial, ?Constructed, ?Historical, ?Proto) AS ?mask)
      BIND(CONCAT(?Human, ?Modern, ?Natural, ?Dead, ?Extinct, ?Artificial, ?Constructed, ?Historical, ?Proto) AS ?mask)
      
      BIND(IF(?mask IN (
        # --- 9D Muster (Aktiv bei (1 1 1)) ---
        "YesYesNoNoNoNoNoNoNo",
        "YesYesYesNoNoNoNoNoNo",
        "NoNoNoNoNoYesYesNoNo",
        "YesNoNoYesYesNoNoNoNo",
        "YesNoNoNoNoNoNoNoNo",
        "YesNoNoNoNoNoNoYesYes",
        "YesNoYesNoNoNoNoNoNo",
        "YesNoNoNoNoNoNoYesNo",
        "YesNoNoYesNoNoNoNoNo",
        "YesNoYesYesYesNoNoNoNo",
        "YesNoNoYesNoNoNoYesNo",
        "YesNoNoYesYesNoNoYesNo",
        "YesYesNoYesYesNoNoNoNo",
        
        # --- 6D Muster (Aktiv bei (0 0 0) bzw. wenn Human/Modern/Natural "N/A" sind) ---
        "N/AN/AN/ANoNoNoNoNoNo",
        "N/AN/AN/ANoNoYesYesNoNo",
        "N/AN/AN/AYesYesNoNoNoNo",
        "N/AN/AN/ANoNoNoNoYesYes",
        "N/AN/AN/ANoNoNoNoYesNo",
        "N/AN/AN/AYesNoNoNoNoNo",
        "N/AN/AN/AYesNoNoNoYesNo",
        "N/AN/AN/AYesYesNoNoYesNo"
      ), "", "Fetch") AS ?shouldFetch)

      BIND(IF(?shouldFetch = "Fetch", CONCAT(?finalLabel, " (", ?qid, ")"), "") AS ?conditionalStr)
# COMMENT OUT G:
#   } GROUP BY ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto
    } GROUP BY ?Human ?Modern ?Natural ?Dead ?Extinct ?Artificial ?Constructed ?Historical ?Proto
  }
  BIND(IF(?Count < 20, STR(?rawInspect), "") AS ?InspectItems)
} ORDER BY DESC(?Count)
```

## URL

https://query.wikidata.org/

## Results

### Small

| Dead | Extinct | Artificial | Constructed | Historical | Proto | Count | InspectItems |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Yes | Yes | No  | No  | No  | No  | 810 |  |
| No  | No  | Yes | Yes | No  | No  | 727 |  |
| No  | No  | No  | No  | Yes | Yes | 347 |  |
| No  | No  | No  | No  | Yes | No  | 168 |  |
| Yes | No  | No  | No  | No  | No  | 124 |  |
| Yes | No  | No  | No  | Yes | No  | 67 |  |
| Yes | Yes | No  | No  | Yes | No  | 61 |  |
| No  | No  | Yes | No  | No  | No  | 4 | Cyrillic English (Q120794107), Alician (Q126459855), Philosophical language (Q30892291), Yerkish (Q153630) |
| Yes | Yes | No  | No  | Yes | Yes | 2 | Proto-Italic (Q17102720), Proto-Indo-European (Q37178) |
| Yes | No  | No  | No  | Yes | Yes | 2 | Jōmon (Q120487727), Proto-Oghuz (Q20476512) |
| Yes | Yes | Yes | Yes | No  | No  | 1 | Labur (Q115321951) |

### Natural

| Natural | Dead | Extinct | Artificial | Constructed | Historical | Proto | Count | InspectItems |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Yes | No  | No  | No  | No  | No  | No  | 1213 |  |
| No  | Yes | Yes | No  | No  | No  | No  | 735 |  |
| No  | No  | No  | Yes | Yes | No  | No  | 722 |  |
| No  | No  | No  | No  | No  | Yes | Yes | 347 |  |
| No  | No  | No  | No  | No  | Yes | No  | 152 |  |
| No  | Yes | No  | No  | No  | No  | No  | 109 |  |
| Yes | Yes | Yes | No  | No  | No  | No  | 75 |  |
| No  | Yes | No  | No  | No  | Yes | No  | 64 |  |
| No  | Yes | Yes | No  | No  | Yes | No  | 52 |  |
| Yes | No  | No  | No  | No  | Yes | No  | 16 | Navarro-Aragonese (Q2736184), Middle Low German (Q505674), Ugaritic (Q36928), Syriac (Q33538), Middle Persian (Q32063), Old Bengali (Q113559926), Middle Dutch (Q178806), Old Welsh (Q2266723), Telengit (Q3517319), Lemnian (Q36203), Raetic (Q36689), Old Kerinci (Q117273410), Sahaskriti (Q9332749), Sant Bhasha (Q7419081), Old Persian (Q35225), Old Dutch (Q443089) |
| Yes | Yes | No  | No  | No  | No  | No  | 15 | Navarrese Romance (Q3574226), Old Riojan (Q3574262), Mator (Q36453), Livonian (Q33698), Oroch (Q33650), Plains Apache (Q27861), Chukotka Pidgin English (Q139413736), Algonquian–Basque pidgin (Q2886400), Valencian Aragonese (Q940521), Ebro Valley Aragonese (Q13048399), Miami-Illinois (Q56523), Holikachuk (Q28508), Yokohama Pidgin Japanese (Q8054636), Community of Villages Aragonese (Q5851357), Unami (Q3549180) |
| Yes | Yes | Yes | No  | No  | Yes | No  | 9 | Middle High German (Q837985), Urartian (Q36934), Old English (Q42365), Frankish (Q10860505), Old Cham (Q105197086), Tangut (Q2727930), Suebian (Q134600275), Old Lombard (Q97165320), Hurrian (Q35740) |
| Yes | No  | No  | Yes | Yes | No  | No  | 5 | Minionese (Q113510137), Viossa (Q115780261), Belter Creole (Q108055510), Scottish Cant (Q3915671), Efatese (Q16977033) |
| No  | No  | No  | Yes | No  | No  | No  | 4 | Philosophical language (Q30892291), Alician (Q126459855), Yerkish (Q153630), Cyrillic English (Q120794107) |
| Yes | Yes | No  | No  | No  | Yes | No  | 3 | Middle Welsh (Q2487263), Classical Nahuatl (Q559242), Anglo-Norman (Q35214) |
| No  | Yes | Yes | No  | No  | Yes | Yes | 2 | Proto-Indo-European (Q37178), Proto-Italic (Q17102720) |
| Yes | Yes | No  | No  | No  | Yes | Yes | 1 | Jōmon (Q120487727) |
| No  | Yes | No  | No  | No  | Yes | Yes | 1 | Proto-Oghuz (Q20476512) |
| No  | Yes | Yes | Yes | Yes | No  | No  | 1 | Labur (Q115321951) |

#### Inlclusion Table Counts

**Logic**:

| era ▾ \ vitality ▸ | Living | Dead | Extinct |
|---|---|---|---|
| Modern | Natural \ (Dead ∪ Artificial ∪ Historical) | Dead \ (Extinct ∪ Historical) | Extinct \ Historical |
| Historical | Historical \ (Dead ∪ Proto) | (Historical ∩ Dead) \ (Extinct ∪ Proto) | (Extinct ∩ Historical) \ Proto |
| Proto | Proto \ Dead | (Proto ∩ Dead) \ Extinct | Proto ∩ Extinct |

**Inclusive**:
allowed: Natural ∪ (Dead u Artificial u Historical)

| era ▾ \ vitality ▸ | Living | Dead | Extinct |
|---|---|---|---|
| Modern | 1213 | 124 | 810 |
| Historical | 168 | 67 | 61 |
| Proto | 347 | 2 | 2 |

Artificial: 728

**Exclusive**:
allowed: Natural ∩ (Natural u Dead u Artificial u Historical)

| era ▾ \ vitality ▸ | Living | Dead | Extinct |
|---|---|---|---|
| Modern | 1213 | 15 | 75 |
| Historical | 16 | 3 | 9 |
| Proto | 0 | 1 | 0 |

Artificial: 5

### Modern

<Table>

#### Inlclusion Table Counts

**Logic**:

| era ▾ \ vitality ▸ | Living | Dead | Extinct |
|---|---|---|---|
| Modern | Natural \ (Dead ∪ Artificial ∪ Historical) | Dead \ (Extinct ∪ Historical) | Extinct \ Historical |
| Historical | Historical \ (Dead ∪ Proto) | (Historical ∩ Dead) \ (Extinct ∪ Proto) | (Extinct ∩ Historical) \ Proto |
| Proto | Proto \ Dead | (Proto ∩ Dead) \ Extinct | Proto ∩ Extinct |

**Inclusive**:
allowed: Natural ∪ (Dead u Artificial u Historical)

| era ▾ \ vitality ▸ | Living | Dead | Extinct |
|---|---|---|---|
| Modern | 1213 | 124 | 810 |
| Historical | 168 | 67 | 61 |
| Proto | 347 | 2 | 2 |

Artificial: 728

**Exclusive**:
allowed: Natural ∩ (Natural u Dead u Artificial u Historical)

| era ▾ \ vitality ▸ | Living | Dead | Extinct |
|---|---|---|---|
| Modern | 1213 | 15 | 75 |
| Historical | 16 | 3 | 9 |
| Proto | 0 | 1 | 0 |

Artificial: 5

### Large

| Human | Modern | Natural | Dead | Extinct | Artificial | Constructed | Historical | Proto | Count | InspectItems |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Yes | Yes | No  | No  | No  | No  | No  | No  | No  | 6077 |  |
| Yes | Yes | Yes | No  | No  | No  | No  | No  | No  | 970 |  |
| No  | No  | No  | No  | No  | Yes | Yes | No  | No  | 716 |  |
| Yes | No  | No  | Yes | Yes | No  | No  | No  | No  | 686 |  |
| Yes | No  | No  | No  | No  | No  | No  | No  | No  | 544 |  |
| Yes | No  | No  | No  | No  | No  | No  | Yes | Yes | 347 |  |
| Yes | No  | Yes | No  | No  | No  | No  | No  | No  | 243 |  |
| Yes | No  | No  | No  | No  | No  | No  | Yes | No  | 152 |  |
| Yes | No  | No  | Yes | No  | No  | No  | No  | No  | 105 |  |
| Yes | No  | Yes | Yes | Yes | No  | No  | No  | No  | 71 |  |
| Yes | No  | No  | Yes | No  | No  | No  | Yes | No  | 64 |  |
| Yes | No  | No  | Yes | Yes | No  | No  | Yes | No  | 52 |  |
| Yes | Yes | No  | Yes | Yes | No  | No  | No  | No  | 49 |  |
| Yes | No  | Yes | No  | No  | No  | No  | Yes | No  | 16 | Telengit (Q3517319), Middle Dutch (Q178806), Old Dutch (Q443089), Sahaskriti (Q9332749), Navarro-Aragonese (Q2736184), Middle Low German (Q505674), Sant Bhasha (Q7419081), Old Welsh (Q2266723), Middle Persian (Q32063), Old Kerinci (Q117273410), Lemnian (Q36203), Ugaritic (Q36928), Old Bengali (Q113559926), Syriac (Q33538), Old Persian (Q35225), Raetic (Q36689) |
| Yes | No  | Yes | Yes | No  | No  | No  | No  | No  | 12 | Algonquian–Basque pidgin (Q2886400), Valencian Aragonese (Q940521), Unami (Q3549180), Navarrese Romance (Q3574226), Old Riojan (Q3574262), Community of Villages Aragonese (Q5851357), Yokohama Pidgin Japanese (Q8054636), Plains Apache (Q27861), Livonian (Q33698), Ebro Valley Aragonese (Q13048399), Mator (Q36453), Chukotka Pidgin English (Q139413736) |
| Yes | No  | Yes | Yes | Yes | No  | No  | Yes | No  | 9 | Tangut (Q2727930), Middle High German (Q837985), Frankish (Q10860505), Suebian (Q134600275), Old English (Q42365), Old Cham (Q105197086), Urartian (Q36934), Old Lombard (Q97165320), Hurrian (Q35740) |
| Yes | Yes | No  | No  | No  | Yes | Yes | No  | No  | 5 | Eskayan (Q867086), Globasa (Q66311273), Esperanto (Q143), Toki Pona (Q36846), Luka Pona (Q116187421) |
| No  | No  | No  | No  | No  | Yes | No  | No  | No  | 4 | Yerkish (Q153630), Philosophical language (Q30892291), Cyrillic English (Q120794107), Alician (Q126459855) |
| Yes | No  | Yes | No  | No  | Yes | Yes | No  | No  | 4 | Efatese (Q16977033), Belter Creole (Q108055510), Minionese (Q113510137), Viossa (Q115780261) |
| Yes | Yes | No  | Yes | No  | No  | No  | No  | No  | 4 | Cahuarano (Q2933175), Amurdag (Q3360016), Nila (Q7036821), Itza’ (Q35537) |
| Yes | Yes | Yes | Yes | Yes | No  | No  | No  | No  | 4 | Yaghan (Q531826), Thao (Q676492), Kansa (Q3192772), Western Yiddish (Q6593714) |
| Yes | No  | Yes | Yes | No  | No  | No  | Yes | No  | 3 | Middle Welsh (Q2487263), Classical Nahuatl (Q559242), Anglo-Norman (Q35214) |
| Yes | Yes | Yes | Yes | No  | No  | No  | No  | No  | 3 | Holikachuk (Q28508), Oroch (Q33650), Miami-Illinois (Q56523) |
| Yes | No  | No  | Yes | Yes | No  | No  | Yes | Yes | 2 | Proto-Indo-European (Q37178), Proto-Italic (Q17102720) |
| Yes | No  | No  | Yes | Yes | Yes | Yes | No  | No  | 1 | Labur (Q115321951) |
| Yes | No  | No  | Yes | No  | No  | No  | Yes | Yes | 1 | Proto-Oghuz (Q20476512) |
| Yes | No  | No  | No  | No  | Yes | Yes | No  | No  | 1 | Learning English (Q2731224) |
| Yes | No  | Yes | Yes | No  | No  | No  | Yes | Yes | 1 | Jōmon (Q120487727) |
| Yes | Yes | Yes | No  | No  | Yes | Yes | No  | No  | 1 | Scottish Cant (Q3915671) |

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
