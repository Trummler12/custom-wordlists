import fs from "node:fs"; import { getJ, sleep, ents } from "./lib.mjs";
const { P } = JSON.parse(fs.readFileSync("np3.json", "utf8")); const ck = JSON.parse(fs.readFileSync("real.ck.json", "utf8"));
const flat = s => s.normalize("NFD").replace(/[\u0300-\u036f'’\-]/g, "").toLowerCase();
const out = {};
for (const p of P.filter(p => !p.match.length && ck[p.t + p.k]?.n)) {
  const rom = flat(p.rom); const q2 = `haswbstatement:P31=Q5 inlabel:"${p.k}" inlabel:${p.rom.normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
  let ids = []; for (const q of [`haswbstatement:P31=Q5 inlabel:"${p.k}"`, q2]) { const j = await getJ(`https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=50&format=json`); ids.push(...(j.query?.search || []).map(s => s.title)); await sleep(1500); }
  ids = [...new Set(ids)]; const hits = [];
  if (ids.length) { const e = await ents(ids, "labels|descriptions", "ja|en"); for (const [q, x] of Object.entries(e)) { const raw = x.labels?.ja?.value || "", en = flat(x.labels?.en?.value || "");
    const pos = p.t === "fam" ? raw.startsWith(p.k) : raw.endsWith(p.k); const w = en.split(/\s+/);
    if (pos && raw.length > p.k.length && w.includes(rom)) hits.push(`${q} ${raw} / ${x.labels.en.value} (${x.descriptions?.en?.value || ""})`); } }
  out[p.t + p.k] = hits; console.log(hits.length ? "REAL" : "----", p.t, p.k, p.rom, "|", hits.slice(0, 2).join(" ; "));
}
fs.writeFileSync("real2.json", JSON.stringify(out, null, 1));
