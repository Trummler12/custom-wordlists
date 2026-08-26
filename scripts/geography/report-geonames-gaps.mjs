// W1 of the data-raw → GeoNames consolidation: a read-only report of every name the
// build still owes to the Wikidata `.txt` dumps, i.e. everything geonames does not yet
// carry. Trummler works the list at geonames.org (add the missing alternate name, flag
// the right one preferred), then a re-dump (W2) makes the `.txt` files redundant and W3
// purges them.
//
//   node scripts/geography/report-geonames-gaps.mjs
//
// It writes data-raw/geography/geonames-gaps.md and touches nothing else.
//
// WHAT COUNTS AS A GAP — it mirrors how build-country-data.mjs merges the two sources,
// so the report lists exactly what a purge would lose, nothing cosmetic:
//
//   Countries (countryEntry): the geonames bucket wins outright; the Wikidata label is
//   only the per-language fallback for a language geonames has no name in. So the sole
//   loss on purge is an ABSENT language — geonames carries no name there at all.
//
//   Capitals (capitalEntry): the Wikidata label is the pref anchor. Two ways to lose it:
//     · ABSENT           — geonames has no name for that language ⇒ the name disappears.
//     · NOT-PREFERRED    — geonames has the name among its variants but would not pick it
//                          as pref ⇒ the displayed default silently changes on purge.
//   Adding the name (absent) or flagging it preferred (not-preferred) at geonames closes
//   the gap; either way the anchor stops depending on the `.txt`.
//
// NAME_OVERRIDE / ISO_OVERRIDE are build-side and survive a purge, so they are excluded.
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { bucketCountry } from "./bucket-names.mjs";

const RAW = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "data-raw", "geography", "countries");
const LANGS = ["en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant"];

// Mirror the builder's overrides: these are supplied in code, not from geonames, so they
// never count as gaps. Keep in sync with build-country-data.mjs.
const NAME_OVERRIDE = { "Q36262.en": "St. John's" };
const ISO_OVERRIDE = { Q756617: "DK" };

const geoLink = (id) => `https://www.geonames.org/${id}`;

async function readColumns(dir) {
  const out = {};
  for (const lang of LANGS) {
    const text = await readFile(join(RAW, dir, `${lang}.txt`), "utf8");
    for (const row of text.split(/\r?\n/).filter(Boolean)) {
      const [key, name] = row.split("\t");
      (out[key] ??= {})[lang] = name;
    }
  }
  return out;
}

async function readStructure() {
  const text = await readFile(join(RAW, "structure.tsv"), "utf8");
  return text
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const [country, iso, pop, continents, capitals] = l.split("\t");
      return { country, iso, capitals: capitals ? capitals.split("|") : [] };
    });
}

const structure = await readStructure();
const countryNames = await readColumns(".");
const capitalNames = await readColumns("capitals");
const geo = JSON.parse(await readFile(join(RAW, "geonames-names.json"), "utf8"));
const capGeo = JSON.parse(await readFile(join(RAW, "capital-geonames-names.json"), "utf8"));

/** Which other geonames language tags of the same entity already carry `name` verbatim
 *  — the Chinese script tags in particular cross over (a simplified glyph filed under
 *  zh-Hant, or a Han name identical in both scripts). An empty result means the string
 *  is nowhere in geonames; a non-empty one means it exists, only mis-tagged. */
const elsewhereIn = (names, lang, name) =>
  Object.entries(names)
    .filter(([l, arr]) => l !== lang && Array.isArray(arr) && arr.some((e) => e.name === name))
    .map(([l]) => l);

// --- Countries: an absent language is one the geonames bucket does not fill ----------
const countryGaps = [];
for (const c of structure) {
  const iso = ISO_OVERRIDE[c.country] ?? c.iso;
  const rawNames = iso && geo[iso] ? geo[iso].names : {};
  const bucket = iso && geo[iso] ? bucketCountry(geo[iso].names, iso, LANGS) : {};
  const wiki = countryNames[c.country] ?? {};
  const rows = [];
  for (const lang of LANGS) {
    if (NAME_OVERRIDE[`${c.country}.${lang}`]) continue;
    const wikiName = wiki[lang];
    if (!wikiName) continue;
    if (bucket[lang] === undefined) {
      rows.push({ lang, tier: "absent", wiki: wikiName, geo: "—", elsewhere: elsewhereIn(rawNames, lang, wikiName) });
    }
  }
  if (rows.length) {
    countryGaps.push({
      qid: c.country,
      iso,
      en: wiki.en ?? c.country,
      geonameId: geo[iso]?.geonameId,
      rows,
    });
  }
}

