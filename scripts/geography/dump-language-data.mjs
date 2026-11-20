// Writes data-raw/geography/languages/ — the raw material for the Languages topic,
// harvested from Wikidata.
//
//   node scripts/geography/dump-language-data.mjs
//
// MEMBERSHIP is a UNION of two readings, so neither a class gap nor a stray rank can drop a
// language. An item qualifies when EITHER its class path (P31/P279*) reaches one of WHITELIST
// and it carries a positive speaker count (P1098 > 0), OR it carries an ISO 639 code — 639-1
// (P218) or 639-2 (P219) outright, 639-3 (P220) with a speaker count — regardless of class. An
// ISO code names a language, macrolanguage or collective, never a class decision, so the code
// branch rescues Serbian, Filipino, Mandarin, the sign languages and the like that the class
// whitelist misses, and is robust against a preferred-rank P31 hiding the real classes (Hindi).
// The only subtraction: the type-of-language meta-items that carry a collective code (crp, und,
// mis, art, sgn), the sole coded instances of Q20829075 — a kind of language, not a language.
// The whitelist still TYPES each member (dead / historical / dialect / …) for the opt-in
// checkboxes. Natural language (Q33742) is deliberately not a base class: Wikidata applies it
// inconsistently. See the overlap research in scripts/test/Wikidata_Language_*.
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
 *  the flags the bucketer reads; `alias` (skos:altLabel) rides along unflagged for
 *  transparency. The language sits on each term's tag. */
const NAMES = (values) => `SELECT ?item ?lang ?term ?type WHERE {
  VALUES ?item { ${values} }
  { ?item rdfs:label ?term. BIND("pref" AS ?type) }
  UNION { ?item skos:altLabel ?term. BIND("alias" AS ?type) }
  UNION { ?item wdt:P1448 ?term. BIND("official" AS ?type) }
  UNION { ?item wdt:P1813 ?term. BIND("short" AS ?type) }
  BIND(LANG(?term) AS ?lang)
  FILTER(REGEX(?lang, "^(${SKRIBBL.join("|")})(-|$)"))
}`;

/** The ISO code and type flags for a chunk of items. Bounding ?item with VALUES keeps the ten
 *  P31/P279* EXISTS cheap; the whole-membership version times the endpoint out (language family
 *  / group have huge subclass trees). The speaker figure is fetched apart (SPEAKERS), the agreed
 *  selection reading each P1098 statement's qualifiers rather than a bare aggregate. */
const STRUCTURE = (values) => `SELECT ?item
  (MIN(?p218) AS ?iso1) (MIN(?p219) AS ?iso2) (MIN(?p220) AS ?iso3)
  ${FLAG_KEYS.map((k) => `?${k}`).join(" ")} WHERE {
  VALUES ?item { ${values} }
  OPTIONAL { ?item wdt:P218 ?p218. }
  OPTIONAL { ?item wdt:P219 ?p219. }
  OPTIONAL { ?item wdt:P220 ?p220. }
  ${FLAG_KEYS.map((k) => `BIND(EXISTS { ?item wdt:P31/wdt:P279* wd:${FLAG[k]} } AS ?${k})`).join("\n  ")}
} GROUP BY ?item ${FLAG_KEYS.map((k) => `?${k}`).join(" ")}`;

/** Every non-deprecated P1098 statement for a chunk of items, with the qualifiers the agreed
 *  speaker selection reads: point in time (P585), applies to part (P518, the figure's kind) and
 *  the place qualifiers (P3005 / P276 / P1001). `speakerFigure` folds them into one figure. */
const SPEAKERS = (values) => `SELECT ?item ?st ?v ?t ?ap ?pl WHERE {
  VALUES ?item { ${values} }
  ?item p:P1098 ?st. ?st ps:P1098 ?v; wikibase:rank ?rank.
  FILTER(?rank != wikibase:DeprecatedRank)
  OPTIONAL { ?st pq:P585 ?t. }
  OPTIONAL { ?st pq:P518 ?ap. }
  OPTIONAL { ?st pq:P3005|pq:P276|pq:P1001 ?pl. }
}`;

