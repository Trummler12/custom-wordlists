// A read-only worklist of the Wikidata data issues the country/capital dumps run into, so the
// maintainer can propose fixes at the source.
//
//   node scripts/geography/report-name-quality.mjs
//
// It writes data-raw/geography/name-quality-report.md and touches nothing else. Three strands,
// each with the Wikidata link to jump and edit:
//
//   CODES — a name Wikidata files under P1813 (short name) that is really an ISO/technical
//     code (NG, EC). The build drops these; they belong in P297/P298. (See the reasoning in
//     _untracked/Prompts/Country_Code_Correct_Places.md.)
//   MISSING — a content language with no usable name at all, so the list falls back to English.
//     Adding a Wikidata label fills it.
//   OVERRIDES — where name-overrides.json compensates a formal/realm/absent label. Where the
//     common name already sits in the dump as an altLabel, promoting it on Wikidata (to the
//     label or a short name) would retire the override.
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isCode, bucketLangWiki } from "./bucket-names.mjs";

const RAW = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "data-raw", "geography", "countries");
const LANGS = ["en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant"];
const LANG_SRC = {
  en: ["en"], de: ["de"], es: ["es"], fr: ["fr"], it: ["it"], ja: ["ja"], ko: ["ko"],
  "zh-Hans": ["zh-hans", "zh-cn", "zh-sg", "zh-my", "zh"],
  "zh-Hant": ["zh-hant", "zh-tw", "zh-hk", "zh-mo"],
};
const pickLang = (names, tag) => { for (const s of LANG_SRC[tag]) if (names?.[s]?.length) return names[s]; return undefined; };
const link = (qid) => `https://www.wikidata.org/wiki/${qid}`;
const esc = (s) => String(s).replace(/\|/g, "\\|");

const rd = async (f) => JSON.parse(await readFile(join(RAW, f), "utf8"));
const stripComment = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== "_comment"));

const countries = await rd("country-names.json");
const capitals = await rd("capital-names.json");
const abbr = await rd("name-abbreviations.json");
const legit = new Set(abbr.legit);
const acknowledged = new Set(abbr.acknowledged);
// The build keeps a code only when it is legit AND reads as a word (3+ letters, letters only).
const KEEP = new Set(abbr.legit.filter((s) => /^\p{Lu}{3,}$/u.test(s)));
const overrides = stripComment(await rd("name-overrides.json"));
const territories = stripComment(await rd("sovereign-territories.json"));

const bucketWiki = (names) => {
  const out = {};
  for (const lang of LANGS) {
    const v = bucketLangWiki(pickLang(names, lang), KEEP);
    if (v !== undefined) out[lang] = v;
  }
  return out;
};
const prefOf = (v) => (v == null ? undefined : typeof v === "string" ? v : v.pref ?? v.short ?? v.long);

/** The drawable English name, for labelling a row: an override's en, a territory's curated en,
 *  else the entity's own en pref. */
const enOf = (qid, names) => {
  const ov = overrides[qid]?.en;
  if (ov) return typeof ov === "string" ? ov : ov.pref;
  if (territories[qid]?.en) return territories[qid].en;
  const en = (pickLang(names, "en") ?? []).find((e) => e.pref) ?? (pickLang(names, "en") ?? [])[0];
  return en?.name ?? qid;
};

