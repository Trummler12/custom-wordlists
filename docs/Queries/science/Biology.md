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

- **Batch** `2026-11-05_animal-organs-class.txt` (**pending**): only 29 of the 99 were under *animal organ*; 44 get it, gill and antlers as well as liver and ear (Trummler: if the nose has it, so do they). The rest are plants or general types (*reproductive organ*, *vital organ*) or systems to exclude (*central nervous system*, *gastrointestinal tract*).
- **Human marker:** a few human organs have neither FMA ID nor human subclass (penis, cervix), so the rule needs a short exception list.

**Organelles.** Base: under *organelle* (Q45948), 126 from 5 sitelinks, 66 from 20 (mitochondrion 110, nucleus 105, ribosome 96). A rule for *cellular component* (Q5058355; 495 from 5) only by hand: it holds proteins and tissue as well (hemoglobin, egg yolk, corpus callosum), beside cell wall, plasmid, viral capsid.

- **Exclusions:** the single human chromosomes, *seminal vesicula* (a body part under *vesicle*), *liposome*.
- **Forms of life:** *found in taxon* (P703) doesn't help (29 of 126, nearly all human chromosomes), so the table's rows need a checked list in `data-raw/`, about 40 entries.

**Rating:** minor gaps, all fixable; the table is the larger work.

## ➕Human Bones

**Base:** under *human bone* (Q25513701): 387 items, 67 from 5 sitelinks, and 21 more with the batch. Tiers: sitelinks (rib 110, clavicle 85, scapula 84).

- **Batch** `2026-11-05_human-bones-class.txt`, then `-remove.txt` (**pending**): *human bone* on humerus, sternum, patella, fibula, the ossicles, ilium, ischium, pubic bone and others that sat only under *bone*; the superclass goes where it stood directly.
- **Modelling (Trummler's rule):** *human bone* for what humans have. Strictly, a subclass claims every humerus is human, but Wikidata has modelled femur and tibia that way all along. [WikiProject Anatomy](https://www.wikidata.org/wiki/Wikidata:WikiProject_Anatomy) leaves species-specific terms open, so nothing official speaks against it.
- **Not human:** *animal bone* (Q111444518) means archaeological remains, so it doesn't fit. Bones humans lack stay under *bone* without FMA ID (pygostyle, baculum, coracoid), mixed with things (ivory, oracle bone), so that would be a rule to read through.
- **Outside on purpose:** *hip bone* is already in. *Pelvis* (Q713102) is a body region, *human skull* (Q9604) a *bone structure* of several bones: no statement to add. If wanted, they join by hand.
- **Exclusions:** the general types FMA also covers: long bone, flat bone, short bone, irregular bone, sesamoid bone, dentin, pterygopalatine fossa.

**Rating:** minor gaps, fixed by the batch.

## Candidates

- **Taxonomy (Trummler, 2026-11-03: long term, after the open design questions):** Dinosaurs, Animals, Plants and Fungi as one full taxonomy, with filters across (which branches) and in depth (which ranks), not as separate lists. Measured so far: genera under Dinosauria 1,562 from 5 sitelinks once birds are out, as Wikidata counts them as dinosaurs (2,490 of the 4,052 genera); species from 50 sitelinks: 360 mammals, 539 birds, 39 reptiles. Open: common names against scientific labels (*Ursus maritimus*); *dog*, *cat* and *horse* are common-name items (Q55983715), not species; the full tree is too big to query at once.

## [to Navigation](#navigation)
