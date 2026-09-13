// Parsing the Language-Coverage page's URL into its view state. The canonical path is
//   <base>coverage/<topic>/<lang?>/<uiLang?>
// where <lang> is the content language whose gaps sort to the top and <uiLang> the
// interface language for the page's own chrome (both optional). The `coverage/` prefix
// keeps these routes out of the main app's space and lets the Pages 404 fallback (public/
// 404.html) recognise them: it packs the as-landed path into a `?/<path>` query on
// coverage.html, which the page's inline restore script rewrites back to the clean path —
// so a URL reaches resolveRoute either already-clean or via that query.
//
// Pure and DOM-free on purpose: the same functions drive both the page and the shims,
// and the tests run in the node environment.

/** The path segment that fronts every coverage route (and the built entry filename). */
const PREFIX = "coverage";

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

/** Which coverage topic a manifest topic feeds its data into, or null when it has no
 *  coverage page. `languages`/`continents` are single 1:1 topics, matched by id;
 *  `countries`/`capitals` are split across the per-continent leaves and recognised by
 *  their file (`*countries.json`). A synthesized merge topic (the app's own "Countries"
 *  row) carries no file — its id ends with the stem its contributors share
 *  ("geography-human-countries"), so fall back to that. */
export function coverageTopicOf(topic: { id: string; path: string }): CoverageTopic | null {
  if (topic.id === "languages") return "languages";
  if (topic.id === "continents") return "continents";
  const key = topic.path || topic.id;
  if (key.endsWith("countries.json") || key.endsWith("-countries")) return "countries";
  if (key.endsWith("capitals.json") || key.endsWith("-capitals")) return "capitals";
  return null;
}

/** Segments (already base-stripped, empties removed) => the route. */
export function segmentsToRoute(segs: string[]): Route {
  const [topic, lang = null, uiLang = null] = segs;
  return { topic: topic && TOPICS.has(topic) ? (topic as CoverageTopic) : null, lang, uiLang };
}

/** Strip the deploy base and the `coverage.html` filename from a pathname, returning the
 *  remaining path segments (the `coverage/` route prefix is dropped in resolveRoute). */
export function stripBase(pathname: string, base: string): string[] {
  let p = pathname;
  if (base && p.startsWith(base)) p = p.slice(base.length);
  return p
    .split("/")
    .filter((s) => s && s !== "coverage.html");
}

/** Drop the leading `coverage/` route prefix, whichever source the segments came from. */
export function dropPrefix(segs: string[]): string[] {
  return segs[0] === PREFIX ? segs.slice(1) : segs;
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
  return segmentsToRoute(dropPrefix(restoreFromQuery(search) ?? stripBase(pathname, base)));
}
