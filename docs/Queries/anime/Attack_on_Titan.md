# Wikidata Query Analysis: Attack on Titan

What Wikidata offers for an *Attack on Titan* topic, and what it would take to make it the source. First analysis 2026-11-20, as the next franchise after Naruto (README Anime candidates: Fandom 228, Wikidata 43). No batches yet beyond one label fix; the scope needs Trummler's decision (see [Open](#open)).

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
- [Other topics](#other-topics)
- [Model (proposed)](#model-proposed)
- [Open](#open)

## ➕Characters

**Official source:** the *Attack on Titan Character Encyclopedia FINAL* (進撃の巨人 キャラクター名鑑 FINAL), the sixth and last guidebook of the manga, by Hajime Isayama (Kodansha, 2021-06-09, ISBN 978-4-06-523590-4, 192 pages). It covers every character of the manga down to unnamed soldiers ("Survey Corpsman A"). There is no official online list; the official anime site has character pages per season only for the leads.

**The fan wiki carries it** (`attackontitan.fandom.com`, read through its `api.php`; `_data/aot/aot-chars.mjs` => `aot-chars.json`):
- **197 character pages** with an *Infobox character* (of 215 in Category:Characters; the rest are families, Titan types, encyclopedia pages): Kanji 185, Romaji 185, Species 197 (Human 177, Titan 17, Intelligent Titan 17), Gender 190, Status 195 (Deceased 120, Alive 54), Residence 162, Occupation 127, Rank 54, Affiliation 140 (and former affiliation 47), Relatives 89, Debut chapter 195.
- **160 minor characters** from the encyclopedia, on the wiki's pages *Attack on Titan Character Encyclopedia FINAL/…* (Civilians 58, Survey Corps 35, Military Police Brigade 29, Marleyan military 15, Training Corps 12, Garrison 11), each in a *Minor character* template with Kanji, Romaji, Gender, Residence, Status, Occupation, Affiliation, Debut, and the guidebook page as reference.
- **The wiki is manga-first:** each character page is the manga's; the *Media icons* template links the other works' versions: anime (188 of 197), *Junior High* manga (63) and anime (57), *Spoof on Titan* (52), *Chibi Theater* (29), *Lost Girls* (14), live-action films (9), *No Regrets* (6). So the manga / anime / spin-off split comes for free, unlike Naruto's places.

**Works on Wikidata:** manga Q586025, anime Q22126305, franchise Q106712785, universe Q123784069; live-action film (2015) Q20313191, games (Q21686710, Q48802738 …), *No Regrets* visual novel Q108864941.

**Check (2026-11-20):** 43 items hang on the franchise (P1441 to manga / anime / franchise, or P1080 the universe): 33 of the 197 character pages have an item (Eren, Mikasa, Levi, Armin, Hange, Erwin, Reiner, Annie, Bertolt …), none of the 160 minor characters. The other ten: five of the Nine Titans as "fictional character" (Attack, Cart, Colossal, Female, Jaw), Eldia (country), Subjects of Ymir, Survey Corps (bare: no description), the ODM gear, and a "Chronology of Attack on Titan".
- **Fixed in passing:** *Historia  Reiss* (Q109536771) had a doubled space in its en label: `2026-11-20_aot-historia-label-fix.txt`.

## Other topics

What the infoboxes point to, as for Naruto:
- **Affiliations:** Survey Corps (44 characters), Royal Government (20), Marleyan military (16), Yeagerists (11), Warrior Unit (10), Garrison (9), 104th Training Corps (9 + 19 former), Military Police Brigade (7), squads (Special Operations Squad, Squad Levi …), Nobility (26). Only the Survey Corps has an item.
- **The Nine Titans:** inherited powers (Attack, Armored, Colossal, Female, Beast, Cart, Jaw, War Hammer, Founding); five have items, modelled as characters. Better fit, as for the Stands and Quirks: an ability item each, linked from its holders by *superhuman feature or ability* (P2563) with start / end time, since each passes from holder to holder.
- **Locations:** Walls Maria / Rose / Sina, their districts (Shiganshina, Trost, Stohess, Karanes …), Mitras, the Underground, Paradis Island, Marley, Liberio, Hizuru. Only Eldia has an item.
- **Families:** Category:Families (Yeager, Ackerman, Reiss, Fritz …), as *family* (P53).
- **Ranks:** Commander, Team Leader, Captain, Trainee … (54 characters), as for Naruto by P410 with *fictional military rank*.

## Model (proposed)

Same pattern as Naruto, adjusted to the manga-first wiki:
- **Characters:** P31 *fictional human* (Titans and horses their own class), P1441 the manga (debut chapter as qualifier or reference), the anime where the *Media icons* has an anime entry, the spin-offs where they appear; P21, ja label = Kanji, romaji alias; P1080 the universe; the encyclopedia as reference for the minor ones (guidebook page), the wiki page for the others.
- **Names:** the wiki title is the English (Kodansha) spelling (*Eren Yeager*; the anime's *Jaeger* as alias, from the anime page name).
- **Labels for unnamed minor characters** ("Survey Corpsman A"): the encyclopedia's own name, with the affiliation in the description to tell them apart.
- Then affiliations (P463), families (P53), ranks (P410), residence (P551), the Nine Titans (P2563), locations.

## Batches

- `2026-11-20_aot-historia-label-fix.txt` (root): the doubled space.
- `backlog/2026-11-20_aot-characters-create_PRE6.txt` (`aot-batch.mjs`; **held until the scope is decided**): the 160 character pages without item (34 have one; the two horses wait for a class), after the existing items' pattern: P31 *manga character*, *anime character* where the anime icon is there, *fictional human* for the humans, *film character* for the live-action ones; P21, P1441 manga / anime, ja label Kanji, romaji and *Other spellings* as aliases (not *Alternate names*, which holds descriptions such as "Mikasa's father"), labels in de / fr / es / it from the language links (a name two characters share in one language as alias), Fandom ID, P1080 the universe. **Sources (2026-11-23, after the notability note on the Naruto items):** the debut chapter as *stated in* the manga with *volume* and *chapter* (148 of 160, from each chapter page's infobox). The wiki cites official guidebooks by code (`{{ref|g = N|p = …}}`: *Character Encyclopedia* 190, *Guidebook INSIDE & OUTSIDE* 123, *Character Encyclopedia FINAL* 69, *ANSWERS* 62): these become items next, and their pages the source for the characters and for the 160 minor ones. 18 of the 160 have no name of their own and go by their page title (*Reiner's father*, *Kenny's grandfather*).

- `2026-11-23_aot-guidebooks-create_PRE8.txt`: the six official guidebooks the wiki cites by code (*INSIDE Kou*, *OUTSIDE Kou*, the English *Guidebook*, *ANSWERS*, *Character Encyclopedia*, *Character Encyclopedia FINAL*; Kodansha, Hajime Isayama), with ISBN, dates, pages.
- `backlog/…_POST8_aot-minor-characters-create.txt` and `…_POST8_aot-guidebook-references.txt` (`aot-post8.mjs`, after PRE6 and PRE8): the 160 minor characters, each with its encyclopedia page and debut chapter as source and its section in the description (*minor character from Attack on Titan, member of the Survey Corps*); and the guidebook pages as source on the characters with a page.
- `2026-11-23_aot-nine-titans_PRE9.txt` (`titans.mjs`): the class *Nine Titans*, the four powers without item (Armored, Beast, War Hammer, Founding), the five existing ones turned from characters into powers (their character classes removed, description, Fandom ID; *Colossus Titan*, the manga's name, as alias of the Colossal Titan). `backlog/…_POST9_aot-titan-holders.txt` (`titans.mjs --post`): P31 *Nine Titans* on all nine, and each inheritor's P2563 with P7528 (spoiler for the manga), from each power's infobox (current and former inheritors: 21 holder statements).

- `2026-11-23_aot-organisations-places-create_PRE3.txt` (`aot-world.mjs`): the wiki's Category:Organizations (17, the *Junior High* one left out) and Category:Locations with Districts (Wall Maria / Rose / Sina, Trost, Shiganshina, Liberio, Fort Salta …): 48 CREATEs as *fictional organization*, *fictional country* (Eldia, Marley, Hizuru) or *fictional place*, ja label, romaji, labels in de / fr / es / it from the language links (the German wiki's one page *Militär* for two of ours as alias), the debut chapter as source (44). The existing *Survey Corps* (bare) and *Eldia* get descriptions, Fandom ID, universe.
- `backlog/…_POST3_aot-places-memberships.txt` (`aot-post3.mjs --write`, after PRE3 and PRE6): *located in* (P131) from each place's *Territory*; each character's residence (P551) and memberships (P463; former ones with an unknown end time). **Spoiler-marked (P7528, to review):** memberships of the *Warrior Unit*, the *Eldian Restorationists*, the *Yeagerists* and the *Anti-Marleyan Volunteers*, as they give away turns of the plot. Squads (Special Operations Squad, Squad Levi …) have no item yet and stay out.

- `2026-11-23_aot-walls-squads-create_PRE4.txt` (`aot-pre4.mjs`): what the characters' fields name but the categories lack: the three Walls (their own names redirect to the *Walls* page; Japanese names from its sections), the 104th and 109th Training Corps, nine squads and units (Special Operations Squad, Squad Mike …), each *part of* its parent where the page names one. Then POST3.
- `2026-11-23_aot-character-fandom-ids.txt`: the Fandom ID for the characters that had an item before; until then the follow-ups find them by label (`resolve-aot.mjs`).
- Released 2026-11-23 (evening), all PREs imported: `2026-11-23_aot-relatives-families-ranks.txt` (held back on Trummler's review and rebuilt, 631 lines: the *Titan* and *Abnormal* pages no longer taken as characters; the kind read from the link text where the brackets only say "deceased"; cousin, 2nd wife, concubine, former lover, adoptive daughter mapped; a bare *relative* dropped beside a closer relation; every relation and family of Zeke and Dina a spoiler, 79 marks) and `2026-11-23_aot-minor-character-links.txt` (281 lines; the wiki's *Military Police* is the Brigade's redirect name; *Nobility* has no item, 2 lines left out). Nothing of AoT left in the backlog.
- Generated and released 2026-11-23: POST8 (160 minor characters; 235 guidebook-page sources on 151 characters), POST9 (P31 *Nine Titans* on all nine, 23 holder statements with P7528), POST6 (Louise's description).

- `2026-11-24_aot-character-names-de-fr-es-it.txt` (`aot-l10n-existing.mjs`, 82 lines): de / fr / es / it labels from each language's wiki (language links) on the items that lacked them, mostly the 33 that existed before the CREATE (Armin had none in German). *Fritz (Figurehead)* becomes *Fritz* with a description (*king within the Walls*): the bracket gave away a plot twist, and in German both kings would have clashed on label + description.

## Decided (Trummler, 2026-11-20)

- **Spoilers (2026-11-24): whatever a plot twist reveals.** Applied: the royal bloodline (every relation, family and *Royal Government* membership of the Reiss and Fritz lines, Historia's with them, the figurehead king's), the late-revealed Ackermans (Levi, Kenny, Kuchel; Kenny's service to Uri), Grisha's Marleyan past (all his relations but Eren and Carla), Zeke and Dina throughout, the Warriors' units. Relatives batch rebuilt with it (366 marks); the imported memberships get theirs by `2026-11-24_aot-membership-spoilers.txt` (20).

- **Scope: all**, the 197 character pages and the 160 minor characters of the encyclopedia alike: where a trustworthy source covers (nearly) everything, Wikidata gets all of it. The unnamed ones go by the encyclopedia's own designation ("Survey Corpsman A"), told apart by the affiliation in the description.
- **The Nine Titans are powers, not characters:** an item each for the Attack, Armored, Colossal, Female, Beast, Cart, Jaw, War Hammer and Founding Titan, linked from each holder by *superhuman feature or ability* (P2563) with start / end time. The five existing Titan items change class (from *fictional character* to the power). **Every holder statement is a spoiler** (P7528, as for Tobi): who holds a Titan stays hidden deep into the story, and even a holder introduced as such gives away that the one before died.

- **Spoilers among relatives (Trummler, 2026-11-23):** the relations that are a turn of the plot get P7528 as well: Zeke Yeager as Eren's half-brother, Grisha as Zeke's father, Dina Fritz as Zeke's mother. The memberships marked so far (Warrior Unit, Eldian Restorationists, Yeagerists, Anti-Marleyan Volunteers) stand.
- **Review of 2026-11-23 (Trummler found *Abnormal* among the characters):** *Abnormal* and *Titan* are kinds of Titan, not characters, and wait for a class model (Titan => Pure Titan => Abnormal; Intelligent Titan); *The three robbers* became a group; a page titled by a family name alone (*Ackerman*, *Fritz*) carries its wiki description (*Mikasa's father*, *The First King Fritz*). In PRE3 the real-world *Ocean* went and the *Mid-East Allied Forces* became an organisation; no place lies in itself. The class *Nine Titans* exists (Q85982038, kowiki), so PRE9 describes it instead of creating a second; the existence checks search all of Wikidata by label now, not only the items linked to the franchise.

## Open

1. **Done (2026-11-24):** minor characters (POST8), the Nine Titans (PRE9 / POST9), names in de / fr / es / it from the language wikis; the encyclopedia's unnamed minor characters have no page there.
2. **Titan classes (checked 2026-11-24, nothing to add):** the wiki has no page for *Pure Titan* (a redirect to *Titan*) nor for *Intelligent Titan*, so neither has a source of its own: the pure Titans stay P31 *Titan*, the *Abnormal* ("an uncommon type of Pure Titan") P279 *Titan*, the shifters' powers under *Nine Titans*.
