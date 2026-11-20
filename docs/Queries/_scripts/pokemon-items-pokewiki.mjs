// PokéWiki item lists per game (template Item-Liste/Zeile, names in up to ten languages) => _data/pokemon-items/pokewiki-item-lists.json
import fs from "node:fs";
const UA = { headers: { "User-Agent": "wordlists-analysis/1.0 (research script)" } };
const j = async u => JSON.parse(await (await fetch(u, UA)).text());
const pages = (await j("https://www.pokewiki.de/api.php?action=query&list=allpages&apprefix=Item-Liste%20(&aplimit=100&apfilterredir=nonredirects&format=json")).query.allpages.map(p => p.title);
const out = {};
for (const t of pages) { const r = await j(`https://www.pokewiki.de/api.php?action=parse&page=${encodeURIComponent(t)}&prop=wikitext&format=json`); const w = r.parse?.wikitext?.["*"] || ""; const rows = [];
  for (const m of w.matchAll(/\{\{Item-Liste\/Zeile\|([^\n]*?)\}\}\s*$/gm)) { const o = {}; for (const kv of m[1].split("|")) { const i = kv.indexOf("="); if (i > 0) o[kv.slice(0, i).trim()] = kv.slice(i + 1).trim(); } rows.push(o); }
  const head = (w.match(/\{\{Item-Liste\/Kopf\|([^\n]*)/) || [])[1] || ""; out[t] = { head, len: w.length, rows };
  console.log(rows.length, "|", t, "|", Object.keys(rows[0] || {}).join(","), "| other lines:", w.split("\n").filter(l => l.trim() && !l.startsWith("{{Item-Liste/")).length);
  await new Promise(s => setTimeout(s, 1200)); }
fs.writeFileSync(new URL("../_data/pokemon-items/pokewiki-item-lists.json", import.meta.url), JSON.stringify(out));