/** The P518 (applies to part) values that make a P1098 figure a total, a first-language or a
 *  second-language count; any other value (a place, a group, a year) reads as a by-place figure.
 *  From #38's _scripts/speakers.mjs — the agreed selection's reference implementation. */
const SPK_TOTAL = new Set(["Q16868672", "Q218005", "Q13780930", "Q16657634"]);
const SPK_L1 = new Set(["Q36870", "Q924130"]);
const SPK_L2 = new Set(["Q125421", "Q150352"]);
const CURRENT_YEAR = new Date().getUTCFullYear();

/** A statement's kind from its P518 set: total (none, or all total-ish), L1, L2, else "other". */
const spkKind = (ap) => {
  const a = [...ap];
  if (!a.length || a.every((x) => SPK_TOTAL.has(x))) return "total";
  if (a.every((x) => SPK_L1.has(x))) return "L1";
  if (a.every((x) => SPK_L2.has(x))) return "L2";
  return "other";
};

/** The worldwide total at one point in time: the larger of (best first-language + best second-
 *  language) and the best standalone total. Summing L1 and L2 only within the same date keeps a
 *  figure a real simultaneous count, never two eras added together. */
const groupPeak = (G) => {
  const best = (kind) => G.reduce((m, s) => (spkKind(s.ap) === kind ? Math.max(m, s.v) : m), 0);
  return Math.max(best("L1") + best("L2"), best("total"));
};

/** The agreed speaker figure for one language: its peak worldwide speaker count. Every non-
 *  projection P1098 statement is grouped by point in time, and across those dates we take the
 *  largest `groupPeak` — so a declined or dead language keeps its historical maximum without a
 *  type special-case, and a growing one its current figure. A P585 year after this one is a
 *  projection, not a peak, and drops out unless it is all there is. With only by-place figures
 *  (no worldwide total/L1/L2), the peak per place summed stands in for the missing total. */
const speakerFigure = (S) => {
  if (!S.length) return null;
  let W = S.filter((s) => !s.pl.size && spkKind(s.ap) !== "other");
  const dated = W.filter((s) => s.t <= CURRENT_YEAR);
  if (dated.length) W = dated;
  if (W.length) {
    const byTime = {};
    for (const s of W) (byTime[s.t] ??= []).push(s);
    return Math.max(...Object.values(byTime).map(groupPeak));
  }
  const byPlace = {};
  for (const s of S) for (const p of s.pl.size ? [...s.pl] : [...s.ap]) (byPlace[p] ??= []).push(s);
  return Object.values(byPlace).reduce((n, ss) => n + Math.max(...ss.map((s) => s.v)), 0);
};

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

/** The membership Q-ids: the class-gated speaker set unioned with every ISO-coded language
 *  (639-1 / -2 outright, 639-3 with a speaker count), minus the type-of-language meta-items that
 *  carry a collective code. Narrow queries anchored on the cheap side before any path traversal,
 *  rather than one that walks the whole family and filters. See the header for the rule. */
