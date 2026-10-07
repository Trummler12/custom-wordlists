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

**List definitions are a starting point, not the answer.** A list item's *is a list of* (P360) and its qualifiers often name a property the members don't use (SpongeBob's characters are linked by *present in work*, P1441, while the definition asks for *part of the series*, P179), or no qualifier at all. So members are counted by every usual link to the work, its series, universe or franchise (P1441, P1080, P179, P8345, P361), and by class with subclasses (`_scripts/members.mjs`).

**Truthy statements, not all statements.** The Query Builder counts every P31 statement, ended and deprecated ones included; for current things (countries) the truthy `wdt:P31` figure is the relevant one (`_scripts/count.mjs` prints both).

**Labels: `mul` too.** Names that read the same in every language ("South Park") are often stored only as the language-independent `mul` label, with no `en` one; a query that asks for `en` alone misses them.

<details><summary><i>the scripts in <code>_scripts/</code></i></summary>

- `wd.mjs`: the SPARQL call (User-Agent, retry, a cache in `_data/cache`) and `labels()` (en, else mul).
- `listdef.mjs <list-QID>…`: a list item's P360 definitions and what each matches (exact class, with subclasses, any class).
- `members.mjs <class> <work>… [--list]`: instances of a class linked to the works by any of the usual properties, per property.
- `vs-topic.mjs <topic.json> <class> <work>… [--missing]`: how many of a curated topic's entries are among those members (by full name, or by first name).
- `classes.mjs <work>…`: the classes the linked items are instances of, most common first (to find a list's class when nothing defines one).
- `olympics.mjs`: the Olympic sports per Games and per edition, with sitelinks and parent sports.
- `fame.mjs <QID>… [--from file]`: sitelinks against 12 months of English pageviews, with Spearman's rho.
- `historical.mjs [--min N]`: candidate queries for historical countries against a reference set.
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
  - 🔵[Video Games](./anime/Pokemon.md#video-games)

### Comics

- [DC](./comics/DC.md#navigation)
  - [Heroes](./comics/DC.md#heroes)
  - [Villains](./comics/DC.md#villains)
- [Marvel](./comics/Marvel.md#navigation)
  - [Heroes](./comics/Marvel.md#heroes)
  - [Villains](./comics/Marvel.md#villains)
- [Other Comics](./comics/Other_Comics.md#navigation)
  - [Characters](./comics/Other_Comics.md#characters)

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

### Science

- [Chemistry](./science/Chemistry.md#navigation)
  - ☑️[Chemical Elements](./science/Chemistry.md#️chemical-elements)

### Sports

- [Olympics](./sports/Olympics.md#navigation)
  - ❌[Athletes](./sports/Olympics.md#athletes)
  - ➕[Sports](./sports/Olympics.md#sports)

<!-- @agent(#35) from #38 · 2026-10-07 · OPEN
Decided: Wikidata stores names that read the same everywhere as a language-independent `mul` label, often without per-language labels (South Park has no `en` one). The dump queries fetch a fixed language list without `mul`. Checked: no current topic loses an `en` name (0 of 2,021 languages, 0 of 243 countries), but 35 languages and 12 countries carry a `mul` label and may show false gaps in other languages (coverage pages, the "no name in this language" counts).
Ask: consider `mul` as the last link of every LANG_SRC chain when the dump machinery is touched (V / Z); a coverage cell resolved through `mul` might count as covered.
Refs: _untracked/docs/Queries/README.md, Method, "Labels: mul too"
-->
