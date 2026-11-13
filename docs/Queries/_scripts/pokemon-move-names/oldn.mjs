import fs from "node:fs";
const B = fs.readFileSync("C:/Users/tnu01/Desktop/ProgrammierZeugs/zProjektZeugs/Wordlists/_untracked/docs/Queries/_data/QuickStatements/imported/2026-11-13_pokemon-moves-label-fixes.txt", "utf8").split(/\r?\n/).slice(1).map(l => l.split("|"));
const lab = {}; for (const [q, k, v] of B) if (k?.[0] === "L") lab[q + k.slice(1)] = JSON.parse(v);
const mc = JSON.parse(fs.readFileSync("movecheck.json", "utf8"));
const HOST = { de: "www.pokewiki.de", fr: "www.pokepedia.fr", es: "www.wikidex.net", ko: "pokemon.fandom.com/ko", ja: null };
const out = [];
for (const [q, k, v] of B) { if (k?.[0] !== "A") continue; const L = k.slice(1), old = JSON.parse(v);
  const cur = lab[q + L] ?? mc.find(x => x.q === q && x.lang === L)?.pk; const en = mc.find(x => x.q === q)?.en;
  const r = { q, L, en, old, cur, ctx: [] }; out.push(r); if (!HOST[L] || !cur) continue;
  try { const j = JSON.parse(await (await fetch(`https://${HOST[L]}/api.php?action=parse&page=${encodeURIComponent(cur)}&prop=wikitext&redirects=1&format=json`, { headers: { "User-Agent": "wordlists-analysis/1.0 (research script)" } })).text());
    const w = (j.parse?.wikitext?.["*"] ?? "").replace(/\n/g, " "); r.page = j.parse?.title;
    const norm = x => x.replace(/’/g, "'"); const W = norm(w), O = norm(old); let p = -1;
    while ((p = W.indexOf(O, p + 1)) >= 0 && r.ctx.length < 12) r.ctx.push(W.slice(Math.max(0, p - 120), p + 160));
  } catch (e) { r.err = String(e); }
  await new Promise(s => setTimeout(s, 700));
}
fs.writeFileSync("oldn.json", JSON.stringify(out, null, 1)); console.log(out.length, out.filter(r => r.ctx.length).length);
