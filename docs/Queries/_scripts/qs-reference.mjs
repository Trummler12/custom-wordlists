// Writes ../QuickStatements.md: the properties, qualifiers, reference properties and
// classes our Wikidata edits use, each with its label as Wikidata has it (so no id is
// ever written from memory), plus the QuickStatements syntax we rely on.
//
//   node qs-reference.mjs
//
// To add an entry, add its id and a one-line "when" to the lists below and re-run.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { labels } from "./wd.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "QuickStatements.md");

const SOURCES = [
  ["P248", "the source is an item (a database, a book, a website with an item): its QID"],
  ["P854", "the source's URL, always together with P813"],
  ["P813", "the date the URL was checked"],
  ["P1476", "the cited page's title, as monolingual text (`en:\"…\"`)"],
  ["P577", "the source's own publication date"],
  ["P123", "the publisher, where it isn't implied by P248"],
  ["P407", "the source's language, when not English"],
  ["P1683", "a short quotation backing the statement, where the page is long"],
  ["P1810", "the name the source uses, when it differs from the label"],
  ["P304", "page(s), for a printed source"],
  ["P887", "how a value was derived from the source, when not stated literally"],
];
const QUALIFIERS = [
  ["P585", "a value that holds at one moment (a population figure, a census)"],
  ["P580", "from when a value holds (membership, sovereignty, a status)"],
  ["P582", "until when it held"],
  ["P1534", "why it stopped holding (with P582)"],
  ["P3831", "the role the object has in this statement"],
  ["P518", "the value applies to a part only (a region, an event's women's half)"],
  ["P5447", "lower bound of an uncertain quantity"],
  ["P5448", "upper bound of an uncertain quantity"],
  ["P1013", "the criterion that makes the value true (e.g. which definition of a continent)"],
  ["P459", "how the value was determined (method, standard)"],
  ["P1480", "circa, disputed, legendary, … (uncertain dates, legendary foundings)"],
  ["P5102", "the statement's nature (de jure, de facto, …)"],
  ["P1545", "position in an ordered series"],
  ["P1264", "the period a value is valid in"],
];
const PROPERTIES = [
  ["P31", "what the item is"],
  ["P279", "what a class is a kind of"],
  ["P361", "part of (an event of a Games, a discipline of a sport)"],
  ["P527", "has parts (the inverse)"],
  ["P641", "the sport of an event or discipline"],
  ["P1441", "a character's or location's work"],
  ["P1080", "a character's narrative universe"],
  ["P179", "part of a series (episodes, films, games)"],
  ["P8345", "media franchise"],
  ["P360", "a list item's member class (with qualifiers naming the link)"],
  ["P571", "inception of a state, organisation, work"],
  ["P576", "dissolution of a state, organisation"],
  ["P30", "continent"],
  ["P36", "capital"],
  ["P625", "coordinates"],
  ["P17", "country"],
  ["P4584", "first appearance (Pokémon generation, …)"],
  ["P1086", "atomic number"],
  ["P1448", "official name (monolingual text)"],
  ["P1813", "short name (monolingual text)"],
  ["P1082", "population (with P585)"],
  ["P2046", "area"],
];
const CLASSES = [
  ["Q3024240", "historical country"],
  ["Q3624078", "sovereign state"],
  ["Q6256", "country"],
  ["Q95074", "fictional characters"],
  ["Q3895768", "fictional locations"],
  ["Q7889", "video games"],
  ["Q11424", "films"],
  ["Q3966183", "Pokémon species"],
  ["Q11344", "chemical elements"],
  ["Q1299291", "hypothetical chemical elements (to exclude)"],
  ["Q212434", "Olympic sports"],
  ["Q18608583", "recurring sporting events (most Olympic series items)"],
  ["Q159821", "the Summer Games"],
  ["Q82414", "the Winter Games"],
  ["Q995653", "an edition"],
  ["Q4630399", "an edition"],
  ["Q1451505", "the next edition"],
];

const all = [...SOURCES, ...QUALIFIERS, ...PROPERTIES, ...CLASSES].map(([id]) => id);
const L = await labels(all);
const missing = all.filter((id) => !L[id]);
if (missing.length) throw new Error(`no label for ${missing.join(", ")}: check the ids`);
const table = (rows) =>
  ["| Id | Label | Use it for |", "| :---- | :---- | :---- |", ...rows.map(([id, when]) => `| \`${id}\` | ${L[id]} | ${when} |`)].join("\n");

const md = `# QuickStatements reference

What our Wikidata edits use, for preparing batches as completely as the case allows. Labels come from Wikidata itself (\`_scripts/qs-reference.mjs\` regenerates this file; add an entry there, never here by hand). The rules for when to edit at all are in the Method section of [README.md](./README.md#method).

## Syntax we rely on

- One statement per line: \`Q123|P31|Q5\` (\`|\` or a tab between fields; both import). The batch file's first line is the batch name, not a command.
- Qualifiers follow the value as property-value pairs: \`…|P585|+2020-00-00T00:00:00Z/9\`. Sources follow as \`S\`-prefixed pairs: \`…|S854|"https://…"|S813|+2026-10-07T00:00:00Z/11\`. Several sources on one statement: repeat the line with the other source.
- Values: an item \`Q…\`; a string in double quotes; monolingual text \`en:"…"\`; a quantity \`123\` or \`123~5\` (with uncertainty); a time \`+YYYY-MM-DDT00:00:00Z/P\`, precision \`P\` 11 = day, 10 = month, 9 = year, 8 = decade, 7 = century, 6 = millennium; BC as \`-YYYY…\`; coordinates \`@lat/lon\`.
- Removing a statement: \`-Q123|P31|Q5\`, in a batch of its own.
- Ranks can't be set through QuickStatements; a statement that should be deprecated or preferred is noted for a manual edit.

## Reference properties

${table(SOURCES)}

## Qualifiers

${table(QUALIFIERS)}

## Properties we read and edit

${table(PROPERTIES)}

## Classes and items we query against

${table(CLASSES)}
`;
writeFileSync(OUT, md);
console.log(`wrote ${OUT}`);
