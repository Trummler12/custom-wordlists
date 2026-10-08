// Shared Wikidata helpers for the query analysis: one SPARQL call with the identifying
// User-Agent Wikidata asks for, retried on throttling, and a cache in ../_data/cache so a
// re-run of an analysis costs no requests.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ENDPOINT = "https://query.wikidata.org/sparql";
const UA = "custom-wordlists-analysis/1.0 (https://github.com/Trummler12/custom-wordlists)";
const CACHE = join(dirname(fileURLToPath(import.meta.url)), "..", "_data", "cache");

/** The bindings of a SELECT query, each flattened to `{ var: value }`. Cached by query
 *  text; pass `{ fresh: true }`, or run with WD_FRESH=1, to bypass it (after an edit to Wikidata). */
export async function sparql(query, { fresh = process.env.WD_FRESH === "1" } = {}) {
  const key = createHash("sha1").update(query).digest("hex").slice(0, 16);
  const file = join(CACHE, `${key}.json`);
  if (!fresh) {
    try {
      return JSON.parse(await readFile(file, "utf8"));
    } catch {
      /* not cached yet */
    }
  }
  for (let attempt = 0; ; attempt++) {
    const retry = async (why) => {
      if (attempt >= 4) throw new Error(`${why} after ${attempt + 1} attempts`);
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
    };
    let res, body;
    // The server also drops the connection mid-answer (a timed-out query), which surfaces
    // as a thrown fetch, not as a status.
    try {
      res = await fetch(`${ENDPOINT}?format=json&query=${encodeURIComponent(query)}`, {
        headers: { "User-Agent": UA, Accept: "application/sparql-results+json" },
      });
      if (res.ok) body = await res.json();
    } catch (err) {
      await retry(`connection lost (${err.message})`);
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      await retry(`HTTP ${res.status}`);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const rows = body.results.bindings.map((b) =>
      Object.fromEntries(Object.entries(b).map(([k, v]) => [k, v.value.replace("http://www.wikidata.org/entity/", "")])),
    );
    await mkdir(CACHE, { recursive: true });
    await writeFile(file, JSON.stringify(rows), "utf8");
    return rows;
  }
}

/** English labels for a set of ids (Q or P), falling back to the language-independent
 *  `mul` label: names that read the same everywhere ("South Park") are often stored
 *  only there. */
export async function labels(ids) {
  ids = [...new Set(ids)];
  // Chunked: a few hundred ids already overflow the GET request's URI.
  if (ids.length > 200) {
    const out = {};
    for (let i = 0; i < ids.length; i += 200) Object.assign(out, await labels(ids.slice(i, i + 200)));
    return out;
  }
  if (!ids.length) return {};
  const rows = await sparql(
    `SELECT ?id ?en ?mul WHERE { VALUES ?id { ${ids.map((i) => `wd:${i}`).join(" ")} }
      OPTIONAL { ?id rdfs:label ?en FILTER(LANG(?en)="en") }
      OPTIONAL { ?id rdfs:label ?mul FILTER(LANG(?mul)="mul") } }`,
  );
  return Object.fromEntries(rows.filter((r) => r.en || r.mul).map((r) => [r.id, r.en ?? r.mul]));
}