const codeRows = [];
const missingRows = [];
const seenCodes = new Set(); // every flagged code-like name the data carries, for the stale check
// What the build drops, by reason, over the content languages — for the transparency summary.
const aliasDrops = { n: 0, set: new Set() };
const codeLangs = new Map(); // dropped code-like name => Set(content langs carrying it)
for (const [kind, data] of [["country", countries], ["capital", capitals]]) {
  for (const [qid, v] of Object.entries(data)) {
    const label = enOf(qid, v.names);
    const codes = [];
    const missing = [];
    for (const lang of LANGS) {
      const list = pickLang(v.names, lang) ?? [];
      for (const e of list) {
        const flagged = e.pref || e.official || e.short;
        if (!flagged) { aliasDrops.n++; aliasDrops.set.add(e.name); continue; }
        if (!isCode(e.name)) continue;
        seenCodes.add(e.name);
        if (!KEEP.has(e.name)) (codeLangs.get(e.name) ?? codeLangs.set(e.name, new Set()).get(e.name)).add(lang);
        // flag only names not yet reviewed into legit or acknowledged
        if (!legit.has(e.name) && !acknowledged.has(e.name)) codes.push(`${lang}:${e.name}`);
      }
      // a usable name = one the build keeps (not a dropped code), or an override for this language
      const usable = list.some((e) => (e.pref || e.official || e.short) && (!isCode(e.name) || KEEP.has(e.name)));
      if (!usable && overrides[qid]?.[lang] === undefined) missing.push(lang);
    }
    if (codes.length) codeRows.push({ qid, label, kind, codes });
    if (missing.length) missingRows.push({ qid, label, kind, missing });
  }
}

// --- Stale entries: curated rules the data no longer needs (a Wikidata fix landed) ---------
// Only `acknowledged` and overrides are checked: a `legit` entry legitimately need not appear
// (USA, UK are kept preemptively), so its absence is not a signal.
const staleAck = abbr.acknowledged.filter((s) => !seenCodes.has(s));
// an override is redundant when the plain bucket already draws the same name
const redundantOverrides = [];
for (const [qid, m] of Object.entries(overrides)) {
  const names = countries[qid]?.names ?? capitals[qid]?.names;
  if (!names) continue;
  const b = bucketWiki(names);
  const langs = Object.keys(m).filter((lang) => prefOf(b[lang]) === prefOf(m[lang]));
  if (langs.length) redundantOverrides.push({ qid, label: enOf(qid, names), langs });
}

// overrides, flagged where the common name already exists as an altLabel (promotable)
const overrideRows = [];
for (const [qid, m] of Object.entries(overrides)) {
  const names = countries[qid]?.names ?? capitals[qid]?.names ?? {};
  const langs = Object.keys(m);
  const promotable = langs.filter((lang) => {
    const want = typeof m[lang] === "string" ? m[lang] : m[lang].pref;
    return (pickLang(names, lang) ?? []).some((e) => e.name === want && !e.pref);
  });
  overrideRows.push({ qid, label: enOf(qid, names), langs, promotable });
}

// The dropped code-like names, partitioned by review status, each with the langs carrying it.
// (Unreviewed ones are the "Codes mis-filed as names — new" section above.)
const wordSuitable = (s) => /^\p{Lu}{3,}$/u.test(s);
const codeLine = (names) =>
  names.sort().map((s) => `\`${esc(s)}\` (${[...codeLangs.get(s)].sort().join(", ")})`).join("; ");
const invalidCodes = [...codeLangs.keys()].filter((s) => acknowledged.has(s));
const unsuitableCodes = [...codeLangs.keys()].filter((s) => legit.has(s) && !wordSuitable(s));

