# Wikidata Query Analysis: Biology

What Wikidata offers for the Biology topics, and how far it can serve as their source.

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
- ➕[Organs & Organelles](#organs--organelles)
- ➕[Human Bones](#human-bones)
- [Candidates](#candidates)

## ➕Organs & Organelles

**Idea (Trummler, 2026-11-03):** organs and cell components as one topic, chosen in an inclusion table: columns Organs and Organelles, one row per form of life (animals, plants, fungi, protists, bacteria, archaea, viruses), greyed out where a cell doesn't apply, since with single-celled life the line between organ and organelle blurs.

**Organs.** Base: P31 *organ type* (Q103812529), 99 items; tiers by sitelinks (eye 261, heart 256, brain 226).

| Rule | Type | Reads |
| --- | --- | --- |
| `human-organs` | `omittable` | *organ type* with FMA ID (P1402) or a human subclass; *human organ* (Q25449120) exists, under *animal organ* |
| `non-human-animal-organs` | `omittable` | under *animal organ* (Q24060765) without those: gill, antlers, swim bladder, proboscis, elephant's trunk ... |
| `plant-organs` | `omitted` | under *plant organ* (Q24060707), without *fruit* and foods, which sit below it too (apple, rice, banana) |
| `fungal-structures` | `omitted` | under *fungal structure* (Q56883667), 111 (mycelium, hypha, fruiting body); no *fungal organ* exists |

- **Batch** `2026-11-05_animal-organs-class.txt` (live): only 29 of the 99 were under *animal organ*; 44 get it, gill and antlers as well as liver and ear (Trummler: if the nose has it, so do they). The rest are plants or general types (*reproductive organ*, *vital organ*) or systems to exclude (*central nervous system*, *gastrointestinal tract*).
- **Human marker:** a few human organs have neither FMA ID nor human subclass (penis, cervix), so the rule needs a short exception list.

**Organelles.** Base: under *organelle* (Q45948), 126 from 5 sitelinks, 66 from 20 (mitochondrion 110, nucleus 105, ribosome 96). A rule for *cellular component* (Q5058355; 495 from 5) only by hand: it holds proteins and tissue as well (hemoglobin, egg yolk, corpus callosum), beside cell wall, plasmid, viral capsid.

- **Exclusions:** the single human chromosomes, *seminal vesicula* (a body part under *vesicle*), *liposome*.
- **Forms of life:** *found in taxon* (P703) doesn't help (29 of 126, nearly all human chromosomes), so the table's rows need a checked list in `data-raw/`, about 40 entries.

**Second pass (2026-11-23):**
- **Batch in:** the *animal organ* class went in (76 organ types under it now).
- **`human-organs` (rechecked on Trummler's question, 2026-11-23):** the general organs (heart, lung, nose, skin, breast …) are modelled across species; their human counterpart is an item of its own with the FMA ID, under the general one (*human heart* Q2419844 under *heart*). Three counterparts lacked that link: *human brain* Q492038, *human eye* Q430024, *human penis* Q8124 (`2026-11-23_human-organs-subclass.txt`). The rule reads: an FMA ID, or a subclass with one, or a human subclass; no hand list needed then. *Human gut* and *human placenta* (without FMA ID) sit under *intestine* and *placenta* and under *human organ*.
- **Which taxa have an organ (Trummler's question):** Wikidata uses *found in taxon* (P703) on the item itself: heart P703 *animal*, spinal cord *Vertebrata*, nerve net *Xenacoelomorpha*; 57 anatomy items with an UBERON ID carry it. That mirrors UBERON's taxon constraints (*only in taxon*). For cell components the Gene Ontology has the same (*only_in_taxon*, *never_in_taxon*).
- **Organelles, what the base drags in** (under *organelle* by P279+, 110 from 5 sitelinks): Y-chromosome haplogroups (haplogroup A under *human Y chromosome*, the others under A: defensible, a haplogroup being a set of Y chromosomes), artificial chromosomes (yeast, human, P1-derived, balancer: chromosomes indeed), *liposome* (a lipid vesicle), the *Councilman body* (under *apoptotic body*): exclusions of the topic, no errors. *Seminal vesicula* stood under *vesicle* (the cell's membrane sac) besides *gland*: an error, `2026-11-23_seminal-vesicle-class-fix.txt` removes it. *Stereocilia* exists twice (two items).
- **Rule `chromosome-types`** (`omittable`): chromosome kinds and parts (autosome, sex chromosome, X / Y chromosome, chromatid, homologous chromosome, polytene, lampbrush, B, satellite, acrocentric, microchromosome, Barr body, kinetochore), as they crowd the organelles; *chromosome* itself stays.
- **Forms of life:** `_data/science/organelle-forms.tsv` (78 organelles × animals, plants, fungi, protists, bacteria, archaea, viruses): 351 cells from the Gene Ontology (QuickGO: taxon constraints rule a group out, experimental annotations per taxon attest it; protists summed over ten lineages), 94 from the first research answer (marked *), 41 from the second (marked +), 12 from the third (marked #, 2026-11-24); 48 open, for which three rounds found no source. *Found in taxon* (P703) on Wikidata, wanted as complete as sources allow (Trummler, 2026-11-23):
  - **Organelles** (`_data/science/go-p703.mjs` => `2026-11-24_organelles-found-in-taxon.txt`, 118 statements on 58 organelles, after `2026-11-24_discoba-metamonada-ncbi_PRE1.txt`): a GO *only in taxon* constraint narrower than all cellular organisms gives that taxon (source: Gene Ontology, the term's QuickGO page); otherwise every group, and every protist lineage, with experimental annotations of its gene products there (source: GOA, the annotation search). Not taken: Bacteria for *extracellular exosome* and *microvesicle* (bacterial proteins found in the host cell's vesicles, infection proteomics). Found on the way: *mitochondrion* and *plastid* stood as instances of *taxon* (`2026-11-24_organelles-not-taxa.txt`); NCBI 2611352 is *Discoba*, not *Metamonada* as the lineage list had it (fixed), and neither clade had its NCBI ID.
  - **Anatomy** (`_data/science/uberon-p703.mjs` => `2026-11-23_anatomy-found-in-taxon.txt`, 2,415 statements on the items with an UBERON ID): Uberon's narrowest stated taxon (Ubergraph, non-redundant *in taxon*): antler => Cervidae, feather => Theropoda, mammary gland => Mammalia; source: Uberon with the UBERON ID. A positive claim, so incomplete at worst (the heart Uberon describes is the vertebrate one; insects aren't listed), never wrong. Teleostomi and Sauria lacked their NCBI ID on Wikidata: `2026-11-23_teleostomi-sauria-ncbi.txt`.

- **Inclusion groups (Trummler's idea, 2026-11-24, for #39):** one group per form of life (Animals, Plants, Fungi, Protists, Bacteria, Archaea), freely combinable, read from *found in taxon* (P703, below the group's taxon) and the forms-of-life table for the organelles; *Humans* a subgroup of Animals (the FMA ID or a human subclass, as in `human-organs`). Groups overlap (the mitochondrion is in four), which suits inclusion rules, as they only add.

**Rating:** minor gaps, all fixable; the table is the larger work.

## Selection options (2026-11-25, Trummler's list)

**Released 2026-11-26** (`_Build_Specs.md#organs--organelles`, `#bones`): after the inferred-taxon batch, 748 classes under *organ* carry P703 (245 before), bones 119 of 140 (24 before); on the 99 organ types only 9 general types stay unclassified. **Decided (Trummler, 2026-11-26):** *Organs & Organelles*: every kingdom group `omittable` except *Unclassified* (`omitted`); *not safe for work* is an `omitted` group in the **omission panel**. *Bones*: *human bones* `omittable` (the implicit base), *non-human bones* `omitted`. Panel conventions: `_Build_Specs.md` (top).

**Organs & Organelles by kingdom** (Animalia with Humans, Plantae, Fungi, Chromista, Protozoa, Archaea, Bacteria, Unclassified; `_data/science/kingdom-groups.mjs`):
- *Organelles:* the forms-of-life table carries them (48 cells still open). Overlap measured on it: Bacteria and Archaea nearly coincide (Jaccard 0.62; one organelle only in archaea, four only in bacteria), so a joint *Prokaryotes* group is the one merge worth making; the eukaryote groups overlap at 0.46–0.63 but each keeps members of its own. Chromista and Protozoa: the table has *protists*, but GO's lineages map onto Cavalier-Smith's kingdoms (Alveolata, Stramenopiles, Rhizaria, Haptista, Cryptophyceae => Chromista; Euglenozoa, Amoebozoa, Metamonada, Choanoflagellata => Protozoa; Rhodophyta => Plantae), so the split is a mapping in the build. Wikidata's taxon tree rarely passes through *Chromista* (2 of 154), so P703 alone won't give it.
- *Organs:* of 1,450 classes under *organ* from 5 sitelinks, 245 have P703, nearly all Animalia (242), Plantae 3, Fungi 1: **1,205 would be Unclassified**. *Humans:* 789 carry an FMA ID and 745 a TA98 term, both human anatomy, so the build reads *Humans* from them (a P703 *Homo sapiens* on each would be true but crowd the items). Animalia without Humans = the Animalia ones lacking both. *Plantae* is the gap: only 1 organ has a Plant Ontology ID (P13866). Mapping the plant organs (leaf, stem, root, flower, fruit …) to PO would give the ID and P703 *Viridiplantae*: a worthwhile batch, from PO itself.
- **Foods in the organ tree (found 2026-11-25):** *fruit* is a plant organ, so the tree under *organ* takes in 399 classes from 5 sitelinks that are foods, dishes and cultivars (apple varieties such as Cripps Pink and McIntosh, Carnaroli and brown rice, beefsteak tomato, mustard pickle). Proposal for the base: a plant organ only with a Plant Ontology ID; `2026-11-25_plant-ontology.txt` gives 72 plant structures their PO ID and P703 *Viridiplantae* (flower, leaf, root, plant stem, seed, fruit, stamen, petal, sepal, bud, bulb, tuber, bark …), the PO matched by exact name or synonym, ten central ones by hand (PO calls the leaf *vascular leaf*, the cone *strobilus*). That also fills most of the *Plantae* group.
- *Omitted "not safe for work"* (solid): the class tree does it, everything under *sex organ* / *genitalia* (P279*), plus a short hand list for the rest (breast, buttock), as the build's exclusion lists work.

**Inferred taxa (2026-11-25; `_data/science/uberon-p703-inferred.mjs`):** the first Uberon run took only the taxa Uberon states on a term; most terms inherit theirs from a superclass. Ubergraph's inferred *in taxon*, the narrowest per term (one per item where an item holds several UBERON IDs), root taxa left out: `2026-11-25_anatomy-found-in-taxon-inferred.txt`, 3,826 items that had no P703 (Vertebrata 2,710, Craniata 526, Eumetazoa 153, Mammalia 153, Bilateria 66, Metazoa 61 …: eye => Metazoa, liver => Vertebrata, thyroid => Craniata). Broad for some (beard and moustache inherit Vertebrata from the head), still true as positive claims; the *Animalia* group needs no more than that, and *Humans* reads the FMA ID.

**Bones** (rename from Human Bones; groups Animalia, Humans, Unclassified): base *bone* (Q265868) and its tree, 140 classes from 5 sitelinks; *Humans* = under *human bone* or with an FMA ID; P703 on 24 only, all Animalia. Animalia without Humans (pygostyle, baculum, coracoid) needs P703: Uberon gives it where it has the bone, the same method as the anatomy batch.

## ➕Human Bones

**Base:** under *human bone* (Q25513701): 387 items, 67 from 5 sitelinks, and 21 more with the batch. Tiers: sitelinks (rib 110, clavicle 85, scapula 84).

- **Batch** `2026-11-05_human-bones-class.txt`, then `-remove.txt` (live): *human bone* on humerus, sternum, patella, fibula, the ossicles, ilium, ischium, pubic bone and others that sat only under *bone*; the superclass goes where it stood directly.
- **Modelling (Trummler's rule):** *human bone* for what humans have. Strictly, a subclass claims every humerus is human, but Wikidata has modelled femur and tibia that way all along. [WikiProject Anatomy](https://www.wikidata.org/wiki/Wikidata:WikiProject_Anatomy) leaves species-specific terms open, so nothing official speaks against it.
- **Not human:** *animal bone* (Q111444518) means archaeological remains, so it doesn't fit. Bones humans lack stay under *bone* without FMA ID (pygostyle, baculum, coracoid), mixed with things (ivory, oracle bone), so that would be a rule to read through.
- **Outside on purpose:** *hip bone* is already in. *Pelvis* (Q713102) is a body region, *human skull* (Q9604) a *bone structure* of several bones: no statement to add. If wanted, they join by hand.
- **Exclusions:** the general types FMA also covers: long bone, flat bone, short bone, irregular bone, sesamoid bone, dentin, pterygopalatine fossa.

**Checked 2026-11-23:** the batches went in (humerus, sternum, patella, the ossicles … under *human bone*, the direct *bone* removed); 88 bones from 5 sitelinks. Ready for the topic with the exclusions above.

**Rating:** minor gaps, fixed by the batch.

## Candidates

- **Taxonomy (Trummler, 2026-11-03: long term, after the open design questions):** Dinosaurs, Animals, Plants and Fungi as one full taxonomy, with filters across (which branches) and in depth (which ranks), not as separate lists. Measured so far: genera under Dinosauria 1,562 from 5 sitelinks once birds are out, as Wikidata counts them as dinosaurs (2,490 of the 4,052 genera); species from 50 sitelinks: 360 mammals, 539 birds, 39 reptiles. Open: common names against scientific labels (*Ursus maritimus*); *dog*, *cat* and *horse* are common-name items (Q55983715), not species; the full tree is too big to query at once.

## [to Navigation](#navigation)
