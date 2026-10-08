// What every Wikidata dump needs, in one place: the content languages and where Wikidata
// keeps each of them, a SPARQL query that survives the endpoint's bad moments, and the
// labels of a list of items in the shape coverage.mjs and the builds read. The chemical
// elements and the Olympic sports are its first users; the geography dumps still carry
// their own copies until they move onto it (strand Z, extract-common).

const UA = { "User-Agent": "custom-wordlists/1.0 (https://github.com/Trummler12/custom-wordlists)" };
const SPARQL = "https://query.wikidata.org/sparql";
const API = "https://www.wikidata.org/w/api.php";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** The languages a generated list carries a name in, in display order: skribbl.io's. */
export const NAME_LANGS = [
  "en", "de", "es", "fr", "it", "ja", "ko", "zh-Hans", "zh-Hant",
  "pt", "ru", "tr", "pl", "nl", "bg", "cs", "da", "et", "fi", "el", "he",
  "hu", "lv", "mk", "no", "ro", "sr", "sk", "sv", "tl",
];

/** Our content tag => the Wikidata label tags to read it from, first hit wins. Wikidata
 *  splits some languages by region or script where we don't (Chinese by region, Norwegian
 *  into Bokmål and Nynorsk, Tagalog under Filipino). `zh` comes last for Simplified: it is
 *  not reliably Simplified, so it only fills a gap.
 *
 *  `mul` closes the chain of every language written in Latin letters: a name that reads
 *  the same everywhere ("South Park") is often stored only there. Not for the others,
 *  where the same name is written in their own script (サウスパーク, Саут Парк), so a
 *  Latin `mul` label would be a wrong name rather than a missing one. */
const LATIN = ["en", "de", "es", "fr", "it", "pt", "tr", "pl", "nl", "cs", "da", "et", "fi", "hu", "lv", "no", "ro", "sk", "sv", "tl"];
const CHAINS = {
  en: ["en"], de: ["de"], es: ["es"], fr: ["fr"], it: ["it"], ja: ["ja"], ko: ["ko"],
  "zh-Hans": ["zh-hans", "zh-cn", "zh-sg", "zh-my", "zh"],
  "zh-Hant": ["zh-hant", "zh-tw", "zh-hk", "zh-mo"],
  pt: ["pt", "pt-br", "pt-pt"], ru: ["ru"], tr: ["tr"], pl: ["pl"], nl: ["nl"],
  bg: ["bg"], cs: ["cs"], da: ["da"], et: ["et"], fi: ["fi"], el: ["el"], he: ["he"],
  hu: ["hu"], lv: ["lv"], mk: ["mk"], no: ["no", "nb", "nn"], ro: ["ro"], sr: ["sr"],
  sk: ["sk"], sv: ["sv"], tl: ["tl", "fil"],
};
export const LANG_SRC = Object.fromEntries(
  Object.entries(CHAINS).map(([tag, chain]) => [tag, LATIN.includes(tag) ? [...chain, "mul"] : chain]),
);

/** Every Wikidata tag LANG_SRC reads, which is all a dump needs to fetch. */
export const WD_TAGS = [...new Set(Object.values(LANG_SRC).flat())];

/** `Q…` from a Wikidata entity URI. */
export const qid = (uri) => uri.replace(/^.*\/entity\//, "");

/** A GET that retries what the Wikimedia endpoints answer under load (429, 5xx) and
 *  network hiccups, backing off a little longer each time. */
async function getJson(url, tries = 5) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: UA });
      // The body inside the try too: a connection dropped mid-answer fails here.
      if (res.ok) return await res.json();
    } catch (err) {
      if (attempt >= tries) throw err;
      await sleep(attempt * 2000);
      continue;
    }
    if (attempt >= tries || ![429, 500, 502, 503, 504].includes(res.status)) {
      throw new Error(`HTTP ${res.status} ${res.statusText} — ${url.slice(0, 120)}`);
    }
    await sleep(attempt * 2000);
  }
}

/** A SPARQL query's result bindings. */
export async function sparql(query) {
  return (await getJson(`${SPARQL}?${new URLSearchParams({ format: "json", query })}`)).results.bindings;
}

/** A Wikipedia's site id ("dewiki", "zh_yuewiki"), as opposed to a sister project's
 *  ("dewikiquote") or a non-language wiki's ("commonswiki"). */
const NOT_WIKIPEDIA = ["commonswiki", "specieswiki", "metawiki", "mediawikiwiki", "wikidatawiki", "sourceswiki", "wikifunctionswiki", "outreachwiki", "incubatorwiki"];
const isWikipedia = (site) => /^[a-z_]+wiki$/.test(site) && !NOT_WIKIPEDIA.includes(site);

/** The labels and aliases of `ids` in every tag LANG_SRC reads, plus in how many language
 *  editions of Wikipedia each item has an article (`wikipedias`, a rough measure of how
 *  widely known it is; sister projects such as Commons or Wikiquote don't count).
 *  `{ qid: { wikipedias, names: { <wd-tag>: [{ name, pref } | { name, alias }] } } }`,
 *  the label first in each tag: the shape coverage.mjs and the builds read. Through the
 *  entity API rather than SPARQL, which has no cheap way to fetch many items' terms. */
export async function terms(ids) {
  const out = {};
  for (let i = 0; i < ids.length; i += 45) {
    const r = await getJson(
      `${API}?${new URLSearchParams({
        format: "json",
        action: "wbgetentities",
        props: "labels|aliases|sitelinks",
        languages: WD_TAGS.join("|"),
        ids: ids.slice(i, i + 45).join("|"),
      })}`,
    );
    for (const [q, e] of Object.entries(r.entities)) {
      const names = {};
      for (const tag of WD_TAGS) {
        const label = e.labels?.[tag]?.value;
        const aliases = (e.aliases?.[tag] ?? []).map((a) => ({ name: a.value, alias: true }));
        if (label || aliases.length) names[tag] = [...(label ? [{ name: label, pref: true }] : []), ...aliases];
      }
      out[q] = { wikipedias: Object.keys(e.sitelinks ?? {}).filter(isWikipedia).length, names };
    }
    await sleep(300);
  }
  return out;
}

/** The name a content tag reads for an item: the first label down its LANG_SRC chain. */
export function labelFor(names, tag) {
  for (const src of LANG_SRC[tag]) {
    const label = names?.[src]?.find((t) => t.pref)?.name;
    if (label) return label;
  }
  return undefined;
}
