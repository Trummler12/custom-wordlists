// The Science topics built from Wikidata: per topic, which items make its members, how they
// fall into tiers, and which of them a rule sets apart. Read by dump-class-topic.mjs (the
// members and the floor) and build-class-topic.mjs (the rest).
//
// MEMBERS come from `classes` (the instances of each, at any rank) or from `partsOf` (what
// each listed item has as part, P527). Either way each source has a key, and an item keeps
// the keys that brought it in, so the tests read as words.
//
// AN ITEM, as the build hands it to `tier` and to a rule's `test`:
//   { qid, name, sitelinks, wikipedias, in: [<member key>…],
//     statements?: { <key of `statements`>: [Q… | year] }, names }
// `sitelinks` counts every Wikimedia site (the floor the analysis measured with),
// `wikipedias` only the language Wikipedias (the order within a tier).
//
// A RULE takes its members out of the default list; its entries still sit in the tiers.
// `kind` is `omitted` (hidden by default) or `omittable` (shown by default); `wd` links its
// reason to the class it stands for.
//
// `check(items)` returns warnings for what the tests silently rely on.
//
// The analysis behind each topic: _untracked/docs/Queries/science/ (PR #38), the result in
// _untracked/docs/Queries/_Build_Specs.md.
import { readFileSync } from "node:fs";

const readJson = (rel) => JSON.parse(readFileSync(new URL(rel, import.meta.url), "utf8"));

// TODO: Wikidata doesn't mark Ptolemy's groups, so tiers 2 and 3 read the Almagest's own
// (see the file). Should the class chain "Ptolemaic constellation" => northern / zodiacal /
// southern land on Wikidata, read that instead.
const PTOLEMY = readJson("../../data-raw/science/astronomy/constellations/ptolemaic-groups.json").groups;
const ptolemy = (group) => new Set(PTOLEMY[group].map((c) => c.qid));
const PTOLEMY_NORTH = ptolemy("northern");
const PTOLEMY_SOUTH = ptolemy("southern");

/** Ophiuchus is a zodiacal constellation, but not one of the twelve signs. */
const OPHIUCHUS = "Q8906";
const CHINESE_CONSTELLATION = "Q1074076";

/** The earliest time of discovery (P575), or undefined. */
const discovered = (it) => (it.statements?.discovered?.length ? Math.min(...it.statements.discovered) : undefined);
const former = (it) => it.in.includes("former");

const CONSTELLATIONS = {
  folder: "astronomy/constellations",
  category: { title: { en: "Constellations", de: "Sternbilder" }, icon: "✨" },
};

