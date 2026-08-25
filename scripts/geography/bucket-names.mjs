// Turns one country's geonames alternate names (per language, each carrying the
// pref/short/colloq flags dump-geonames.mjs kept) into our named-forms shape: a `pref`
// canonical name, an optional shorter `short` and fuller `long`, and the rest as
// `others`. The flags are the signal — but with two guards they don't give:
//
//  - Comma-bearing names are ISO sort-inverted artifacts ("Congo, The Democratic
//    Republic Of", "Korea, Republic of") and stay out of pref/short/long.
//  - OVERRIDES correct the rare geonames mislabel by ISO and language, the general
//    rule holding for everything else (per Trummler's call: default for the common
//    case, override the exceptions).

/** Rare geonames mislabels, corrected by ISO and language — the value replaces the
 *  bucketed result for that language outright. geonames flags Taiwan's formal name as
 *  colloquial, which would otherwise banish it to `others`. */
export const OVERRIDES = {
  TW: { en: { pref: "Taiwan", long: "Taiwan, Republic of China", others: ["Taiwan R.O.C.", "Taiwan ROC"] } },
  // geonames marks the formal "Republic of Türkiye" preferred and offers no plain
  // "Turkey"; make the common name pref and carry "Turkey" so the coverage list (which
  // spells it "Turkey") still matches.
  TR: { en: { pref: "Türkiye", long: "Republic of Türkiye", others: ["Turkey", "Republic of Turkey"] } },
};

const hasComma = (n) => n.includes(",");
const byLen = (a, b) => a.name.length - b.name.length;
const shortest = (list) => (list.length ? [...list].sort(byLen)[0] : undefined);
const longest = (list) => (list.length ? [...list].sort((a, b) => b.name.length - a.name.length)[0] : undefined);

/** One language's flag list → a plain string (a single name) or
 *  `{ pref, short?, long?, others? }`. */
export function bucketLang(entries) {
  if (!entries?.length) return undefined;
  if (entries.length === 1) return entries[0].name;

  const used = new Set();
  const take = (n) => (used.add(n), n);
  const free = () => entries.filter((e) => !used.has(e.name));

  // pref: a pref+short name, else a plain pref, else (no pref at all) a short name,
  // else the shortest — non-comma preferred throughout, shortest within a class.
  const clean = entries.filter((e) => !hasComma(e.name));
  const pool = clean.length ? clean : entries;
  const prefs = pool.filter((e) => e.pref);
  const prefShort = prefs.filter((e) => e.short);
  let prefName;
  let prefIsShort;
  if (prefShort.length) [prefName, prefIsShort] = [shortest(prefShort).name, true];
  else if (prefs.length) [prefName, prefIsShort] = [shortest(prefs).name, false];
  else if (pool.some((e) => e.short)) [prefName, prefIsShort] = [shortest(pool.filter((e) => e.short)).name, true];
  else [prefName, prefIsShort] = [shortest(pool).name, false];
  take(prefName);

  // long: the longer of two prefs, else the longest non-colloquial, non-comma name
  // longer than pref. A comma name never becomes long — it is an ISO inverted artifact
  // ("Micronesia, Federated States Of"), left for `others`.
  let longName;
  const otherPref = free().filter((e) => e.pref);
  if (prefs.length >= 2 && otherPref.length) {
    longName = longest(otherPref).name;
  } else {
    const pick = longest(free().filter((e) => !e.colloq && !hasComma(e.name) && e.name.length > prefName.length));
    if (pick) longName = pick.name;
  }
  if (longName) take(longName);

  // short: only when pref is not itself a short name — then a short-flagged, non-comma
  // name (non-colloquial preferred), the shortest such.
  let shortName;
  if (!prefIsShort) {
    const cand = free().filter((e) => e.short && !hasComma(e.name));
    const pick = shortest(cand.filter((e) => !e.colloq)) ?? shortest(cand);
    if (pick) shortName = take(pick.name);
  }

  const others = free().map((e) => e.name);
  const out = { pref: prefName };
  if (shortName) out.short = shortName;
  if (longName) out.long = longName;
  if (others.length) out.others = others;
  return out;
}

/** All the given languages for one country, bucketed, with OVERRIDES applied. `names`
 *  is the dump's per-language flag lists; `iso` selects the override set. */
export function bucketCountry(names, iso, langs) {
  const out = {};
  const over = OVERRIDES[iso] ?? {};
  for (const lang of langs) {
    const v = over[lang] ?? bucketLang(names[lang]);
    if (v !== undefined) out[lang] = v;
  }
  return out;
}

/** The common English name of a bucketed country, for matching against the coverage
 *  and recognition lists: the English pref, or the string if English is a single name. */
export function commonEn(bucketed) {
  const en = bucketed?.en;
  if (en === undefined) return undefined;
  return typeof en === "string" ? en : en.pref ?? en.short ?? en.long;
}
