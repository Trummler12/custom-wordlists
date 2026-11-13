# QuickStatements reference

What our Wikidata edits use, for preparing batches as completely as the case allows. Labels come from Wikidata itself (`_scripts/qs-reference.mjs` regenerates this file; add an entry there, never here by hand). The rules for when to edit at all are in the Method section of [README.md](./README.md#method).

## Syntax we rely on

- One statement per line: `Q123|P31|Q5` (`|` or a tab between fields; both import). The batch file's first line is the batch name, not a command.
- Qualifiers follow the value as property-value pairs: `…|P585|+2020-00-00T00:00:00Z/9`. Sources follow as `S`-prefixed pairs: `…|S854|"https://…"|S813|+2026-10-07T00:00:00Z/11`. Several sources on one statement: repeat the line with the other source.
- Values: an item `Q…`; a string in double quotes; monolingual text `en:"…"`; a quantity `123` or `123~5` (with uncertainty); a time `+YYYY-MM-DDT00:00:00Z/P`, precision `P` 11 = day, 10 = month, 9 = year, 8 = decade, 7 = century, 6 = millennium; BC as `-YYYY…`; coordinates `@lat/lon`.
- Removing a statement: `-Q123|P31|Q5`, in a batch of its own.
- Ranks can't be set through QuickStatements; a statement that should be deprecated or preferred is noted for a manual edit.

## Reference properties

| Id | Label | Use it for |
| :---- | :---- | :---- |
| `P248` | stated in | the source is an item (a database, a book, a website with an item): its QID |
| `P854` | reference URL | the source's URL, always together with P813 |
| `P813` | retrieved | the date the URL was checked |
| `P1476` | title | the cited page's title, as monolingual text (`en:"…"`) |
| `P577` | publication date | the source's own publication date |
| `P123` | publisher | the publisher, where it isn't implied by P248 |
| `P407` | language of work or name | the source's language, when not English |
| `P1683` | quotation | a short quotation backing the statement, where the page is long |
| `P1810` | subject named as | the name the source uses, when it differs from the label |
| `P304` | page(s) | page(s), for a printed source |
| `P887` | based on heuristic | how a value was derived from the source, when not stated literally |

## Qualifiers

| Id | Label | Use it for |
| :---- | :---- | :---- |
| `P585` | point in time | a value that holds at one moment (a population figure, a census) |
| `P580` | start time | from when a value holds (membership, sovereignty, a status) |
| `P582` | end time | until when it held |
| `P1534` | end cause | why it stopped holding (with P582) |
| `P3831` | object of statement has role | the role the object has in this statement |
| `P518` | applies to part | the value applies to a part only (a region, an event's women's half) |
| `P5447` | lower limit | lower bound of an uncertain quantity |
| `P5448` | upper limit | upper bound of an uncertain quantity |
| `P1013` | criterion used | the criterion that makes the value true (e.g. which definition of a continent) |
| `P459` | determination method or standard | how the value was determined (method, standard) |
| `P1480` | sourcing circumstances | circa, disputed, legendary, … (uncertain dates, legendary foundings) |
| `P5102` | nature of statement | the statement's nature (de jure, de facto, …) |
| `P1545` | series ordinal | position in an ordered series |
| `P1264` | valid in period | the period a value is valid in |

## Properties we read and edit

| Id | Label | Use it for |
| :---- | :---- | :---- |
| `P31` | instance of | what the item is |
| `P279` | subclass of | what a class is a kind of |
| `P361` | part of | part of (an event of a Games, a discipline of a sport) |
| `P527` | has part(s) | has parts (the inverse) |
| `P641` | sport | the sport of an event or discipline |
| `P1441` | present in work | a character's or location's work |
| `P1080` | from narrative universe | a character's narrative universe |
| `P179` | part of the series | part of a series (episodes, films, games) |
| `P8345` | media franchise | media franchise |
| `P360` | is a list of | a list item's member class (with qualifiers naming the link) |
| `P571` | inception | inception of a state, organisation, work |
| `P576` | dissolved, abolished or demolished | dissolution of a state, organisation |
| `P30` | continent | continent |
| `P36` | capital | capital |
| `P625` | coordinate location | coordinates |
| `P17` | country | country |
| `P4584` | first appearance | first appearance (Pokémon generation, …) |
| `P1086` | atomic number | atomic number |
| `P1448` | official name | official name (monolingual text) |
| `P1813` | short name | short name (monolingual text) |
| `P1082` | population | population (with P585) |
| `P2046` | area | area |

## Classes and items we query against

| Id | Label | Use it for |
| :---- | :---- | :---- |
| `Q3024240` | historical country | historical country |
| `Q3624078` | sovereign state | sovereign state |
| `Q6256` | country | country |
| `Q95074` | character | fictional characters |
| `Q3895768` | fictional location | fictional locations |
| `Q7889` | video game | video games |
| `Q11424` | film | films |
| `Q3966183` | Pokémon species | Pokémon species |
| `Q11344` | chemical element | chemical elements |
| `Q1299291` | hypothetical chemical element | hypothetical chemical elements (to exclude) |
| `Q212434` | Olympic sport | Olympic sports |
| `Q18608583` | recurring sporting event | recurring sporting events (most Olympic series items) |
| `Q159821` | Summer Olympic Games | the Summer Games |
| `Q82414` | Winter Olympic Games | the Winter Games |
| `Q995653` | 2024 Summer Olympics | an edition |
| `Q4630399` | 2026 Winter Olympics | an edition |
| `Q1451505` | 2028 Summer Olympics | the next edition |