export const CLASS_TOPICS = {
  "western-constellations": {
    ...CONSTELLATIONS,
    title: {
      short: { en: "Western", de: "Westlich" },
      long: { en: "Western Constellations", de: "Westliche Sternbilder" },
    },
    order: 1,
    icon: "♈",
    description:
      "The 88 constellations of the International Astronomical Union and the former ones. The twelve of the zodiac first, then Ptolemy's northern and southern ones, the modern ones by age, the former ones last.",
    // Wikidata's *IAU constellation* sits beside these at normal rank on Aries, so the dump
    // reads every rank, not only the best.
    classes: { constellation: "Q8928", zodiac: "Q4193029", former: "Q1620914" },
    statements: { discovered: { prop: "P575", year: true } },
    // Below it sit strays (Sah, Yakana); at it, exactly the IAU's 88 and 30 former ones.
    minSitelinks: 5,
    sources: "tiers 2 and 3: Ptolemy's groups, Almagest (G. J. Toomer's translation, 1984, pp. 341-399)",
    // Each condition is cumulative: the hover names only the lowest tier brought in.
    // Argo Navis, former but Ptolemy's, stays with Ptolemy's southern ones.
    tiers: [
      {
        condition: { en: "The twelve constellations of the zodiac", de: "Die zwölf Sternbilder des Tierkreises" },
        test: (it) => it.in.includes("zodiac") && it.qid !== OPHIUCHUS,
      },
      {
        condition: {
          en: "The zodiac and Ptolemy's northern constellations",
          de: "Der Tierkreis und die nördlichen Sternbilder des Ptolemäus",
        },
        test: (it) => PTOLEMY_NORTH.has(it.qid),
      },
      {
        condition: { en: "All 48 of Ptolemy's constellations", de: "Alle 48 Sternbilder des Ptolemäus" },
        test: (it) => PTOLEMY_SOUTH.has(it.qid),
      },
      {
        condition: { en: "Ptolemy's and those named before 1650", de: "Die des Ptolemäus und die vor 1650 benannten" },
        test: (it) => !former(it) && discovered(it) < 1650,
      },
      { condition: { en: "All 88 of the IAU", de: "Alle 88 der IAU" }, test: (it) => !former(it) },
      { condition: { en: "Also the former constellations", de: "Dazu die ehemaligen Sternbilder" }, test: () => true },
    ],
    rulerTooltip: {
      text: { en: "{condition}", de: "{condition}" },
      empty: {
        en: "Ordered by age: the zodiac, Ptolemy's, the modern ones, the former ones.",
        de: "Nach Alter geordnet: Tierkreis, die des Ptolemäus, die neuzeitlichen, die ehemaligen.",
      },
    },
    check: (items) => {
      const out = [];
      const ptolemaic = items.filter((it) => PTOLEMY_NORTH.has(it.qid) || PTOLEMY_SOUTH.has(it.qid)).length;
      if (ptolemaic !== 36) out.push(`${ptolemaic} of Ptolemy's 36 northern and southern ones in the dump, not 36`);
      const iau = items.filter((it) => !former(it));
      if (iau.length !== 88) out.push(`${iau.length} current constellations, not the IAU's 88`);
      const modern = iau.filter((it) => !PTOLEMY_NORTH.has(it.qid) && !PTOLEMY_SOUTH.has(it.qid) && !it.in.includes("zodiac"));
      const undated = modern.filter((it) => discovered(it) === undefined).map((it) => it.name);
      if (undated.length) out.push(`no time of discovery (P575), read as later modern: ${undated.join(", ")}`);
      return out;
    },
  },

  "chinese-constellations": {
    ...CONSTELLATIONS,
    title: {
      short: { en: "Chinese", de: "Chinesisch" },
      long: { en: "Chinese Constellations", de: "Chinesische Sternbilder" },
    },
    order: 2,
    icon: "🐉",
    description:
      "The traditional Chinese sky: the Four Symbols, the Twenty-Eight Mansions, the Three Enclosures and the asterisms of each enclosure.",
    // No floor: only what these groups list comes in, so no stray can.
    partsOf: {
      fourSymbols: "Q1073260",
      mansions: "Q1378760",
      enclosures: "Q1131585",
      purpleForbidden: "Q1145852",
      heavenlyMarket: "Q1145862",
      supremePalace: "Q1145944",
    },
    statements: { instanceOf: { prop: "P31" } },
    tiers: [
      { condition: { en: "The Four Symbols", de: "Die Vier Symbole" }, test: (it) => it.in.includes("fourSymbols") },
      {
        condition: { en: "The Four Symbols and the 28 Mansions", de: "Die Vier Symbole und die 28 Mondhäuser" },
        test: (it) => it.in.includes("mansions"),
      },
      {
        condition: { en: "Also the Three Enclosures", de: "Dazu die Drei Einfriedungen" },
        test: (it) => it.in.includes("enclosures"),
      },
      {
        condition: {
          en: "Also the asterisms of the Purple Forbidden Enclosure",
          de: "Dazu die Asterismen der Purpurnen Verbotenen Einfriedung",
        },
        test: (it) => it.in.includes("purpleForbidden"),
      },
      {
        condition: {
          en: "Also the asterisms of the Heavenly Market Enclosure",
          de: "Dazu die Asterismen der Einfriedung des Himmlischen Marktes",
        },
        test: (it) => it.in.includes("heavenlyMarket"),
      },
      {
        condition: {
          en: "Also the asterisms of the Supreme Palace Enclosure",
          de: "Dazu die Asterismen der Einfriedung des Höchsten Palastes",
        },
        test: () => true,
      },
    ],
    rulerTooltip: {
      text: { en: "{condition}", de: "{condition}" },
      empty: {
        en: "Ordered by division: the symbols, the mansions, the enclosures, the enclosures' asterisms.",
        de: "Nach Gliederung geordnet: Symbole, Mondhäuser, Einfriedungen, die Asterismen der Einfriedungen.",
      },
    },
    check: (items) => {
      // The Big Dipper stands for 北斗 without being a Chinese constellation: expected.
      const other = items.filter((it) => !(it.statements?.instanceOf ?? []).includes(CHINESE_CONSTELLATION));
      return other.length ? [`not a Chinese constellation (P31): ${other.map((it) => `${it.name} ${it.qid}`).join(", ")}`] : [];
    },
  },
};
