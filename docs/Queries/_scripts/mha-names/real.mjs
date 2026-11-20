import fs from "node:fs"; import { getJ, sleep, ents } from "./lib.mjs";
const { P } = JSON.parse(fs.readFileSync("np3.json", "utf8"));
const CK = "real.ck.json"; const done = fs.existsSync(CK) ? JSON.parse(fs.readFileSync(CK, "utf8")) : {};
for (const p of P.filter(p => !p.match.length)) { const key = p.t + p.k; if (done[key]) continue;
  const j = await getJ(`https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(`haswbstatement:P31=Q5 inlabel:"${p.k}"`)}&srlimit=50&format=json`); await sleep(1200);
  const ids = (j.query?.search || []).map(s => s.title); const tot = j.query?.searchinfo?.totalhits ?? 0; let hits = [];
  if (ids.length) { const e = await ents(ids, "labels", "ja|zh|en"); for (const [q, x] of Object.entries(e)) { const l = (x.labels?.ja?.value || "").replace(/[\s　・]/g, ""); const raw = x.labels?.ja?.value || "";
      const ok = p.t === "fam" ? (raw.startsWith(p.k) && raw.length > p.k.length) : (raw.endsWith(p.k) && raw.length > p.k.length); if (ok) hits.push(q + " " + raw + " / " + (x.labels?.en?.value || "")); } }
  done[key] = { tot, n: hits.length, hits: hits.slice(0, 4) }; fs.writeFileSync(CK, JSON.stringify(done)); }
const rows = P.filter(p => !p.match.length).map(p => ({ ...p, r: done[p.t + p.k] }));
console.log("attested", rows.filter(r => r.r.n).length, "none", rows.filter(r => !r.r.n).length);
for (const r of rows) console.log(r.r.n ? "REAL" : "----", r.t, r.k, r.kana, r.rom, "|", r.r.tot, r.r.n, "|", r.r.hits.join(" ; "));
