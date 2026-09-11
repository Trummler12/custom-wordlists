// Writes data-raw/geography/languages/ — the raw material for the Languages topic,
// harvested from Wikidata.
//
//   node scripts/geography/dump-language-data.mjs
//
// MEMBERSHIP is the modern-language FAMILY, gated by a prominence signal. A language
// qualifies when P31/P279* reaches one of WHITELIST *and* it either carries an ISO
// 639-1 code (P218) or an ever-documented positive speaker count (P1098 > 0). Natural
// language (Q33742) is deliberately NOT the base: Wikidata applies it inconsistently —
// German and Chinese are `modern language` only and carry no natural tag, so a natural
// membership silently drops them. The speaker/ISO gate keeps the list to the well-known
// ~2000; a bare ISO 639-1 code rescues Latin, Pali and the like (dead but drawable) that
// have no living speaker count. See the overlap research in scripts/test/Wikidata_Language_*.
//
// language-structure.tsv carries the numbers and flags — the ISO code, the speaker count
// that tiers the list, and one boolean per linguistic-type class the build folds into its
// opt-in checkboxes — split from the names so a new estimate is a one-line diff. code is
// P218 (639-1) => P219 (639-2) => P220 (639-3), first present; empty when Wikidata has
// none, and the build fills it from the English name.
//
// language-names.json is the faithful raw picture, keyed by Q-id: every term Wikidata
// carries — rdfs:label (pref), skos:altLabel (alias), P1448 (official), P1813 (short) —
// in every language skribbl supports. Nothing is filtered here (the build's job).
//
// The query/dumpNames/NAMES/SKRIBBL machinery mirrors dump-country-data.mjs; the code-
// review pass (Z) is to extract the shared half into one module.
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "data-raw", "geography", "languages");
const ENDPOINT = "https://query.wikidata.org/sparql";
const UA = { "User-Agent": "custom-wordlists/1.0 (https://github.com/Trummler12/custom-wordlists)" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The linguistic-type classes the build routes each language by, each tested with
 *  P31/P279* so a subclass counts. These are the opt-in checkboxes; a language with
 *  none of them, in the modern family, is a plain living-modern base entry. */
const FLAG = {
  dead: "Q45762",
  extinct: "Q38058796",
  historical: "Q2315359",
  constructed: "Q33215",
  fictional: "Q2623733",
  dialect: "Q33384",
  dialectGroup: "Q1208380",
  standard: "Q399495",
  langGroup: "Q941501",
  langFamily: "Q25295",
};
const FLAG_KEYS = Object.keys(FLAG);

/** Membership: the modern-language family. The two base classes plus every flag class,
 *  so a language typed only as (say) a dead language still qualifies. */
const WHITELIST = ["Q1288568", "Q138638548", ...Object.values(FLAG)];
const wlValues = WHITELIST.map((q) => "wd:" + q).join(" ");

/** The languages skribbl officially supports (plus Chinese, a content language for the
 *  lists). The query keeps any Wikidata tag whose base is one of these, so script and
 *  regional variants (zh-hans, zh-cn, pt-br, sr-latn, nb) all come along. */
const SKRIBBL = [
  "en", "de", "bg", "cs", "da", "nl", "fi", "fr", "et", "el", "he", "hu", "it", "ja", "ko",
  "lv", "mk", "nb", "nn", "no", "pt", "pl", "ro", "ru", "sr", "sk", "es", "sv", "tl", "tr", "zh",
];

/** Every term for a chunk of items in the supported languages. `pref`/`official`/`short` are
 *  the flags the bucketer reads; `alias` (skos:altLabel) rides along unflagged for the report
 *  and transparency. The language sits on each term's tag. */
const NAMES = (values) => `SELECT ?item ?lang ?term ?type WHERE {
  VALUES ?item { ${values} }
  { ?item rdfs:label ?term. BIND("pref" AS ?type) }
  UNION { ?item skos:altLabel ?term. BIND("alias" AS ?type) }
  UNION { ?item wdt:P1448 ?term. BIND("official" AS ?type) }
  UNION { ?item wdt:P1813 ?term. BIND("short" AS ?type) }
  BIND(LANG(?term) AS ?lang)
  FILTER(REGEX(?lang, "^(${SKRIBBL.join("|")})(-|$)"))
}`;

/** The ISO code, speaker count and type flags for a chunk of items. Bounding ?item with
 *  VALUES keeps the ten P31/P279* EXISTS cheap; the whole-membership version times the
 *  endpoint out (language family / group have huge subclass trees). */
const STRUCTURE = (values) => `SELECT ?item
  (MIN(?p218) AS ?iso1) (MIN(?p219) AS ?iso2) (MIN(?p220) AS ?iso3)
  (MAX(?spk) AS ?speakers)
  ${FLAG_KEYS.map((k) => `?${k}`).join(" ")} WHERE {
  VALUES ?item { ${values} }
  OPTIONAL { ?item wdt:P218 ?p218. }
  OPTIONAL { ?item wdt:P219 ?p219. }
  OPTIONAL { ?item wdt:P220 ?p220. }
  OPTIONAL { ?item wdt:P1098 ?spk. }
  ${FLAG_KEYS.map((k) => `BIND(EXISTS { ?item wdt:P31/wdt:P279* wd:${FLAG[k]} } AS ?${k})`).join("\n  ")}
} GROUP BY ?item ${FLAG_KEYS.map((k) => `?${k}`).join(" ")}`;

/** SPARQL GET with retry on the transient statuses query.wikidata.org throws under load. */
async function query(sparql, tries = 5) {
  const url = `${ENDPOINT}?format=json&query=${encodeURIComponent(sparql)}`;
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: UA });
    } catch (err) {
      if (attempt >= tries) throw err;
      await sleep(attempt * 2000);
      continue;
    }
    if (res.ok) return (await res.json()).results.bindings;
    if (attempt >= tries || ![429, 500, 502, 503, 504].includes(res.status)) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    await sleep(attempt * 2000);
  }
}

