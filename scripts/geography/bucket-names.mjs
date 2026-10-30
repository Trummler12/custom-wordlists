// Turns one entity's flagged Wikidata names — per language, each carrying pref (rdfs:label),
// official (P1448), short (P1813) or title (that language's Wikipedia article) — into our
// named-forms shape: a `pref` canonical name, an optional shorter `short` and fuller `long`,
// and any surplus endorsed form as `others`. The slot a flag earns, in this order:
//   pref     = rdfs:label  (exactly one per language)
//   official = P1448        longer than pref => long, shorter => short
//   short    = P1813        => short, when that slot is free
//   title    = article      => short when shorter than pref and the slot is still free, else
//                              others. Wikipedia titles the common name where Wikidata's label
//                              is often the formal one ("Republik Abchasien" => "Abchasien");
//                              a disambiguated title ("Victoria (Seychelles)", "Victoria,
//                              Seychelles") is no name and drops out. (Trummler, 2026-10-09,
//                              from #38's formal-label finding.)
// Unflagged skos:altLabel aliases are the discardable flood and never reach a bucket (they
// are not dumped). See dump-country-data.mjs (source) and build-country-data.mjs (consumer).

const byLen = (a, b) => a.name.length - b.name.length;
const shortest = (list) => (list.length ? [...list].sort(byLen)[0] : undefined);
const longest = (list) => (list.length ? [...list].sort((a, b) => b.name.length - a.name.length)[0] : undefined);

/** A name with cased letters, none of them lowercase, and no uncased-script letters — an ISO
 *  or technical code (NG, EC, U.S., É-U), not a drawable name. Wikidata mis-files these under
 *  P1813; a genuine abbreviation (USA, UK) is whitelisted by the caller. CJK, Hebrew and
 *  Arabic (uncased) never match, so their names are safe. */
export const isCode = (s) => /\p{Lu}/u.test(s) && !/\p{Ll}/u.test(s) && !/\p{Lo}/u.test(s);

/** One language's Wikidata term list => a plain string (a lone name) or
 *  `{ pref, short?, long?, others? }`. Entries carry `{ name, pref?, official?, short? }`;
 *  unflagged aliases and code-like names (bar those in `keep`) are dropped. */
export function bucketLangWiki(entries, keep) {
  const endorsed = (e) => e.pref || e.official || e.short;
  const all = (entries ?? []).filter((e) => (endorsed(e) || e.title) && !(isCode(e.name) && !keep?.has(e.name)));
  if (!all.some(endorsed)) return undefined;

  // No rdfs:label in this language (only an official/short) is rare; keep pref non-empty.
  const prefEntry = all.find((e) => e.pref) ?? shortest(all.filter(endorsed));
  const prefName = prefEntry.name;
  const disambiguated = (n) => /[(（]/.test(n) || n.startsWith(`${prefName},`);
  const flagged = all.filter((e) => endorsed(e) || !disambiguated(e.name));
  const prefIsShort = !!prefEntry.short;

  const used = new Set([prefName]);
  const free = () => flagged.filter((e) => !used.has(e.name));
  const take = (n) => (used.add(n), n);

  // long: the longest endorsed form beyond pref. The plan's "closest length" tiebreak among
  // rival officials waits for a real conflicting case; longest is the safe default meanwhile.
  let longName;
  const longCand = free().filter((e) => (e.official || e.short) && e.name.length > prefName.length);
  if (longCand.length) longName = take(longest(longCand).name);

  // short: only when pref is not itself short-flagged, else pref already serves as the short.
  let shortName;
  if (!prefIsShort) {
    const shorter = free().filter((e) => e.name.length < prefName.length);
    const shortCand = shorter.some(endorsed) ? shorter.filter(endorsed) : shorter;
    if (shortCand.length) shortName = take(shortest(shortCand).name);
  }

  const others = free().map((e) => e.name);
  if (!shortName && !longName && !others.length) return prefName;
  const out = { pref: prefName };
  if (shortName) out.short = shortName;
  if (longName) out.long = longName;
  if (others.length) out.others = others;
  return out;
}