async function memberIds() {
  const bySpeakers = await query(`SELECT DISTINCT ?l WHERE {
    ?l wdt:P1098 ?spk. FILTER(?spk > 0)
    ?l wdt:P31/wdt:P279* ?c. VALUES ?c { ${wlValues} }
  }`);
  const byIso1 = await query(`SELECT DISTINCT ?l WHERE { ?l wdt:P218 []. }`);
  const byIso2 = await query(`SELECT DISTINCT ?l WHERE { ?l wdt:P219 []. }`);
  const byIso3 = await query(`SELECT DISTINCT ?l WHERE { ?l wdt:P220 []. ?l wdt:P1098 ?spk. FILTER(?spk > 0) }`);
  // The only coded instances of "type of language" (Q20829075): crp, und, mis, art, sgn. A kind
  // of language, not a language — so they drop out, without a hand-kept Q-id list.
  const exclude = new Set(
    (await query(`SELECT DISTINCT ?l WHERE { ?l wdt:P31 wd:Q20829075. }`)).map((r) => qid(r.l.value)),
  );
  const ids = [...bySpeakers, ...byIso1, ...byIso2, ...byIso3].map((r) => qid(r.l.value));
  return [...new Set(ids)].filter((q) => !exclude.has(q));
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
        flags: Object.fromEntries(FLAG_KEYS.map((k) => [k, r[k]?.value === "true"])),
      };
    }
    process.stdout.write(`  structure ${Math.min(i + chunk, qids.length)}/${qids.length}\r`);
    await sleep(300);
  }
  return out;
}

/** The agreed speaker figure for each of `qids`, in chunks: `{ qid: number | null }`. Reads
 *  every non-deprecated P1098 statement with its qualifiers and folds it with `speakerFigure`. */
async function dumpSpeakers(qids, chunk = 50) {
  const out = {};
  for (let i = 0; i < qids.length; i += chunk) {
    const slice = qids.slice(i, i + chunk);
    const values = slice.map((q) => `wd:${q}`).join(" ");
    const byItem = {};
    for (const r of await query(SPEAKERS(values))) {
      const item = qid(r.item.value);
      const stmts = (byItem[item] ??= {});
      const s = (stmts[r.st.value] ??= {
        v: Number(r.v.value),
        t: Number(r.t?.value?.slice(0, 4)) || 0,
        ap: new Set(),
        pl: new Set(),
      });
      if (r.ap) s.ap.add(qid(r.ap.value));
      if (r.pl) s.pl.add(r.pl.value);
    }
    for (const q of slice) {
      const fig = speakerFigure(Object.values(byItem[q] ?? {}));
      out[q] = fig != null && fig > 0 ? fig : null;
    }
    process.stdout.write(`  speakers ${Math.min(i + chunk, qids.length)}/${qids.length}\r`);
    await sleep(300);
  }
  return out;
}

/** Fetch names for `qids` in chunks, folded into
 *  `{ qid: { name, users?, code?, names: { lang: [{ name, pref?, official?, short? }] } } }`
 *  in `order`. The leading `name` (English preferred label), `users` (P1098) and `code` are a
 *  summary from `struct`, so a reader browsing the raw file sees what each entry is at a glance
 *  — the same shape the plate dump carries. The build reads them from language-structure.tsv,
 *  not here. */
async function dumpNames(qids, order, struct, chunk = 20) {
  const byItem = {};
  for (let i = 0; i < qids.length; i += chunk) {
    const values = qids.slice(i, i + chunk).map((q) => `wd:${q}`).join(" ");
    const rows = await query(NAMES(values));
    for (const r of rows) {
      const lang = r.lang?.value;
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
      ...(s.speakers != null ? { users: s.speakers } : {}),
      ...(s.code ? { code: s.code } : {}),
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
  const speakers = await dumpSpeakers(ids);
  for (const q of ids) if (struct[q]) struct[q].speakers = speakers[q] ?? null;
  console.log(`\nspeakers — ${ids.filter((q) => struct[q]?.speakers != null).length} of ${ids.length} with a figure`);

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

  // Names keyed and ordered by Q-id, not speaker rank: the build reads them by Q-id, so order is
  // cosmetic — a stable key keeps this file's diff to real name changes, not a re-rank reshuffle.
  const qidOrder = [...ids].sort((a, b) => a.localeCompare(b));
  const names = await dumpNames(ids, qidOrder, struct);
  await writeFile(join(OUT, "language-names.json"), JSON.stringify(names, null, 2) + "\n", "utf8");
  console.log(`\nnames — ${qidOrder.length}`);
}

main().catch((err) => {
  console.error("dump-language-data failed:", err.message);
  process.exit(1);
});