/** `Q…` from a Wikidata entity URI. */
const qid = (uri) => uri.replace(/^.*\/entity\//, "");

/** The membership Q-ids: modern-family languages that carry a positive speaker count OR
 *  an ISO 639-1 code. Two narrow queries (each anchored on the cheap side before the
 *  path traversal) unioned, rather than one that walks the whole family and filters. */
async function memberIds() {
  const bySpeakers = await query(`SELECT DISTINCT ?l WHERE {
    ?l wdt:P1098 ?spk. FILTER(?spk > 0)
    ?l wdt:P31/wdt:P279* ?c. VALUES ?c { ${wlValues} }
  }`);
  const byIso = await query(`SELECT DISTINCT ?l WHERE {
    ?l wdt:P218 ?code.
    ?l wdt:P31/wdt:P279* ?c. VALUES ?c { ${wlValues} }
  }`);
  return [...new Set([...bySpeakers, ...byIso].map((r) => qid(r.l.value)))];
}

/** Structure for `qids` in chunks: `{ qid: { code, speakers, flags } }`. */
async function dumpStructure(qids, chunk = 40) {
  const out = {};
  for (let i = 0; i < qids.length; i += chunk) {
    const values = qids.slice(i, i + chunk).map((q) => `wd:${q}`).join(" ");
    for (const r of await query(STRUCTURE(values))) {
      const q = qid(r.item.value);
      out[q] = {
        code: r.iso1?.value || r.iso2?.value || r.iso3?.value || "",
        speakers: r.speakers ? Number(r.speakers.value) : null,
        flags: Object.fromEntries(FLAG_KEYS.map((k) => [k, r[k]?.value === "true"])),
      };
    }
    process.stdout.write(`  structure ${Math.min(i + chunk, qids.length)}/${qids.length}\r`);
    await sleep(300);
  }
  return out;
}

/** Fetch names for `qids` in chunks, folded into
 *  `{ qid: { name, code?, users?, names: { lang: [{ name, pref?, official?, short? }] } } }`
 *  in `order`. The leading `name` (English preferred label), `code` and `users` (P1098) are a
 *  summary from `struct`, so a reader browsing the raw file sees what each entry is at a glance
 *  — the same shape the plate dump carries. The build reads them from language-structure.tsv,
 *  not here. */
async function dumpNames(qids, order, struct, chunk = 20) {
  const byItem = {};
  for (let i = 0; i < qids.length; i += chunk) {
    const values = qids.slice(i, i + chunk).map((q) => `wd:${q}`).join(" ");
    const rows = await query(NAMES(values));
    for (const r of rows) {
      const lang = r.lang.value;
      if (!lang) continue; // an untagged monolingual value is unusable without a language
      const item = qid(r.item.value);
      const langMap = (byItem[item] ??= {});
      const nameMap = (langMap[lang] ??= {});
      const entry = (nameMap[r.term.value] ??= { name: r.term.value });
      entry[r.type.value] = true;
    }
    process.stdout.write(`  names ${Math.min(i + chunk, qids.length)}/${qids.length}\r`);
    await sleep(300);
  }
  // Deterministic order so a re-dump diffs only on real change, not on the order WDQS
  // happened to return terms — and their flags — in: preferred label first, then official,
  // short, plain alias, alphabetical within each, and the flag keys themselves in that same
  // fixed order. The build reads by flag regardless, so this is purely for the file's readers
  // and its diffs.
  const FLAGS = ["pref", "official", "short", "alias"];
  const rank = (t) => FLAGS.findIndex((f) => t[f]);
  const canon = (t) => ({ name: t.name, ...Object.fromEntries(FLAGS.filter((f) => t[f]).map((f) => [f, true])) });
  const out = {};
  for (const q of order) {
    const langMap = byItem[q] ?? {};
    const names = {};
    for (const lang of Object.keys(langMap).sort()) {
      names[lang] = Object.values(langMap[lang])
        .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
        .map(canon);
    }
    const name = (names.en ?? []).find((t) => t.pref)?.name;
    const s = struct?.[q] ?? {};
    out[q] = {
      ...(name ? { name } : {}),
      ...(s.code ? { code: s.code } : {}),
      ...(s.speakers != null ? { users: s.speakers } : {}),
      names,
    };
  }
  return out;
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const ids = await memberIds();
  console.log(`members — ${ids.length}`);
  const struct = await dumpStructure(ids);

  // Descending by speakers, so the file reads in tier order and the build cuts thresholds
  // down a sorted list. No figure sorts last (Latin's absent count). Ties break by Q-id, so
  // the order is deterministic — a re-dump doesn't reshuffle equal-count languages.
  const ranked = ids
    .map((q) => ({ lang: q, ...struct[q] }))
    .sort((a, b) => (b.speakers ?? -1) - (a.speakers ?? -1) || a.lang.localeCompare(b.lang));

  const tsv = ranked.map((l) =>
    [l.lang, l.code, l.speakers ?? "", ...FLAG_KEYS.map((k) => (l.flags[k] ? "1" : ""))].join("\t"),
  );
  await writeFile(
    join(OUT, "language-structure.tsv"),
    `# qid\tcode (P218/P219/P220)\tspeakers (P1098)\t${FLAG_KEYS.join("\t")}\n` + tsv.join("\n") + "\n",
    "utf8",
  );
  console.log(`\nstructure — ${ranked.length}`);

  const order = ranked.map((l) => l.lang);
  const names = await dumpNames(order, order, struct);
  await writeFile(join(OUT, "language-names.json"), JSON.stringify(names, null, 2) + "\n", "utf8");
  console.log(`\nnames — ${order.length}`);
}

main().catch((err) => {
  console.error("dump-language-data failed:", err.message);
  process.exit(1);
});
