# Wikidata Query Analysis: Video Games

What Wikidata offers for the Video Games topics, and how far it can serve as their source.

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Navigation

[Gaming](../README.md#gaming)

To be replaced by a "General Gaming" category whose child topics ("Franchises", "Characters", "Genres" and other casual or meta topics) belong to no single franchise.

## ✖Characters

**Associated List:** -  
**Definition:** -  
**Check (2026-10-29):** the class *video game character* (Q1569167) holds 9,788 items, but it marks anyone who ever appeared in a game: Mickey Mouse (179 sitelinks), Darth Vader and the Joker top it, as with *comics character* in Other Comics. All 30 of our characters are in it (Sonic as *Sonic the Hedgehog*; Pikachu only through a stray item, the real one is a Pokémon species). Four narrower bases, against our 30 and against Mickey, Vader, the Joker, Naruto, Wolverine and Tux:
- *franchise or universe is a video game series* (P8345 / P1080): 220 items, 27 of ours missing; the link is rarely set.
- *present in a video game* (P1441): 7,984 items, keeps Mickey and Vader; no filter at all.
- *no other character class* (not also animated, film, comics, literary, anime or TV character): 7,805, drops the non-game icons but also Mario, Luigi, Sonic, Kirby, Master Chief, Lara Croft (games that became films and cartoons).
- *first appearance (P4584) is a video game*: 2,637, exact where set: Mario, Luigi, Lara Croft, Bowser in, every probe out. But 258 of the 398 members with 10 or more sitelinks have no first appearance; 17 of ours fall out that way (Sonic, Kirby, Master Chief, Samus, Cloud, …).
- (*earliest dated work among P1441 is a game* fails the same way the other direction: Naruto, Deadpool and the Riddler come in because their manga and comics are not linked.)

So the base is *first appearance is a video game*, and the gap is P4584. Deep Research asks for the missing first appearances. Part 1 (`_data/Prompts/done/First_Appearances_Video_Game_Characters_1.md`) took the 29 with the most sitelinks as they came: all answered, 9 of them game debuts, 8 with a page naming the game, so batch `2026-10-30_first-appearances-1.txt` (P4584 for Sonic, Peach, Donkey Kong, Kirby, Gordon Freeman, Wario, Niko Bellic, Carl Johnson; imported and verified 2026-10-30). The other 20 came from comics, manga, books and TV; they need no first appearance, since without one the rule leaves them out anyway. Parts 2 to 4 (`_data/Prompts/done/First_Appearances_Video_Game_Characters_2.md` to `_4.md`, 35, 21 and 21) held only characters likely to come from a game, down to 15 sitelinks, and asked for the platform as well: all 77 rows answered, 72 pages checked and naming the work (Bulbapedia and warcraft.wiki.gg refuse scripted requests), so batch `2026-10-30_first-appearances-2.txt` (68 lines; left out: Alcina Dimitrescu, Rain and Tracer, whose first work's item is dated a year off, and Captain Price, whose cited page is on another Captain Price; imported and verified 2026-10-30).
**Second branch for the rule:** two characters of game franchises first appeared in a tie-in a little before their game: Master Chief in the novel *Halo: The Fall of Reach* (October 2001, *Halo* came in November), Ellie in the comic *The Last of Us: American Dreams* (April 2013, the game in June). Both are right, and with "first appearance is a video game" alone both would fall out. Proposed: the first appearance is a video game, **or** a work that belongs to a video game franchise (its P8345 is a video game series or franchise, or it is *based on*, P144, a video game); *The Fall of Reach* and *American Dreams* carry both.
**Rating:** ✖️ until P4584 is filled; then ➕.

## [to Navigation](#navigation)
