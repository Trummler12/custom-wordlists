import fs from "node:fs"; import { getJ, sleep, ents } from "./lib.mjs";
const a = JSON.parse(fs.readFileSync("np1.json", "utf8"));
const hira = s => s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f'’\- ]/g, "").replace(/ou/g, "o").replace(/oo/g, "o").replace(/uu/g, "u");
const FAM = ["Q101352", "Q19914123", "Q137383044"], GIV = ["Q202444", "Q12308941", "Q11879590", "Q3409032", "Q22812564", "Q137383048"];
const chars = await ents(a.map(o => o.q), "claims", "en");
const parts = new Map();
for (const o of a) { const c = chars[o.q].claims;
  o.p21 = c.P21?.[0]?.mainsnak.datavalue?.value.id; o.has734 = (c.P734 || []).map(s => s.mainsnak.datavalue?.value.id); o.has735 = (c.P735 || []).map(s => s.mainsnak.datavalue?.value.id);
  for (const [t, k, r, R] of [["fam", o.famK, o.famKana, o.famR], ["giv", o.givK, o.givKana, o.givR]]) { const key = t + "|" + k + "|" + hira(r); if (!parts.has(key)) parts.set(key, { t, k, kana: r, rom: R, users: [] }); parts.get(key).users.push(o.q); } }
for (const p of parts.values()) {
  const s = await getJ(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(p.k)}&language=ja&strictlanguage=0&limit=20&format=json`); await sleep(700);
  const ids = (s.search || []).map(x => x.id); if (!ids.length) { p.cands = []; continue; }
  const e = await ents(ids, "claims|labels|aliases", "en|ja");
  p.cands = ids.map(q => { const x = e[q]; const c = x.claims || {}; const p31 = (c.P31 || []).map(s => s.mainsnak.datavalue?.value.id);
    const cls = p.t === "fam" ? FAM : GIV; if (!p31.some(z => cls.includes(z))) return null;
    const k705 = (c.P1705 || []).map(s => s.mainsnak.datavalue?.value.text); const kanjiOk = k705.includes(p.k) || x.labels?.ja?.value === p.k;
    const reads = [...(c.P1814 || []).map(s => s.mainsnak.datavalue?.value), ...(c.P1705 || []).flatMap(s => (s.qualifiers?.P1814 || []).map(z => z.datavalue?.value)), ...(x.aliases?.ja || []).map(z => z.value)].map(z => hira(z || ""));
    const readOk = reads.includes(hira(p.kana)) || norm(x.labels?.en?.value) === norm(p.rom);
    return { q, en: x.labels?.en?.value, ja: x.labels?.ja?.value, p31, kanjiOk, readOk };
  }).filter(Boolean);
  p.match = p.cands.filter(c => c.kanjiOk && c.readOk);
}
const P = [...parts.values()]; fs.writeFileSync("np2.json", JSON.stringify({ a, P }, null, 1));
console.log(P.length, "parts;", P.filter(p => p.match.length === 1).length, "match one;", P.filter(p => p.match.length > 1).length, "match several;", P.filter(p => !p.match.length).length, "none");
for (const p of P) if (p.match.length) console.log(p.t, p.k, p.kana, "=>", p.match.map(m => m.q + " " + m.en + " " + m.p31.join(",")).join(" | "), "users:", p.users.join(","));
