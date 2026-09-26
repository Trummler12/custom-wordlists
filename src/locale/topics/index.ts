// Topic prose — the locale-like text that describes a *topic* (tier conditions, ruler
// tooltips, omission reasons, number-band words) rather than the app chrome. It used to be
// baked into the topic data by the geography build scripts, one all-languages object per
// string; it is being centralized here so a new interface language is one file's work.
//
// Deliberately kept OUT of `UIStrings`: the coverage entry loads `UIStrings` for its own
// chrome, and it never renders topic prose, so folding this in would only grow that bundle.
// The main app resolves a prose id ("sovereignty.deFactoRecognized") via `resolveProse`, and
// reads the ruler/band pieces via `topicProse(lang)`. See the PR plan §M.

import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { it } from "./it";
import { ja } from "./ja";
import { ko } from "./ko";
import { pt } from "./pt";
import { ru } from "./ru";
import { zhHans } from "./zh-Hans";
import { zhHant } from "./zh-Hant";

/** The shape every locale's topic-prose dictionary implements — the id namespace. */
export interface TopicProse {
  /** Sovereignty & recognition matrix cell reasons, by cell id. */
  sovereignty: {
    asymmetricAutonomy: string;
    deFactoRecognized: string;
    freeAssociation: string;
    deFactoNarrow: string;
    specialStatus: string;
    pureDeFacto: string;
    classicAutonomous: string;
  };
  /** Geoguessr / Street View coverage rule reasons. */
  coverage: { noCoverage: string; rareCoverage: string };
  /** Language-type inclusion labels (the Wikidata link is composed around these at render). */
  languageType: {
    dead: string;
    extinct: string;
    historical: string;
    dialect: string;
    dialectGroup: string;
    languageGroup: string;
    languageFamily: string;
    constructed: string;
    fictional: string;
  };
  signLanguages: string;
  ancientPlates: string;
  /** The continents list's tier conditions, one per tier (descriptive, not number bands). */
  continentTiers: string[];
  tier3Note: string;
  /** The "Note: " label that opens a tier's folded caveat. */
  noteLabel: string;
  /** Ruler hovers per topic type; `text` carries `{condition}`, `empty` the at-rest ordering. */
  ruler: {
    countries: { text: string; empty: string };
    capitals: { text: string; empty: string };
    languages: { text: string; empty: string };
    continents: { text: string; empty: string };
  };
  /** Number-band words, keyed (e.g. "100M"); the topic data carries the key per tier. */
  bands: Record<string, string>;
  /** Wraps a band word for a tier condition ("100 million" ⇒ "100 million or more"). */
  more: (n: string) => string;
  /** The cumulative floor's wording. */
  aboveZero: string;
}

/** Language that backs any locale without its own topic-prose dictionary. */
const FALLBACK = "en";

// One entry per official interface language; English is the reference and the fallback.
const PROSE: Record<string, TopicProse> = {
  en,
  de,
  es,
  fr,
  it,
  ja,
  ko,
  pt,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
  ru,
};

/** A language's topic-prose dictionary, falling back to English. */
export function topicProse(lang: string): TopicProse {
  return PROSE[lang] ?? PROSE[FALLBACK];
}

/** Resolve a dotted prose id ("sovereignty.deFactoRecognized") to `lang`, falling back to
 *  English, then to the id itself if it names nothing (so a stale id fails visibly, not
 *  silently). This is what the topic data's bare-string `reason` etc. resolve through. */
export function resolveProse(id: string, lang: string): string {
  const walk = (p: TopicProse): unknown =>
    id.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], p);
  const own = walk(topicProse(lang));
  if (typeof own === "string") return own;
  const base = walk(topicProse(FALLBACK));
  return typeof base === "string" ? base : id;
}

/** The token the cumulative floor tier carries — "more than 0", not "under the smallest
 *  band", since the ruler has already swept in everything above it. Distinct from any
 *  band key so `resolveCondition` can tell them apart. */
export const FLOOR = ">0";

/** Resolve a tier-condition token to `lang` — what the ruler tooltip names as the band it
 *  has just brought in. Three forms, matching what the topic data now carries in place of a
 *  baked all-language condition:
 *   - a band key ("100M", "1k") ⇒ the band word wrapped by `more` ("100 million or more");
 *   - the floor token (`FLOOR`) ⇒ `aboveZero`;
 *   - a prose id ("continentTiers.0") ⇒ `resolveProse`, with an optional "@<noteId>" tail
 *     folding a tier's caveat onto a `{br}{br}<noteLabel>` second line (the continents list's
 *     tier-3 note, kept out of a separate ℹ️ glyph by design). */
export function resolveCondition(token: string, lang: string): string {
  const p = topicProse(lang);
  if (token === FLOOR) return p.aboveZero;
  if (Object.prototype.hasOwnProperty.call(p.bands, token)) return p.more(p.bands[token]);
  const at = token.indexOf("@");
  if (at !== -1) {
    return `${resolveProse(token.slice(0, at), lang)}{br}{br}${p.noteLabel}${resolveProse(token.slice(at + 1), lang)}`;
  }
  return resolveProse(token, lang);
}
