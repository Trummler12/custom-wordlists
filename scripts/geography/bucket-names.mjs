// Turns one country's geonames alternate names (per language, each carrying the
// pref/short/colloq flags dump-geonames.mjs kept) into our named-forms shape: a `pref`
// canonical name, an optional shorter `short` and fuller `long`, and the rest as
// `others`. The geonames flags are the signal, with three guards they don't give:
//
//  - Only pref/short-flagged names may fill pref/short/long. An unflagged name (a
//    dative form like "Vereinigten Staaten von Amerika", a doubtful spelling like
//    "Malaysien") is not an endorsed form, so it stays in `others` rather than being
//    asserted as a canonical name.
//  - A language with no pref flag at all has singled none out — every variant is read
//    as equally preferred, so it still yields a pref and a long (en-Croatia).
//  - Comma-bearing names are ISO sort-inverted artifacts ("Korea, Republic of") and
//    stay out of pref/short/long.
//
// Where the flags are wrong or a name is missing, an OVERRIDES entry fixes that one
// case by hand; the general rule holds for everything else.

// ───────────────────────────────────────────────────────────────────────────────────
// USER-EDITABLE — per-country name overrides, keyed by ISO code then language. The
// value replaces the bucketed result for that language outright. Add an entry where the
// geonames flags give a country the wrong shape:
//   • geonames omits a name we need — TR has no plain "Turkey", carried here so the
//     coverage list (which spells it that way) still matches.
//   • a legitimate formal name is unflagged, so the rule leaves it in `others` — DE's
//     "Federal Republic of Germany", promoted to `long` by hand.
// ───────────────────────────────────────────────────────────────────────────────────
export const OVERRIDES = {
  DE: { en: { pref: "Germany", long: "Federal Republic of Germany" } },
  TR: { en: { pref: "Republic of Türkiye", short: "Türkiye", others: ["Turkey", "Republic of Turkey"] } },
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

  // No pref flag anywhere means none was singled out — read every variant as equally
  // preferred, so a language like en-Croatia ["Croatia"(short), "Republic of Croatia"]
  // still yields a pref and a long.
  const src = entries.some((e) => e.pref) ? entries : entries.map((e) => ({ ...e, pref: true }));

  const used = new Set();
  const take = (n) => (used.add(n), n);
  const free = () => src.filter((e) => !used.has(e.name));

  // pref: a pref+short name, else a plain pref, else (no pref at all) a short name,
  // else the shortest — non-comma preferred throughout, shortest within a class.
  const clean = src.filter((e) => !hasComma(e.name));
  const pool = clean.length ? clean : src;
  const prefs = pool.filter((e) => e.pref);
  const prefShort = prefs.filter((e) => e.short);
  let prefName;
  let prefIsShort;
  if (prefShort.length) [prefName, prefIsShort] = [shortest(prefShort).name, true];
  else if (prefs.length) [prefName, prefIsShort] = [shortest(prefs).name, false];
  else if (pool.some((e) => e.short)) [prefName, prefIsShort] = [shortest(pool.filter((e) => e.short)).name, true];
  else [prefName, prefIsShort] = [shortest(pool).name, false];
  take(prefName);

  // long: the longer of two prefs, else the longest other flagged name longer than
  // pref. Only pref/short-flagged names are eligible — an unflagged one (a dative form
  // like "Vereinigten Staaten von Amerika", a doubtful spelling like "Malaysien") is
  // not an endorsed form, so it stays in `others` rather than being asserted as the
  // long name; comma-bearing ISO inverted forms likewise.
  let longName;
  const otherPref = free().filter((e) => e.pref);
  if (prefs.length >= 2 && otherPref.length) {
    longName = longest(otherPref).name;
  } else {
    const pick = longest(free().filter((e) => (e.pref || e.short) && !e.colloq && !hasComma(e.name) && e.name.length > prefName.length));
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
