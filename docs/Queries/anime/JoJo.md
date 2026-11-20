# Wikidata Query Analysis: JoJo's Bizarre Adventure

What Wikidata offers for the JoJo topics, and how far it can serve as their source. Planned topics (Trummler, 2026-11-11): Characters and Stands, both split by Part.

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
- ➕[Model: Parts and anime seasons](#model-parts-and-anime-seasons)
- ➕[Characters](#characters)
- ✖️[Stands](#stands)
- [Rules](#rules)

## ➕Model: Parts and anime seasons

**On Wikidata (checked 2026-11-11), the structure is sound; only the labels weren't:**
- The manga *JoJo's Bizarre Adventure* (Q696918) has its nine Parts as *has part(s)* (P527) with *series ordinal* (P1545) 1 to 9, and each Part is *part of the series* (P179) Q696918 with the same ordinal and *follows* / *followed by*: Phantom Blood Q2608646, Battle Tendency Q763781, Stardust Crusaders Q963289, Diamond Is Unbreakable Q3026116, Golden Wind Q2558642, Stone Ocean Q3083883, Steel Ball Run Q2738699, JoJolion Q22343522, The JOJOLands Q116795917.
- The anime series (Q28930028) has six seasons the same way (P179 with ordinal), each *based on* (P144) its Part(s): season 1 Q17053197 (Parts 1 and 2), Stardust Crusaders Q16354846, Diamond Is Unbreakable Q22674161, Golden Wind Q55615102, Stone Ocean Q106570650, Steel Ball Run Q133859292.
- So the **Part index of a character** is the P1545 of the Part its P1441 points to; a season adds nothing the Part doesn't, but it is what marks an anime appearance (see Rules).
- **Labels:** the de labels of the seasons were placeholders ("JoJo’s Bizarre Adventure/Staffel 3"), the Parts had no de label and "Manga-Serie" as description, the it labels of the seasons were descriptions (one with a typo), pt descriptions read "4 Parte do Anime e Mangá Jojo". Batch `2026-11-11_jojo-works-labels.txt` (**pending**, 123 lines): every Part gets "Part N" in its en, de, it and pt description and the aliases *JoJo's Bizarre Adventure Part N* / *JoJo Part N* (en, de); every season the title as de and it label and a description naming the Part it adapts; the ja label of Diamond Is Unbreakable. Golden Wind carries the vandal alias "Valerias favorite part" (en), which QuickStatements can't remove: **a hand edit**.

## ➕Characters

**Source:** the official portal `jojo-portal.com/en/anime/<season>/character/NN/` (Japanese names as text; despite `/en/`, the pages are Japanese) for Stardust Crusaders (32 pages, enemies under their Stand's name, the user's name in the profile), Diamond Is Unbreakable (33), Golden Wind (29), Steel Ball Run (16). Stone Ocean's page loads by script; Parts 1, 2, 8 and 9 have no character pages.
**Batches:** 54 characters of Parts 4, 5 and 7 created 2026-11-11 (imported); `2026-11-11_jojo-characters-edit.txt` (**pending**: Keicho Nijimura, Ghiaccio, Yuya Fungami, Melone, Trish Una); `2026-11-11_jojo-part3-users-create.txt` (**pending**, CREATE, the 23 Stand users of Part 3 without an item, Daniel J. D'Arby to Cameo); `2026-11-11_jojo-anime-links.txt` (**pending**, 37 lines: the anime season, and the Part where missing, for the older items the portal lists). Every character created here has P1441 to its Part *and* its season, with the portal page as source.
**Left:** Parts 1, 2, 6, 8 and 9 have no official per-character page (Stone Ocean's loads by script): research `_data/Prompts/JoJo_Parts_1_2_6_8_9_Characters.md`.

## ✖️Stands

**On Wikidata (2026-11-11): none.** *Stand* (Q2294863) exists, but no item is an instance of it, and it is itself typed an instance of *superpower*.
**Model** (as *Devil Fruit*, Q1156774, is built): *Stand* becomes a class, P279 *superpower* (Q1047698), batch `2026-11-11_jojo-stand-class.txt` (**pending**, 1 line; dropping its P31 is asked in `_data/Wikidata/Persona_And_Power_Items.md`). Each Stand: P31 *Stand*, P1441 the Part(s) and season(s) it appears in. Its user links it by *superhuman feature or ability* (P2563), whose value-type constraint accepts any subclass of *superpower*.
**Source:** each portal page names its character's Stand (`<h3 data-type="STAND NAME">`, Steel Ball Run `stand-name-ja`) with a description ("仗助のスタンド。…"): 86 Stands from 87 pages.
**Batch:** `2026-11-11_jojo-stands-create.txt` (**pending, CREATE**, 86 Stands; the class batch is imported): en label (the original band and song names, the manga canon), ja label and ja *official name* (P1448) from the page, P31 *Stand* and P1441 per Part and season with the page as source. *Echoes* is one item (the page shows ACT3, kept as ja alias). **Follow-up after the import:** P2563 from each user to its Stand (the mapping: `_data/jojo/stands.json`, page => user => Stands; `sten.tsv` the en names; it needs the new QIDs).
**Localized names** (Trummler, 2026-11-11: the app offers manga-canon or localized names, and the localized ones belong in a statement, not an alias): the English anime renamed many Stands for copyright reasons (*Sticky Fingers* => *Zipper Man*). Model: the label keeps the original; each English name is *official name* (P1448, en) with the qualifier *applies to work* (P10663) = the anime season or the VIZ manga it is used in. P10663 is an allowed qualifier of P1448 and already used about 190 times on character names (*nickname*, P1449); the build picks the P1448 whose P10663 is an anime work, else the label. **Done (2026-11-11):** the research answer was a lead only (anime and VIZ columns nearly always identical, several wrong); the names come from jojowiki's infobox field `engname`, whose variants carry a release tag (`_data/Prompts/done/JoJo_Localized_Names.md`, Reading 1). Labels follow jojowiki's canonical names (*Super Fly*, *Little Feet*, *Tohth*, *Death Thirteen*, *Telence T. D'Arby*, *Chaka*), the three *Tomb of the Boom* Stands are one. Batches `2026-11-11_jojo-stands-create_PRE2.txt` (84 Stands, 90 localized names) and `2026-11-11_jojo-part3-users-create_PRE2.txt` (23 users, 22 localized names); the users' P2563 follows as `backlog/2026-11-11_POST2_jojo-stand-users.txt`. German names: research `_data/Prompts/German_Names_JoJo_MHA.md`.
**Open:** Stands of Parts 1 to 2 (none: Ripple users), 6, 8 and 9: research `_data/Prompts/JoJo_Parts_1_2_6_8_9_Characters.md`.

## Rules

- **Part filter:** a box per Part (Trummler, 2026-11-11), read from P1441 => Part => its P1545; an entry shows when any ticked Part holds it.
- **`manga-only`** (as designed for Dragon Ball, `anime/Dragon_Ball.md`): no P1441 to an anime work of the franchise. For JoJo the anime works are the **seasons** (P31 *anime television series season*, Q100269041), which the Dragon Ball class list (series, film, OVA, special) doesn't hold: the rule's class list gains Q100269041. With the anime links batch, every character of the portal has its season; Parts 8 and 9 (no anime) are manga-only by definition, and characters of Parts 1 to 7 that the anime cut need no extra statement, as they simply lack the season.
- **QoL (Trummler's idea, for #35):** ticking a Part that has no anime (8, 9) switches `manga-only` on; switching `manga-only` off unticks those Parts. The set "Parts without anime" needn't be kept by hand: a Part no season is *based on* (P144) is one.
- The same pattern holds for One Piece, Dragon Ball and Naruto with Boruto (manga chapters beyond the anime); each needs its anime works typed and linked.

## [to Navigation](#navigation)
