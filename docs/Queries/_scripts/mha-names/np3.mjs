import fs from "node:fs"; import { getJ, sleep, ents } from "./lib.mjs";
const { a, P } = JSON.parse(fs.readFileSync("np2.json", "utf8")); P.forEach(p => p.match ??= []);
const CK = "np3.ck.json"; const done = fs.existsSync(CK) ? JSON.parse(fs.readFileSync(CK, "utf8")) : {};
const hira = s => s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const FAM = ["Q101352", "Q19914123", "Q137383044"], GIV = ["Q12308941", "Q11879590", "Q3409032", "Q22812564", "Q137383048", "Q202444"];
const JA = ["Q19914123", "Q22812564"];
const flat = s => s.normalize("NFD").replace(/[\u0300-\u036f']/g, "");
for (const p of P) {
  if (p.match.length && !(p.k === "明" || p.k === "管")) continue;
  if (done[p.t + p.k]) { p.match = done[p.t + p.k]; continue; }
  p.match = [];
  const terms = [...new Set([p.rom, flat(p.rom)])]; const ids = new Set();
  for (const t of terms) { const s = await getJ(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(t)}&language=en&limit=20&format=json`); (s.search || []).forEach(x => ids.add(x.id)); await sleep(600); }
  if (!ids.size) { done[p.t + p.k] = []; fs.writeFileSync(CK, JSON.stringify(done)); continue; }
  const e = await ents([...ids], "claims|labels|aliases", "ja|en");
  for (const [q, x] of Object.entries(e)) { const c = x.claims || {}; const p31 = (c.P31 || []).map(s => s.mainsnak.datavalue?.value.id);
    if (!p31.some(z => (p.t === "fam" ? FAM : GIV).includes(z))) continue;
    const kan = [...(c.P1705 || []).map(s => s.mainsnak.datavalue?.value.text), x.labels?.ja?.value];
    if (!kan.includes(p.k)) continue;
    const reads = [...(c.P1814 || []).map(s => s.mainsnak.datavalue?.value), ...(c.P1705 || []).flatMap(s => (s.qualifiers?.P1814 || []).map(z => z.datavalue?.value)), ...(x.aliases?.ja || []).map(z => z.value)].map(z => hira(z || ""));
    const ok = reads.length ? reads.includes(hira(p.kana)) : flat(x.labels?.en?.value || "").toLowerCase() === flat(p.rom).toLowerCase();
    if (ok) p.match.push({ q, en: x.labels?.en?.value, p31, second: true });
  }
  done[p.t + p.k] = p.match; fs.writeFileSync(CK, JSON.stringify(done));
}
// fixed choices
for (const p of P) { if (p.k === "庄田") p.match = p.match.filter(m => m.q === "Q27263559"); p.match = p.match.filter(m => !m.p31.includes("Q22809413") && !m.p31.includes("Q1093580")); }
fs.writeFileSync("np3.json", JSON.stringify({ a, P }, null, 1));
console.log("matched", P.filter(p => p.match.length === 1).length, "several", P.filter(p => p.match.length > 1).length, "none", P.filter(p => !p.match.length).length);
for (const p of P.filter(p => p.match.some(m => m.second))) console.log("2nd:", p.t, p.k, p.kana, "=>", p.match.map(m => m.q + " " + m.en).join(" | "));
for (const p of P.filter(p => p.match.length > 1)) console.log("MULTI", p.k, p.match.map(m => m.q + " " + m.en).join(" | "));
