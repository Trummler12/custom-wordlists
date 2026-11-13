import fs from "node:fs";
const o = JSON.parse(fs.readFileSync("oldr.json", "utf8"));
const mc = JSON.parse(fs.readFileSync("movecheck.json", "utf8"));
const intro = Object.fromEntries(fs.readFileSync("pkdata/moves.csv", "utf8").split(/\r?\n/).slice(1).filter(Boolean).map(l => l.split(",")).map(c => [c[0], +c[2]]));
const GEN = { 1: "Q27118928", 2: "Q27118900", 3: "Q27118889", 4: "Q27118795", 5: "Q27118381", 6: "Q27065429", 7: "Q26945334", 8: "Q61951126", 9: "Q111033398" };
// first game with the new name, by language market (Europe for de/fr/es, South Korea for ko), from the game items' P577
const SWITCH = { 4: {}, 5: { all: "+2013-10-12" }, 6: { de: "+2016-11-23", fr: "+2016-11-23", es: "+2016-11-23", ko: "+2016-11-18" }, 7: { all: "+2019-11-15" }, 8: { all: "+2022-11-18" } };
const URL = { fr: t => "https://www.pokepedia.fr/" + t, es: t => "https://www.wikidex.net/wiki/" + t, de: t => "https://www.pokewiki.de/" + t, ko: t => "https://pokemon.fandom.com/ko/wiki/" + t };
const REF = "|S813|+2026-11-13T00:00:00Z/11";
const rows = [];
// extra predecessors the French pages name (not yet aliases)
const extra = [{ old: "Poinglace", of: "Poing-Glace", until: 5 }, { old: "Prlvt Destin", of: "Prélèvem. Destin", until: 5 }];
for (const e of extra) { const b = o.find(r => r.old === e.of); o.push({ ...b, old: e.old, until: e.until, from: null, rule: "avant XY", extra: true }); const b2 = o.find(r => r.old === e.of && !r.extra); b2.from = 6; }
const hc = o.find(r => r.old === "Hiper Colmillo"); if (hc) { hc.from = 1; hc.until = 4; }
const sc = o.find(r => r.old === "선찰"); if (sc) { sc.from = 2; sc.until = 2; sc.rule = "2세대: 기술명이 선찰이었다"; }
const cb = o.find(r => r.old === "Combate"); if (cb) { cb.until = 6; cb.rule = "antes de la séptima generación"; }
const cur = {}; let skipped = [];
for (const r of o) {
  if (!r.rule || r.until == null) { skipped.push(r); continue; }
  const id = mc.find(x => x.q === r.q)?.id; const ig = intro[id]; if (!ig) { skipped.push(r); continue; }
  let gens = []; for (let g = Math.max(ig, r.from || 1); g <= r.until; g++) { if (r.L === "ko" && (g === 1 || g === 3)) continue; gens.push(g); }
  if (!gens.length) { skipped.push(r); continue; }
  const url = URL[r.L](r.page.replace(/ /g, "_")); const sw = r.old === "Hiper Colmillo" ? "+2010-03-26" : SWITCH[r.until]?.[r.L] ?? SWITCH[r.until]?.all;
  let line = `${r.q}|P1448|${r.L}:"${r.old}"` + gens.map(g => `|P1264|${GEN[g]}`).join("") + (sw ? `|P582|${sw}T00:00:00Z/11` : "") + `|S854|"${url}"` + REF;
  rows.push(line); if (r.extra) rows.push(`${r.q}|A${r.L}|"${r.old}"`);
  const k = r.q + r.L; if (sw && (!cur[k] || cur[k].sw < sw)) cur[k] = { q: r.q, L: r.L, name: r.cur, sw, url };
}
for (const c of Object.values(cur)) rows.push(`${c.q}|P1448|${c.L}:"${c.name}"|P580|${c.sw}T00:00:00Z/11|S854|"${c.url}"` + REF);
const head = "Pokémon moves: former official names in de, fr, es and ko as official name (P1448) with the generations they were used in, and the current name with its start date";
fs.writeFileSync("C:/Users/tnu01/Desktop/ProgrammierZeugs/zProjektZeugs/Wordlists/_untracked/docs/Queries/_data/QuickStatements/2026-11-13_pokemon-moves-former-names.txt", [head, ...rows].join("\n") + "\n");
console.log("lines", rows.length, "old", rows.filter(l => l.includes("P1264")).length, "current", Object.keys(cur).length, "skipped", skipped.length);
for (const s of skipped) console.log("SKIP", s.L, s.old, "=>", s.cur, s.rule || "");
