import { fileURLToPath } from "node:url";
import fs from "node:fs";
const QS = fileURLToPath(new URL("../../_data/QuickStatements/", import.meta.url));
const { a, P } = JSON.parse(fs.readFileSync("np3.json", "utf8"));
const D = "|S813|+2026-11-13T00:00:00Z/11";
const ref = page => `|S854|"https://myheroacademia.fandom.com/wiki/${encodeURIComponent(page.replace(/ /g, "_"))}"${D}`;
const hira = s => s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const flat = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const byQ = Object.fromEntries(a.map(o => [o.q, o]));
const key = (t, k, kana) => t + "|" + k + "|" + hira(kana);
const part = Object.fromEntries(P.map(p => [key(p.t, p.k, p.kana), p]));
// links to existing items now, the rest after the CREATE
const now = ["My Hero Academia: family name (P734) and given name (P735) of the characters, linked to the existing name items with the same spelling and reading"];
now.push(`Q142103237|Aen|"Mount Lady"`);
let later = 0;
for (const o of a) for (const [t, prop, k, kana] of [["fam", "P734", o.famK, o.famKana], ["giv", "P735", o.givK, o.givKana]]) {
  const p = part[key(t, k, kana)]; const has = t === "fam" ? o.has734 : o.has735;
  if (p.match.length === 1) { if (!has.includes(p.match[0].q)) now.push(`${o.q}|${prop}|${p.match[0].q}${ref(o.page)}`); }
  else later++;
}
fs.writeFileSync(QS + "2026-11-13_mha-name-parts-existing-2.txt", now.join("\n") + "\n");
// CREATE the rest
const cre = ["My Hero Academia: Japanese family and given name items in the spelling and reading the characters use (for P734 / P735)"];
const scr = k => /^[\u3040-\u309f]+$/.test(k) ? ["Q48332"] : /^[\u30a0-\u30ff]+$/.test(k) ? ["Q82946"] : [/[\u4e00-\u9fff]/.test(k) ? "Q82772" : null, /[\u3040-\u309f]/.test(k) ? "Q48332" : null, /[\u30a0-\u30ff]/.test(k) ? "Q82946" : null].filter(Boolean);
let n = 0;
for (const p of P.filter(p => p.match.length !== 1)) {
  const users = p.users.map(q => byQ[q]); const g = new Set(users.map(u => u.p21));
  const kind = p.t === "fam" ? "fam" : g.size > 1 ? "uni" : g.has("Q6581072") ? "fem" : "male";
  const cls = { fam: ["Q101352", "Q19914123"], male: ["Q12308941", "Q22812564"], fem: ["Q11879590", "Q22812564"], uni: ["Q3409032", "Q22812564"] }[kind];
  const en = { fam: "Japanese family name", male: "Japanese male given name", fem: "Japanese female given name", uni: "Japanese unisex given name" }[kind];
  const de = { fam: "Familienname", male: "männlicher Vorname", fem: "weiblicher Vorname", uni: "Unisex-Vorname" }[kind];
  const ja = { fam: "日本語の姓", male: "日本語圏の男性の名前", fem: "日本語圏の女性の名前", uni: "日本語圏の名前" }[kind];
  const kanaR = /^[\u30a0-\u30ff]+$/.test(p.k) ? p.kana : hira(p.kana);
  const R = ref(users[0].page);
  cre.push("CREATE", `LAST|Len|"${p.rom}"`, `LAST|Lde|"${p.rom}"`, `LAST|Lja|"${p.k}"`,
    `LAST|Den|"${en} (${p.k})"`, `LAST|Dde|"${de} (${p.k})"`, `LAST|Dja|"${ja}（${kanaR}）"`);
  const alts = new Set([flat(p.rom), p.t === "fam" ? users[0].fam : users[0].giv].filter(x => x && x !== p.rom));
  for (const x of alts) cre.push(`LAST|Aen|"${x}"`);
  if (kanaR !== p.k) cre.push(`LAST|Aja|"${kanaR}"`);
  for (const c of cls) cre.push(`LAST|P31|${c}${R}`);
  cre.push(`LAST|P407|Q5287`); for (const s of scr(p.k)) cre.push(`LAST|P282|${s}`);
  cre.push(`LAST|P1705|ja:"${p.k}"${R}`, `LAST|P1814|"${kanaR}"${R}`);
  n++;
}
fs.writeFileSync(QS + "2026-11-13_mha-name-items-create_PRE7.txt", cre.join("\n") + "\n");
fs.writeFileSync(QS + "backlog/2026-11-13_POST7_mha-name-parts-new.txt", ["My Hero Academia: family name (P734) and given name (P735) of the characters, linked to the new name items",
  `WAITING: for 2026-11-13_mha-name-items-create_PRE7.txt (${n} items); then resolve each item by P1705 + P1814 and link its users (${later} links, data: _data/mha/name-parts.json + the kanji split from the wiki's ruby).`].join("\n") + "\n");
console.log("now", now.length - 1, "create", n, "later links", later);
