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
import { isCode } from "./bucket-names.mjs";

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
const keep = new Set((await rd("name-abbreviations.json")).keep);
const overrides = stripComment(await rd("name-overrides.json"));
const territories = stripComment(await rd("sovereign-territories.json"));

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
for (const [kind, data] of [["country", countries], ["capital", capitals]]) {
  for (const [qid, v] of Object.entries(data)) {
    const label = enOf(qid, v.names);
    const codes = [];
    const missing = [];
    for (const lang of LANGS) {
      const list = pickLang(v.names, lang) ?? [];
      // codes the build would otherwise have taken (flagged, not whitelisted)
      for (const e of list) if ((e.short || e.official || e.pref) && isCode(e.name) && !keep.has(e.name)) codes.push(`${lang}:${e.name}`);
      // a usable name = a flagged non-code term, or an override for this language
      const usable = list.some((e) => (e.pref || e.official || e.short) && !(isCode(e.name) && !keep.has(e.name)));
      if (!usable && overrides[qid]?.[lang] === undefined) missing.push(lang);
    }
    if (codes.length) codeRows.push({ qid, label, kind, codes });
    if (missing.length) missingRows.push({ qid, label, kind, missing });
  }
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

const today = new Date().toISOString().slice(0, 10);
const md = [
  "# Name-quality report — data-raw/geography",
  "",
  `Generated ${today} by \`scripts/geography/report-name-quality.mjs\` (read-only). A worklist of the Wikidata issues the country and capital dumps hit — fix at the source, re-dump, and the entry here (and any override it carries) falls away.`,
  "",
  `## Codes mis-filed as names — ${codeRows.reduce((n, r) => n + r.codes.length, 0)}`,
  "",
  "Filed under P1813 (short name) but really an ISO/technical code, so the build drops them; they belong in P297 (alpha-2) / P298 (alpha-3). Clean up on Wikidata.",
  "",
  codeRows.length ? "| entity | codes | Wikidata |\n| --- | --- | --- |" : "_None._",
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
].join("\n");

await writeFile(join(RAW, "..", "name-quality-report.md"), md, "utf8");
console.log(
  `codes: ${codeRows.reduce((n, r) => n + r.codes.length, 0)} across ${codeRows.length} entities · ` +
    `missing: ${missingRows.length} entities · overrides: ${overrideRows.length}`,
);
console.log("wrote data-raw/geography/name-quality-report.md");
