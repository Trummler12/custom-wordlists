import type { TopicProse } from "./index";

/** English topic prose — the reference and fallback. The other locales (Batch 1) mirror
 *  this shape. Migrated from the geography build scripts and the hand-authored topics; see
 *  the PR plan §M. The wording is the same as the strings it replaces. */
export const en: TopicProse = {
  // The sovereignty & recognition matrix cells (was build-country-data `CELLS[].reason`).
  // Each opens with a lower-case countable noun so the panel's "up to N" reads on from it.
  sovereignty: {
    asymmetricAutonomy: "autonomous regions whose broad self-rule is internationally recognized",
    deFactoRecognized: "fully sovereign states recognized by many, though not all, UN members",
    freeAssociation: "states in free association with another, with limited recognition",
    deFactoNarrow: "fully self-governing states recognized by only a few UN members",
    specialStatus: "highly autonomous territories with a distinct international presence, often taken for countries of their own",
    pureDeFacto: "self-declared states recognized by few or no UN members",
    classicAutonomous: "autonomous territories internationally regarded as part of a sovereign state",
  },
  // The Geoguessr / Street View coverage rules (was build-country-data `COVERAGE`).
  coverage: {
    noCoverage: "countries with no Google Street View coverage",
    rareCoverage: "countries with only sparse Street View coverage",
  },
  // Language-type inclusion labels (was build-languages `TYPES[].reason`). The Wikidata
  // link (the Q-id) is language-independent, so it stays with the type in the build/data and
  // is composed around this label at render; only the label lives here.
  languageType: {
    dead: "dead languages",
    extinct: "extinct languages",
    historical: "historical languages",
    dialect: "dialects",
    dialectGroup: "dialect groups",
    languageGroup: "language groups",
    languageFamily: "language families",
    constructed: "constructed languages",
    fictional: "fictional languages",
  },
  signLanguages: "sign languages",
  ancientPlates: "ancient and extinct plates",
  // The continent list's tier conditions (was build-continents `TIER_CONDITIONS`), one per
  // tier — these are descriptive, not number bands, so they migrate as plain strings.
  continentTiers: [
    "continents and major plates",
    "minor plates and larger",
    "microplates with a measured area, and larger",
    "microplates and larger, measured or not",
    "tectonic plates of unknown classification",
  ],
  tier3Note: "No area has ever been published for these plates, so this tier is grouped by the plate each sits under rather than ordered by size — and several of them are not their own encyclopedia article either.",
  noteLabel: "Note: ",
  // Ruler hovers per topic type (was RULER_COUNTRIES / RULER_CAPITALS / RULER_TOOLTIP).
  // `text` carries `{condition}`, filled at render from the tier band; `empty` names the
  // ordering at rest.
  ruler: {
    countries: { text: "Countries with {condition} inhabitants", empty: "Ranked by population." },
    capitals: {
      text: "Capitals of countries with {condition} inhabitants",
      empty: "Ranked by their country's population.",
    },
    languages: { text: "Languages with {condition} speakers worldwide", empty: "Ranked by speakers worldwide." },
    continents: { text: "{condition}", empty: "Ordered by plate area (Bird 2003)." },
  },
  // The number-band words (was the `NUM` arrays), keyed so the topic data can carry a bare
  // band key per tier and the frontend composes `more(bands[key])`. CJK counts in 億/万,
  // so these are locale words, not just a formatted number.
  bands: {
    "100M": "100 million",
    "30M": "30 million",
    "20M": "20 million",
    "10M": "10 million",
    "5M": "5 million",
    "3M": "3 million",
    "1M": "1 million",
    "300k": "300,000",
    "100k": "100,000",
    "30k": "30,000",
    "10k": "10,000",
    "3k": "3,000",
    "1k": "1,000",
  },
  // The tier-condition wrappers (was `MORE` / `ABOVE_ZERO`). `more` wraps a band word; the
  // cumulative floor reads "more than 0" rather than "under the smallest band".
  more: (n) => `${n} or more`,
  aboveZero: "more than 0",
};
