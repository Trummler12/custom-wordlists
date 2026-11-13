import fs from "node:fs";
const o = JSON.parse(fs.readFileSync("oldn.json", "utf8"));
const FRG = { RB: 1, J: 1, OA: 2, C: 2, RS: 3, RFVF: 3, E: 3, DP: 4, Pt: 4, HGSS: 4, NB: 5, N2B2: 5, XY: 6, ROSA: 6, SL: 7, USUL: 7, LGPE: 7, EB: 8, DEPS: 8, LPA: 8, EV: 9, "ÉV": 9, ZA: 9 };
const FIRST = new Set(["RB", "OA", "RS", "DP", "NB", "XY", "SL", "EB", "EV", "ÉV"]);
const ORD = { primera: 1, segunda: 2, tercera: 3, cuarta: 4, quinta: 5, sexta: 6, "séptima": 7, octava: 8, novena: 9 };
for (const r of o) { const all = r.ctx.join(" ¦ "); let m; r.until = null; r.from = null; r.rule = null;
  const after = c => { const i = c.indexOf(r.old); return i < 0 ? c : c.slice(i, i + r.old.length + 120); };
  for (const c0 of r.ctx) { const c = after(c0);
    if (r.L === "fr" && (m = c.match(/avant \{\{[Jj]eu\|([^}|]+)\}\}/))) { const g = FRG[m[1]]; if (g) { r.until = FIRST.has(m[1]) ? g - 1 : g; r.rule = "avant " + m[1]; break; } }
    if (r.L === "es" && (m = c.match(/antes de la \[*(\w+) generaci/))) { r.until = ORD[m[1]] - 1; r.rule = "antes " + m[1]; break; }
    if (r.L === "es" && /antes de \[*Leyendas Pokémon: Z-A/.test(c)) { r.until = 9; r.rule = "antes Z-A"; break; }
    if (r.L === "es" && (m = c.match(/desde la \[*saga (\w+)\]* hasta la \[*saga (\w+)/))) { r.rule = m[0]; break; }
  }
  if (r.L === "ko" && !r.rule) { const c = r.ctx.find(c => c.includes("세대]]까지") || c.includes("금은")) || ""; if ((m = c.match(/\[\[(\d)세대\]\]까지/))) { r.until = +m[1]; r.rule = m[0]; } else if (c.includes("{{게|금은}}")) { r.from = 2; r.until = 2; r.rule = "금은 only"; } }
  if (r.L === "de" && (m = all.match(/bis zur (\d)\. Generation/))) { r.until = +m[1]; r.rule = m[0]; }
  const DEO = { zweiten: 2, dritten: 3, vierten: 4, "fünften": 5, sechsten: 6, siebten: 7, achten: 8, neunten: 9 };
  if (r.L === "de" && !r.rule && (m = all.match(/Vor der \[\[[^|\]]+\|(\S+) Generation\]\] (?:war der Name dieser Attacke|hieß die Attacke) '''([^']+)'''/)) && m[2] === r.old) { r.until = DEO[m[1]] - 1; r.rule = "Vor der " + m[1] + " Generation"; }
  if (r.L === "ko" && !r.rule) { const c = r.ctx.map(c => c.slice(c.indexOf(r.old))).join(" ") + " " + r.ctx.join(" "); if ((m = c.match(/이후 \[\[(\d)세대\]\]/))) { r.until = +m[1] - 1; r.rule = m[0]; } }
}
fs.writeFileSync("oldr.json", JSON.stringify(o, null, 1));
const un = o.filter(r => !r.rule); console.log("resolved", o.length - un.length, "open", un.length);
for (const r of un) console.log(r.L, r.q, r.old, "=>", r.cur, "|", (r.ctx[0] || "").slice(0, 230));
