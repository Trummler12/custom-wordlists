# Wikidata Query Analysis

The goal is to maintain as many Topics as possible via Wikidata;  
This however comes with some challenges, the most important one being that lots of Topics have **incomplete coverage** on Wikidata;  
This File serves as a Hub for the documentation of results and other helpful stuff when analyzing what Wikidata already covers and what Gaps need to be filled.

Use the relative File Paths/Links provided on the Items listed in the [Overview section](#overview) below to jump to the (results so far of the Wikidata Query Analysis on the) respective Topic.

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Method

**What a status is measured against.** For a topic we already have, the fairest measure is how many of *our* entries Wikidata could supply (`_scripts/vs-topic.mjs`), not how many items it holds in total. For a planned one, the members found against the real number (a franchise wiki, the official count).

**Rated by how cleanly results classify.** An omission rule never reduces what a reader can select, it adds to it: a meaningful class that isn't wanted by default (historical countries, discontinued Olympic sports, child disciplines) is a candidate `omitted` / `omittable` rule, not ballast. So a query is judged by how well its results split into the base list plus such classes, each with a stable id and the parameters that separate it; only what is no entry of the topic at all goes on an exclusion list, kept visible in `data-raw/`.

**Does the split itself hold?** A category or topic boundary of ours (DC vs Marvel, a franchise's games vs its anime) only works if Wikidata can draw it too, by a property or a class. Where it can't, the analysis says so and proposes merging the topics or another criterion that Wikidata does carry. The same goes for a category that doesn't fit beside its siblings (see [Video Games](./gaming/Video_Games.md#navigation)).

**Candidates.** Each category in the overview ends in a list of proposed topics. Trummler approves one by marking its line (e.g. ☑️); it then becomes an analyzable topic in the fitting file.

**List definitions are a starting point, not the answer.** A list item's *is a list of* (P360) and its qualifiers often name a property the members don't use (SpongeBob's characters are linked by *present in work*, P1441, while the definition asks for *part of the series*, P179), or no qualifier at all. So members are counted by every usual link to the work, its series, universe or franchise (P1441, P1080, P179, P8345, P361), and by class with subclasses (`_scripts/members.mjs`).

**Truthy statements, not all statements.** The Query Builder counts every P31 statement, ended and deprecated ones included; for current things (countries) the truthy `wdt:P31` figure is the relevant one (`_scripts/count.mjs` prints both).

**Labels: `mul` too.** Names that read the same in every language ("South Park") are often stored only as the language-independent `mul` label, with no `en` one; a query that asks for `en` alone misses them. Our shared dump module (`scripts/lib/wikidata.mjs`) closes the chain of every Latin-script language with `mul`, not of ja, ko, zh, ru, bg, el, he, mk or sr, where a Latin name would be a wrong one rather than a missing one; a coverage cell resolved through `mul` counts as covered.

**Gaps are fixed on Wikidata, not worked around.** Where an item lacks a statement or carries a wrong one, the fix is an edit to Wikidata, never a hard-coded QID or a special case in a query. Edits go through [QuickStatements](https://quickstatements.toolforge.org/#/batch), prepared here and imported by Trummler:

- What to fill in: [QuickStatements.md](./QuickStatements.md) lists the reference properties, qualifiers, properties and classes we use, with their Wikidata labels, and the syntax.
- Only what is certain beyond doubt. Every added or changed statement carries a reference: the source URL (`S854`) and the retrieval date (`S813`), plus *stated in* (`S248`) where the source has an item; two independent sources where one could be doubted. Qualifiers wherever they belong (start / end time, point in time, …).
- Additions first. Removing a statement (`-Q…|P…|Q…`) only when it is certainly wrong, and in a batch of its own.
- One file per subject: `_data/QuickStatements/<date>_<topic>-<subject>.txt`. Its first line is the batch name (English; it goes into the "Batch name" field, not into the commands), the rest nothing but commands (QuickStatements has no comments). The topic's section says what each batch does, why, from which sources, and whether it is **pending** or **imported**.
- After the import: re-run the check, note the result in the section, delete the batch file.

**Research can go to Gemini, QIDs never.** Finding sources for a statement is a good task to delegate (a prompt in `_untracked/Prompts/`), but Gemini invents QIDs; every QID is resolved by a query here, and a prompt that needs some names them itself.

**Keeping the analysis lean.**

- A newer **Check** replaces the older one in its section (the history is in git).
- Once a list is ✅ in use, its section shrinks to what building it needs: the final query, the rules (id, parameters), pointers to the exclusion / override lists, the last check. Comparisons that led there go into a collapsed `<details>` or away.
- `_data/` is a cache: anything in it can be deleted and rebuilt with the scripts, the QuickStatements batches excepted until imported.
- Agent mail ends with the agent that has nothing left to add: instead of replying, it carries the outcome into its own records (here: the analysis text) and deletes the whole thread.

<details><summary><i>the scripts in <code>_scripts/</code></i></summary>

- `wd.mjs`: the SPARQL call (User-Agent, retry, a cache in `_data/cache`; `WD_FRESH=1` bypasses it after an edit to Wikidata) and `labels()` (en, else mul).
- `listdef.mjs <list-QID>…`: a list item's P360 definitions and what each matches (exact class, with subclasses, any class).
- `members.mjs <class> <work>… [--list]`: instances of a class linked to the works by any of the usual properties, per property.
- `vs-topic.mjs <topic.json> <class> <work>… [--missing]`: how many of a curated topic's entries are among those members (by full name, or by first name).
- `classes.mjs <work>…`: the classes the linked items are instances of, most common first (to find a list's class when nothing defines one).
- `olympics.mjs`: the Olympic sports per Games and per edition, with sitelinks and parent sports.
- `athletes.mjs`: how complete Olympic athletes are (Olympedia IDs, participations, medal qualifiers, sitelinks).
- `athlete-tiers.mjs`, `athlete-dump-size.mjs`: athletes per fame tier and season (language Wikipedias), and the raw dump's size per floor.
- `sports-structure.mjs`: people per candidate Sports rubric (other Games, leagues, single-sport championships) and how many clear the athletes' floor.
- `games-recipe.mjs`: per Games series and season, how editions link to it, how events carry their sport, the current edition, and P641 values that are no sport.
- `multisport.mjs`: the sports of other multi-sport events and their overlap with the Olympic ones.
- `fame.mjs <QID>… [--from file]`: sitelinks against 12 months of English pageviews, with Spearman's rho.
- `historical.mjs [--min N]`: candidate queries for historical countries against a reference set.
- `historical-spans.mjs [--min N]`: the candidates' date coverage, start / end centuries and continents.
- `qs-reference.mjs`: regenerates `QuickStatements.md` with labels fetched from Wikidata.
- `territories.mjs [--min N]`: the curated sovereignty-matrix territories' classes per cell, and what each class would add.
- `count.mjs <class>…`: instances of a class: truthy, with subclasses, all statements.
- `hub.mjs`: rebuilds this file's overview and every file's navigation from the headings (run after changing a status).

</details>

## Overview

### Animation

- [South Park](./animation/South_Park.md#navigation)
  - ✖️[Characters](./animation/South_Park.md#️characters)
  - ✖️[Families](./animation/South_Park.md#️families)
  - ❌[Episodes](./animation/South_Park.md#episodes)
  - 🔵[Video Games](./animation/South_Park.md#video-games)
- [SpongeBob SquarePants](./animation/SpongeBob.md#navigation)
  - ➕[Characters](./animation/SpongeBob.md#characters)
  - 🔵[Locations](./animation/SpongeBob.md#locations)
  - ❌[Episodes](./animation/SpongeBob.md#episodes)
  - ✖️[Video Games](./animation/SpongeBob.md#️video-games)
- [The Simpsons](./animation/The_Simpsons.md#navigation)
  - ➕[Characters](./animation/The_Simpsons.md#characters)
  - 🔵[Locations](./animation/The_Simpsons.md#locations)
  - ❌[Episodes](./animation/The_Simpsons.md#episodes)
  - ✖️[Video Games](./animation/The_Simpsons.md#️video-games)

#### Candidates

- Family Guy
- Futurama
- Rick and Morty
- Avatar: The Last Airbender
- Gravity Falls
- Looney Tunes
- Scooby-Doo
- Tom and Jerry

### Anime

- [Dragon Ball](./anime/Dragon_Ball.md#navigation)
  - ➕[Characters](./anime/Dragon_Ball.md#characters)
  - ✖️[Locations](./anime/Dragon_Ball.md#️locations)
  - ❌[Episodes](./anime/Dragon_Ball.md#episodes)
  - 🔵[Films](./anime/Dragon_Ball.md#films)
  - ✖️[Video Games](./anime/Dragon_Ball.md#️video-games)
- [One Piece](./anime/One_Piece.md#navigation)
  - ➕[Characters](./anime/One_Piece.md#characters)
  - ✖️[Animals/Species/Races](./anime/One_Piece.md#️animalsspeciesraces)
  - ✖️[Affiliations](./anime/One_Piece.md#️affiliations)
  - ✖️[Devil Fruits](./anime/One_Piece.md#️devil-fruits)
  - ✖️[Locations](./anime/One_Piece.md#️locations)
  - ✖️[Islands](./anime/One_Piece.md#️islands)
  - ❌[Episodes](./anime/One_Piece.md#episodes)
  - 🔵[Films](./anime/One_Piece.md#films)
  - ✖️[Video Games](./anime/One_Piece.md#️video-games)
- [Pokémon (Anime)](./anime/Pokemon.md#navigation)
  - ✖️[Characters](./anime/Pokemon.md#️characters)
  - ➕[Locations](./anime/Pokemon.md#locations)
  - ❌[Episodes](./anime/Pokemon.md#episodes)
  - ✖️[Openings (theme songs)](./anime/Pokemon.md#️openings-theme-songs)
  - 🔵[Films](./anime/Pokemon.md#films)
  - ➕[Video Games](./anime/Pokemon.md#video-games)

#### Candidates

- Naruto
- Attack on Titan
- Demon Slayer
- My Hero Academia
- Sailor Moon
- Death Note
- Digimon
- Yu-Gi-Oh!
- JoJo's Bizarre Adventure
- Studio Ghibli

### Comics

- [DC](./comics/DC.md#navigation)
  - [Heroes](./comics/DC.md#heroes)
  - [Villains](./comics/DC.md#villains)
- [Marvel](./comics/Marvel.md#navigation)
  - [Heroes](./comics/Marvel.md#heroes)
  - [Villains](./comics/Marvel.md#villains)
- [Other Comics](./comics/Other_Comics.md#navigation)
  - [Characters](./comics/Other_Comics.md#characters)

#### Candidates

- Asterix
- The Adventures of Tintin
- Peanuts
- Garfield
- Lucky Luke

### Film & TV

- [Disney](./film-tv/Disney.md#navigation)
  - [Animated Films](./film-tv/Disney.md#animated-films)
  - [Classics](./film-tv/Disney.md#classics)
- [Harry Potter](./film-tv/Harry_Potter.md#navigation)
  - [Characters](./film-tv/Harry_Potter.md#characters)
- [The Lord of the Rings](./film-tv/Lord_of_the_Rings.md#navigation)
  - [Characters](./film-tv/Lord_of_the_Rings.md#characters)
- [Star Wars](./film-tv/Star_Wars.md#navigation)
  - [Characters](./film-tv/Star_Wars.md#characters)

#### Candidates

- Pixar
- DreamWorks Animation
- Marvel Cinematic Universe
- Star Trek
- James Bond
- Game of Thrones
- Jurassic Park
- Doctor Who

### Gaming

- [Apex Legends](./gaming/Apex_Legends.md#navigation)
  - ✖️[Legends](./gaming/Apex_Legends.md#️legends)
  - ✖️[Characters](./gaming/Apex_Legends.md#️characters)
  - ✖️[Weapons](./gaming/Apex_Legends.md#️weapons)
- [League of Legends](./gaming/League_of_Legends.md#navigation)
  - ➕[Champions](./gaming/League_of_Legends.md#champions)
  - ❓[Legacy Champions](./gaming/League_of_Legends.md#legacy-champions)
  - ✖️[Characters](./gaming/League_of_Legends.md#️characters)
- [Pokémon (Games)](./gaming/Pokemon.md#navigation)
  - ☑️[Pokémon](./gaming/Pokemon.md#️pokémon)
  - ☑️[Abilities](./gaming/Pokemon.md#️abilities)
  - ✖️[Items](./gaming/Pokemon.md#️items)
  - ✖️[Moves](./gaming/Pokemon.md#️moves)
  - ✖️[Characters](./gaming/Pokemon.md#️characters)
  - ➕[Locations](./gaming/Pokemon.md#locations)
  - ➕[Video Games](./gaming/Pokemon.md#video-games)
- [Video Games](./gaming/Video_Games.md#navigation)

#### Candidates

- Super Mario
- The Legend of Zelda
- Minecraft
- Sonic the Hedgehog
- Super Smash Bros.
- Overwatch
- Dota 2
- Valorant
- Genshin Impact
- Fortnite

### Geography

- [Human Geography](./geography/Human.md#navigation)
  - ✅[Countries](./geography/Human.md#countries)
  - ✅[Capitals](./geography/Human.md#capitals)
  - 🔵[Subdivisions](./geography/Human.md#subdivisions)
  - 🔵[Sub-Capitals](./geography/Human.md#sub-capitals)
  - 🔵[Cities](./geography/Human.md#cities)
  - ✅[Languages](./geography/Human.md#languages)
- [Physical Geography](./geography/Physical.md#navigation)
  - ✅[Continents](./geography/Physical.md#continents)
  - 🔵[Oceans & Seas](./geography/Physical.md#oceans--seas)
  - 🔵[Islands](./geography/Physical.md#islands)
  - 🔵[Mountains](./geography/Physical.md#mountains)
  - 🔵[Deserts](./geography/Physical.md#deserts)
  - 🔵[Rivers](./geography/Physical.md#rivers)
  - 🔵[Lakes](./geography/Physical.md#lakes)
  - 🔵[Climate Zones](./geography/Physical.md#climate-zones)

#### Candidates

- Volcanoes
- Mountain Ranges
- Waterfalls
- Peninsulas
- Straits & Canals
- National Parks
- World Heritage Sites
- Currencies

### Science

- [Chemistry](./science/Chemistry.md#navigation)
  - ☑️[Chemical Elements](./science/Chemistry.md#️chemical-elements)

#### Candidates

- Planets & Dwarf Planets
- Moons
- Constellations
- Stars
- Dinosaurs
- Animals
- Human Bones
- Organs
- SI Units
- Minerals

### Sports

- [Olympics](./sports/Olympics.md#navigation)
  - ✅[Summer Sports](./sports/Olympics.md#summer-sports)
  - ➕[Summer Athletes](./sports/Olympics.md#summer-athletes)
  - ☑️[Winter Sports](./sports/Olympics.md#️winter-sports)
  - ➕[Winter Athletes](./sports/Olympics.md#winter-athletes)

#### Candidates

- Football Clubs
- NBA Teams
- NFL Teams
- Formula 1 Drivers
- Formula 1 Circuits
- Tennis Players
- Non-Olympic Sports
- Paralympics
- World Games
- Commonwealth Games
- Asian Games
- Olympic Host Cities
