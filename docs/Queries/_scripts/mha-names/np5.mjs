// after the CREATE of the name items: resolve each by kanji (P1705) + kana (P1814) and link its bearers (P734 / P735)
import { fileURLToPath } from "node:url"; import fs from "node:fs";
const QS = fileURLToPath(new URL("../../_data/QuickStatements/backlog/", import.meta.url));
const { a, P } = JSON.parse(fs.readFileSync("np3.json", "utf8"));
const hira = s => s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const FAM = ["Q101352", "Q19914123", "Q137383044"];
// the query service lags behind a fresh import, so read the account's new items of the day through the API
const { getJ, ents } = await import("./lib.mjs");
let ids = [], cont = "";
do { const j = await getJ(`https://www.wikidata.org/w/api.php?action=query&list=usercontribs&ucuser=Trummler12&ucshow=new&ucnamespace=0&ucstart=2026-11-17T00:00:00Z&ucend=2026-11-16T00:00:00Z&uclimit=500&ucprop=title&format=json${cont}`); ids.push(...j.query.usercontribs.map(c => c.title)); cont = j.continue ? "&uccontinue=" + encodeURIComponent(j.continue.uccontinue) : ""; } while (cont);
const E = await ents(ids, "claims", "ja");
const found = {}; for (const [id, x] of Object.entries(E)) { const c = x.claims || {}; const k = c.P1705?.[0]?.mainsnak.datavalue?.value.text, kana = c.P1814?.[0]?.mainsnak.datavalue?.value; if (!k || !kana) continue;
  const t = (c.P31 || []).some(s => FAM.includes(s.mainsnak.datavalue?.value.id)) ? "fam" : "giv"; (found[t + "|" + k + "|" + hira(kana)] ??= []).push(id); }
console.log("new items today", ids.length);
const byQ = Object.fromEntries(a.map(o => [o.q, o])); const D = "|S813|+2026-11-16T00:00:00Z/11";
const L = ["My Hero Academia: family name (P734) and given name (P735) of the characters, linked to the new name items"]; const open = [];
for (const p of P.filter(p => p.match.length !== 1)) { const f = found[p.t + "|" + p.k + "|" + hira(p.kana)] || [];
  if (f.length !== 1) { open.push(`${p.t} ${p.k} ${p.kana}: ${f.length ? f.join(",") : "not found"}`); continue; }
  for (const u of p.users) { const o = byQ[u]; L.push(`${u}|${p.t === "fam" ? "P734" : "P735"}|${f[0]}|S854|"https://myheroacademia.fandom.com/wiki/${encodeURIComponent(o.page.replace(/ /g, "_"))}"${D}`); } }
console.log("links", L.length - 1, "open", open.length); console.log(open.join("\n"));
if (!open.length) { fs.writeFileSync(QS + "2026-11-16_POST7_mha-name-parts-new.txt", L.join("\n") + "\n"); console.log("written"); }
