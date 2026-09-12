// Parsing the Language-Coverage page's URL into its view state. The canonical path is
//   <base><topic>/<lang?>/<uiLang?>
// where <lang> is the content language whose gaps sort to the top and <uiLang> the
// interface language for the page's own chrome (both optional). The GitHub Pages 404
// fallback (see 404.html, a later batch) packs an as-landed path into a `?/<path>` query
// on coverage.html, so a URL may arrive in either shape — hence the query restore here.
//
// Pure and DOM-free on purpose: the same functions drive both the page and the 404 shim,
// and the tests run in the node environment.

/** The Wikidata-sourced topics that have a coverage dataset (data/coverage/<topic>.json). */
export const COVERAGE_TOPICS = ["countries", "capitals", "languages", "continents"] as const;
export type CoverageTopic = (typeof COVERAGE_TOPICS)[number];

const TOPICS = new Set<string>(COVERAGE_TOPICS);

export interface Route {
  /** A known coverage topic, or null when the path names none (render the index). */
  topic: CoverageTopic | null;
  /** The content language to pre-sort by; null when the path omits it. */
  lang: string | null;
  /** The interface language for the page chrome; null when the path omits it. */
  uiLang: string | null;
}

/** Segments (already base-stripped, empties removed) => the route. */
export function segmentsToRoute(segs: string[]): Route {
  const [topic, lang = null, uiLang = null] = segs;
  return { topic: topic && TOPICS.has(topic) ? (topic as CoverageTopic) : null, lang, uiLang };
}

/** Strip the deploy base and the `coverage.html` filename from a pathname, returning the
 *  remaining path segments. */
export function stripBase(pathname: string, base: string): string[] {
  let p = pathname;
  if (base && p.startsWith(base)) p = p.slice(base.length);
  return p
    .split("/")
    .filter((s) => s && s !== "coverage.html");
}

/** The 404 fallback packs the original path into `?/a/b/c` (the rafgraph SPA-on-Pages
 *  pattern). Returns the decoded segments, or null when no such query is present. */
export function restoreFromQuery(search: string): string[] | null {
  if (!search.startsWith("?/")) return null;
  return search
    .slice(2)
    .split("&")[0]
    .split("/")
    .filter(Boolean)
    .map(decodeURIComponent);
}

/** Resolve the active route from the location parts and the deploy base. A `?/…` restore
 *  query wins over the pathname, since it carries the path the reader actually landed on. */
export function resolveRoute(pathname: string, search: string, base: string): Route {
  return segmentsToRoute(restoreFromQuery(search) ?? stripBase(pathname, base));
}