const today = new Date().toISOString().slice(0, 10);
const md = [
  "# Name-quality report — data-raw/geography",
  "",
  `Generated ${today} by \`scripts/geography/report-name-quality.mjs\` (read-only). A worklist of the Wikidata issues the country and capital dumps hit — fix at the source, re-dump, and the entry here (and any override it carries) falls away.`,
  "",
  `## Codes mis-filed as names — new — ${codeRows.reduce((n, r) => n + r.codes.length, 0)}`,
  "",
  "Code-like names (no lowercase) not yet reviewed into `name-abbreviations.json`. Each is either a genuine abbreviation to add to `legit`, or an ISO/technical code Wikidata mis-files under P1813 (belongs in P297 / P298) — add it to `acknowledged` once seen, and clean it up on Wikidata when you get to it.",
  "",
  codeRows.length ? "| entity | codes | Wikidata |\n| --- | --- | --- |" : "_None — every code-like name is reviewed._",
  ...codeRows.map((r) => `| ${esc(r.label)} (${r.kind}) | ${esc(r.codes.join(", "))} | [${r.qid}](${link(r.qid)}) |`),
  "",
  `## Missing names — content languages — ${missingRows.length} entit${missingRows.length === 1 ? "y" : "ies"}`,
  "",
  "No usable name in these languages, so the list falls back to English (⚠️ in the app). Add a Wikidata label.",
  "",
  missingRows.length ? "| entity | missing | Wikidata |\n| --- | --- | --- |" : "_None._",
  ...missingRows.map((r) => `| ${esc(r.label)} (${r.kind}) | ${esc(r.missing.join(", "))} | [${r.qid}](${link(r.qid)}) |`),
  "",
  `## Overrides in force — ${overrideRows.length}`,
  "",
  "Where `name-overrides.json` asserts a name because Wikidata's label is a formal/realm title or absent. **promotable** = the common name already exists as an altLabel, so promoting it on Wikidata (to the label, or a short name) would retire the override.",
  "",
  "| entity | overridden langs | promotable | Wikidata |",
  "| --- | --- | --- | --- |",
  ...overrideRows.map(
    (r) => `| ${esc(r.label)} | ${r.langs.join(", ")} | ${r.promotable.length ? esc(r.promotable.join(", ")) : "—"} | [${r.qid}](${link(r.qid)}) |`,
  ),
  "",
  `## Stale entries — safe to remove — ${staleAck.length + redundantOverrides.length}`,
  "",
  "Curated rules the data no longer needs — a Wikidata fix (or a dump change) landed, so these compensations do nothing now and can be deleted.",
  "",
  ...(staleAck.length ? [`- \`name-abbreviations.json\` **acknowledged** no longer in the data: ${staleAck.map((s) => `\`${s}\``).join(", ")}`] : []),
  ...(redundantOverrides.length
    ? [
        "",
        "**Redundant overrides** — the plain bucket already draws the asserted name:",
        "",
        "| entity | langs | Wikidata |",
        "| --- | --- | --- |",
        ...redundantOverrides.map((r) => `| ${esc(r.label)} | ${r.langs.join(", ")} | [${r.qid}](${link(r.qid)}) |`),
      ]
    : []),
  ...(staleAck.length + redundantOverrides.length ? [] : ["_None._"]),
  "",
  "## Filtered from the build — for reference",
  "",
  "What the build drops from the raw dump over the content languages. Nothing is lost — the raw `country-names.json` / `capital-names.json` keep every term.",
  "",
  `**Unflagged aliases — ${aliasDrops.n} drop(s), ${aliasDrops.set.size} distinct.** \`skos:altLabel\` with no pref/official/short flag: ignored by design, the discardable flood (\`Red China\`, \`Rotchina\`, \`cn\`). Count only; a common name genuinely hiding here would need a label or short-name flag on Wikidata to surface.`,
  "",
  "What is left — flagged code-like names that still get dropped — falls in two kinds, listed as `` `code` (langs) ``:",
  "",
  `### Invalid on Wikidata — ${invalidCodes.length}`,
  "",
  "Filed under P1813 (short name) but really an ISO/technical code, practically never spoken; they belong in P297 / P298. Reviewed into `name-abbreviations.json` `acknowledged`; clean up on Wikidata when convenient.",
  "",
  invalidCodes.length ? codeLine(invalidCodes) : "_None._",
  "",
  `### Valid but unsuitable for skribbl — ${unsuitableCodes.length}`,
  "",
  "Genuine abbreviations, correct on Wikidata, but too short or punctuated to draw. Kept in `name-abbreviations.json` `legit` so the report stays quiet, yet dropped from the lists by the word rule (3+ letters, letters only).",
  "",
  unsuitableCodes.length ? codeLine(unsuitableCodes) : "_None._",
  "",
].join("\n");

await writeFile(join(RAW, "..", "name-quality-report.md"), md, "utf8");
console.log(
  `new codes: ${codeRows.reduce((n, r) => n + r.codes.length, 0)} across ${codeRows.length} entities · ` +
    `missing: ${missingRows.length} entities · overrides: ${overrideRows.length} · ` +
    `stale: ${staleAck.length} ack / ${redundantOverrides.length} overrides · ` +
    `filtered codes: ${invalidCodes.length} invalid / ${unsuitableCodes.length} unsuitable`,
);
console.log("wrote data-raw/geography/name-quality-report.md");