// --- Capitals: absent, or present-but-not-preferred ---------------------------------
const capitalGaps = [];
const capQids = [...new Set(structure.flatMap((c) => c.capitals))];
for (const qid of capQids) {
  const wiki = capitalNames[qid] ?? {};
  const geoNames = capGeo[qid]?.names ?? {};
  const rows = [];
  for (const lang of LANGS) {
    if (NAME_OVERRIDE[`${qid}.${lang}`]) continue;
    const wikiName = wiki[lang];
    if (!wikiName) continue;
    const variants = geoNames[lang] ?? [];
    if (variants.length === 0) {
      rows.push({ lang, tier: "absent", wiki: wikiName, geo: "—", elsewhere: elsewhereIn(geoNames, lang, wikiName) });
      continue;
    }
    // The pref the builder would fall back to once the anchor label is gone.
    const geoPref = variants.find((e) => e.pref)?.name ?? variants[0]?.name;
    const present = variants.some((e) => e.name === wikiName);
    if (geoPref !== wikiName) {
      rows.push({
        lang,
        tier: present ? "not-preferred" : "absent",
        wiki: wikiName,
        geo: geoPref,
        elsewhere: present ? [] : elsewhereIn(geoNames, lang, wikiName),
      });
    }
  }
  if (rows.length) {
    capitalGaps.push({ qid, en: wiki.en ?? qid, geonameId: capGeo[qid]?.geonameId, rows });
  }
}

// --- Render -------------------------------------------------------------------------
const esc = (s) => String(s).replace(/\|/g, "\\|");
const countGaps = (list) => list.reduce((n, e) => n + e.rows.length, 0);
const allRows = (list) => list.flatMap((e) => e.rows);

const tierBadge = { absent: "absent", "not-preferred": "not-pref" };

/** A per-language tally string like `zh-Hant 138 · zh-Hans 90 · it 43 …`, most first. */
const byLang = (rows) => {
  const t = {};
  for (const r of rows) t[r.lang] = (t[r.lang] ?? 0) + 1;
  return Object.entries(t).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${n}`).join(" · ");
};

function renderEntity(e) {
  const head = e.geonameId
    ? `### ${e.en} — geonames ${e.geonameId} (${geoLink(e.geonameId)})`
    : `### ${e.en} — no GeoNames id on record`;
  const lines = [
    head,
    "",
    "| lang | tier | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |",
    "| --- | --- | --- | --- | --- |",
    ...e.rows.map(
      (r) =>
        `| ${r.lang} | ${tierBadge[r.tier]} | ${esc(r.wiki)} | ${esc(r.geo)} | ${
          r.elsewhere?.length ? esc(r.elsewhere.join(", ")) : "—"
        } |`,
    ),
    "",
  ];
  return lines.join("\n");
}

const today = new Date().toISOString().slice(0, 10);
const md = [
  "# GeoNames gaps — data-raw/geography",
  "",
  `Generated ${today} by \`scripts/geography/report-geonames-gaps.mjs\` (read-only).`,
  "",
  "Every row is a name the build still takes from the Wikidata `.txt` dumps because",
  "geonames does not yet carry it in a usable form. Close each at geonames.org, then a",
  "re-dump (W2) makes the `.txt` files redundant for W3 to purge.",
  "",
  "- **absent** — geonames has no name for that language; add the Wikidata name as an",
  "  alternate name (flag it preferred where it should be the default).",
  "- **not-pref** — geonames has the name but would not pick it as the default once the",
  "  anchor is gone; set the preferred flag on the Wikidata name (or accept the shown",
  "  geonames pref as the new default).",
  "",
  `**Countries:** ${countGaps(countryGaps)} gap(s) across ${countryGaps.length} entit(y/ies) — by lang: ${byLang(allRows(countryGaps))}.`,
  `- of those, ${allRows(countryGaps).filter((r) => r.elsewhere?.length).length} already sit in geonames under a sibling tag (the same Han glyph filed as zh-Hant) — a build-side script fallback closes these, no geonames edit.`,
  "",
  `**Capitals:** ${countGaps(capitalGaps)} gap(s) across ${capitalGaps.length} entit(y/ies) — by lang: ${byLang(allRows(capitalGaps))}.`,
  `- absent ${allRows(capitalGaps).filter((r) => r.tier === "absent").length} · not-pref ${allRows(capitalGaps).filter((r) => r.tier === "not-preferred").length}; ${allRows(capitalGaps).filter((r) => r.elsewhere?.length).length} of the absent ones sit under a sibling tag. The bulk is thin per-city alternateNames — weigh whether closing these by hand stays "überschaubar".`,
  "",
  "## Countries",
  "",
  countryGaps.length ? countryGaps.map(renderEntity).join("\n") : "_No gaps — geonames covers every country language the dump uses._\n",
  "## Capitals",
  "",
  capitalGaps.length ? capitalGaps.map(renderEntity).join("\n") : "_No gaps — geonames covers every capital name the dump uses._\n",
].join("\n");

await writeFile(join(RAW, "..", "geonames-gaps.md"), md, "utf8");
console.log(
  `countries: ${countGaps(countryGaps)} gap(s) / ${countryGaps.length} entities · ` +
    `capitals: ${countGaps(capitalGaps)} gap(s) / ${capitalGaps.length} entities`,
);
console.log("wrote data-raw/geography/geonames-gaps.md");
