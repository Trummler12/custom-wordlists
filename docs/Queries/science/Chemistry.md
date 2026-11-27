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
- ➕[Substance Classes](#substance-classes)
- [Candidates](#candidates)

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

**Wikidata batch from this pass** (imported and checked on the items 2026-10-09):

| Batch | Edits | What |
| :---- | ----: | :---- |
| `2026-10-09_elements-labels.txt` | 13 | the seven labels above, named as the language's Wikipedia article; the placeholders and the old spelling kept as aliases, *zirkoon* not (it names another thing) |

**Second pass (2026-10-20):** `elements.mjs` again (`_data/elements-run2.txt`): 118, no gaps, no invisible characters or disambiguators; the batched labels hold. Label and article title now differ on 81 (88 before), 48 of them in Tagalog. Tagalog is the one open point and needs a source, not a judgement: Researched (2026-10-20, settled; `_data/Prompts/done/Elements_Tagalog_Names.md`, Gemini): there is no official Filipino list of element names (the KWF only sets spelling rules), and Philippine schools teach chemistry in English. The names Gemini then gave are derived from spelling rules, not quoted from a source (*luryo* for curium, *ruterpodyo*), so they can't back a label. The `tl` labels stay as they are until a Tagalog speaker or a printed source settles them. No schema proposal: the element symbol (P246) would be a name form, but not one anyone draws or guesses in skribbl.

**Rating:** still perfect for membership; the names were 7 labels short of clean (batched), Tagalog is the one weak language.

## ➕Substance Classes

Candidate since Trummler, 2026-11-03; promoted 2026-11-23 (#39 takes it into the PR). Base: P31 *structural class of chemical entities* (Q47154513): 5,262 items; 930 from 5 sitelinks, 330 from 20, 108 from 40 (DNA 189, protein 179, alcohols 143, salt 121, amino acid 116, alkane 103). Tiers: sitelinks.

- **More classes:** *imprecise class of chemical entities* (Q74892521: lipid 124, flavonoid 55) and *class of chemical entities with similar applications or functions* (Q56256173: acid, base) belong in; *group or class of chemical substances* (Q17339814) only by hand, as it holds chemical element, mixture and gel beside sugar and polymer.
- **Rules:** element groups (halogens, noble gases: P31 *group*, Q83306) could join as `omittable`. Specialised classes (phenylpropanoid, cerebrosides) fall below the floor, so the floor does that work.

**Second pass (2026-11-23, ready for the topic):**
- **Base:** the union of the three classes, each item once (cephalosporin carries two of them): *structural class of chemical entities* (Q47154513), *imprecise class of chemical entities* (Q74892521), *class of chemical entities with similar applications or functions* (Q56256173). From 5 sitelinks 1,068 (935 structural, 127 by function only), from 10 716, from 20 384, from 40 134, from 80 28, from 120 10.
- **Tiers:** sitelinks in the half-decade steps of the other topics (120, 80, 40, 20, 10, 5).
- **Rule `functional-classes`** (`omittable`, default on): the 127 classes by function only (antibiotic, toxin, pheromone, antioxidant, estrogen, pH indicator, nucleophile, novichok …). They read as substance classes in a quiz, but some lists will want structure only.
- ~~Rule `element-groups`~~ (dropped 2026-11-26: the element groups became the topic *Periodic Groups*, `_Build_Specs.md#periodic-groups`).
- **Exclusion:** *hazardous substances* (Q757138, enwiki *Dangerous goods*): a legal category, not a class of substances.
- **Single compounds:** none mistyped among the 387 from 20 sitelinks. Those with a formula or CAS number are classes with a general formula (tetrose, heptose) or a collective CAS number (lignin, pectin).
- **Labels:** compared with the enwiki titles: only the electrophile was wrong, its label vandalised to *Amymi* on 2026-05-06; restored by `2026-11-23_electrophile-label-restore.txt`. The other differences are synonyms (DNA / deoxyribonucleic acid, folate / vitamin B9).
- **Rating:** ➕, ready once the restore is in.

## Selection options (2026-11-25, Trummler's list; graded solid / worth considering / not supported)

**Substance Classes.** The topic is broader than functional groups: DNA, protein, salt, polymer are classes too. The classes named by a functional group (alcohols, ketones, esters, amines, haloalkanes) are a part of it.
- *Solid:* super- and subgroups as inclusion groups, read from the class tree (P279): *haloalkane* under *halogenated hydrocarbon*, *carboxylic acid* under *organic acid*; fluoro-, chloro-, bromo- and iodoalkanes under the haloalkanes the same way. The build groups by the top classes it meets.
- *Worth considering:* a group per functional group (hydroxy, carbonyl, carboxyl …). The link from class to group is patchy: *ester* and *carboxylic acid* carry it as *has part(s)* (P527 *acyloxy group*, *carboxyl*), *ketone*, *amine*, *haloalkane* don't. ChEBI (whose IDs the classes carry, P683) defines most of them by their group; filling P527 from ChEBI's relations would be a batch.
- German names: the class labels in de (*Alkohole*), which the build already reads.

**Chemical Elements.** **Decided (Trummler, 2026-11-26):** inclusion groups for the everyday categories (alkali … noble gases, transition metals expandable into lanthanides and actinides, metals / metalloids / nonmetals with double membership for the borderline), `synthetic-elements` (95–118) `omitted` in the omission panel; the group names themselves became a topic of their own, *Periodic Groups*. Both: `_Build_Specs.md#chemical-elements-inclusion-groups`. de labels of the columns fixed (`2026-11-26_element-groups-de-labels.txt`). The points below are the earlier analysis; superseded where they differ.
- *Solid:* group (1–18), period and block follow from the atomic number (P1086): no statement needed, the build computes them.
- *Not supported:* metal / metalloid / nonmetal. Only a few elements carry such a class (metal 6, nonmetal 4, metalloid 2), and no standard fixes the metalloids (B, Si, Ge, As, Sb, Te, sometimes Po, At): a hand list in the build, the school convention, is the honest form; a P31 batch would claim more certainty than chemistry has.
- *Worth considering:* *precious* / *noble metals* (3 and 2 elements carry them) and the *platinum group* (6 of 6, complete): a short hand list or a sourced batch.

## Candidates

Science topics from the hub, not approved yet. None left: Substance Classes became a topic (2026-11-23).

## [to Navigation](#navigation)
