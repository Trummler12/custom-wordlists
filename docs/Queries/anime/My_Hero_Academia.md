# Wikidata Query Analysis: My Hero Academia

What Wikidata offers for the My Hero Academia topics, and how far it can serve as their source. Planned topics (Trummler, 2026-11-11): Characters (with a hero / villain filter) and Quirks; *Vigilantes* as an omitted rule.

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Navigation

[Anime](../README.md#anime)
- ➕[Characters](#characters)
- ✖️[Quirks](#quirks)
- [Names: hero name and civil name](#names-hero-name-and-civil-name)
- [Rules](#rules)

## ➕Characters

**Sources:** the official anime site `heroaca.com/character/chara_groupNN/NN-NN/` (125 pages: name, CV, birthday, height, Quirk, a short profile; the group in the URL: 01 Class 1-A, 02 Class 1-B, 03 other U.A. students, 04 U.A. teachers / pro heroes, 05 pro heroes, 06 villains, 09 Shiketsu, 10 Ketsubutsu, 11 police, 12 civilians, 14 One For All holders) and the *Vigilantes* anime site `vigilante-anime.com/character/` (46 entries, with English names, the civil name of the heroes and their Quirk).
**Works:** manga Q18047903, anime Q63686324, universe Q104884320; *Vigilantes* manga Q106091435, anime Q131534559.
**Batches:** 94 characters created 2026-11-11 (imported), `2026-11-11_mha-characters-links.txt` (**pending**). New:
- `2026-11-11_mha-characters-attributes-1.txt` to `-3.txt` (**pending**, 294 lines): **role** by the site's group as *occupation* (P106), as the existing items have it: *superhero* (Q188784) for groups 04 and 05, the series' own *villain* (Q134970729, subclass of *fictional criminal*) for 06, *high school student* (Q15360275) for 01 to 03, 09, 10, *police officer* for 11, with the group page as source; birthday (P3150, the day item) and height (P2048, cm) from the character's page.
- `2026-11-11_mha-vigilantes-create.txt` (**pending**, CREATE, 33): the *Vigilantes* characters without an item (Koichi Haimawari, Pop Step, Knuckle Duster …, the Three Sturm und Drang Brothers as a group), P1441 the *Vigilantes* manga and anime, English labels from the site; ja labels only where the site gives the full name. **Tensei Iida** is the Ingenium of *Vigilantes*; *Ingenium* is an alias of Tenya Ida (Q137204821) on Wikidata, rightly too (he takes the name later), so Tensei gets his own item.
- `2026-11-11_mha-vigilantes-links.txt` (**pending**, 24 lines): the *Vigilantes* works on Eraser Head, All Might, Present Mic, Midnight, Fat Gum, Naomasa Tsukauchi and Stain; the civil names the site states as *birth name* (P1477): Fat Gum 豊満太志郎, All Might 八木俊典, Present Mic *Hizashi Yamada*, Midnight *Nemuri Kayama*; *Stendhal* as alias of Stain.

## ✖️Quirks

**On Wikidata:** no *Quirk* class (Q1247910 is a disambiguation page); 11 characters carry P2563 with generic powers (*superhuman speed*, *pyrokinesis*), which stay.
**Model:** as for JoJo's Stands (`anime/JoJo.md`): a class *Quirk*, P279 *superpower*, P1080 the universe; each Quirk an item, P1441 manga and anime; its user links it by P2563.
**Batches:** `2026-11-11_mha-quirks-create-1.txt` (the class first) and `-2.txt` (**pending, CREATE, one after the other**, 109 items): ja name from the page (with the ruby reading as alias, *無重力* => ゼログラビティ), en name from the English release. One For All and All For One are Quirks as well as names (All For One also a character item). **Follow-up:** `2026-11-11_mha-quirk-users.txt` (224 lines: P31 *Quirk* Q142113697 on each Quirk and P2563 from each user) (both need the new QIDs; data: `_data/mha/mha5.json` per page with group, birthday, height, Quirks; `qen.tsv` the en Quirk names; `vig.json` the Vigilantes site); One For All goes to its nine holders, and the holders' own Quirks (Float, Blackwhip …) to each.

## Names: hero name and civil name

One item per character, as most items do now (Trummler, 2026-11-11, doubting two items): the label is the name the official site uses (hero name for pros and villains, civil name for students), the other name an alias; the hero name as *pseudonym* (P742, 7 items use it), the civil name as *birth name* (P1477). One exception exists: *All Might* (Q63109256) and *Toshinori Yagi* (Q134950840) are two items.
**All Might / Toshinori (2026-11-13):** no merge. Both items carry an enwiki sitelink, and Wikidata keeps an item per Wikipedia article (WD:Bonnie and Clyde; the Darth Vader / Anakin Skywalker merge request of 2023 was declined for this reason). Wikidata's practice for such pairs is the Superman (Q79015) / Clark Kent (Q867810) one: two items with *said to be the same as* (P460) both ways; alter-ego items elsewhere also carry P31 *alter ego* with *characteristic of* the main item (Hannah Montana Q85968389). Batch `2026-11-13_alter-ego-links.txt`: P460 both ways, P742 *All Might* on Toshinori; the same for Miley Stewart / Hannah Montana (and her de label without the disambiguator *(Figur)*). The general person / persona question was posted on WikiProject Narration on 2026-11-13 and stays open for the other heroes (`_data/Wikidata/Persona_And_Power_Items.md`).
**Aliases (2026-11-13):** the other name was an alias on few items (Mr. Compress had his hero name twice, his civil name not at all; *Mount Lady* is found only as *Mt. Lady*). `2026-11-13_mha-name-aliases.txt` adds every P1477 and P742 value missing from labels and aliases, en and ja (108 aliases), and fixes Best Jeanist: his P742 had a kanji 二 for the katakana ニ (copied from the wiki in `2026-11-11_mha-character-names.txt`, the only such lookalike in all batches), and his ja label was the kana reading of his civil name.
**Done (2026-11-11):** batch `2026-11-11_mha-character-names.txt` from the My Hero Academia Wiki's infoboxes (the research answer cited a placeholder page; `_data/Prompts/done/MHA_Hero_And_Civil_Names.md`): P1477 for 92, P742 for 94. Given and family name (P735 / P734): `backlog/2026-11-11_mha-name-parts.txt`, to be replaced by the run below.
**Name parts (in progress, 2026-11-13; Trummler: each part gets its own item):**
- **The split:** all 105 names split into family and given name with their kana reading, from the Fandom infobox ruby (`_data/mha/name-split.json`).
- **First match** against existing name items (same kanji and reading): 45 found. *Ming* (Q26986583) and *Guan* (Q1930521) are Chinese name items and are excluded. 庄田 => *Shōda* (Q27263559).
- **Second pass** (romaji search, so no real name item gets a duplicate): `_scripts/mha-names/np3.mjs`. It found no further match for the 161 others. The romaji items exist (*Katsuki* has seven), but none with the character's kanji and reading.
- **Batches** (`np4.mjs`):
  - `2026-11-13_mha-name-parts-existing-2.txt` (30 lines): the links to existing items not yet set, plus the alias *Mount Lady*.
  - `2026-11-13_mha-name-items-create_PRE7.txt` (CREATE, 161 items): each a Japanese family or given name, the given names by gender from their bearers, with kanji (P1705), kana (P1814) and script.
  - `backlog/2026-11-13_POST7_mha-name-parts-new.txt` (placeholder for the links).

  The old `backlog/2026-11-11_mha-name-parts.txt` is replaced. German names: research `_data/Prompts/German_Names_JoJo_MHA.md`.

## Rules

- **Hero / villain filter:** from P106 (*superhero* / *villain*), after the attributes batch. Students sit between: they are heroes in training (several items already carry *superhero* too).
- **`vigilantes` (omitted):** entries whose P1441 holds a *Vigilantes* work but neither the main manga nor the anime. Tensei Iida and Oboro Shirakumo appear in the main story too, but only the *Vigilantes* site names them; they need a P1441 to the main works with a source before the rule is right for them.
- Quirks follow their users: a Quirk is *Vigilantes*-only when all its users are.

## [to Navigation](#navigation)
