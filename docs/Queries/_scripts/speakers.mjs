// Languages: the speaker figure the agreed rule takes per language (dead, extinct or historical:
// the peak; else the newest worldwide figure, preferred first, a total as it stands, a first-
// or second-language figure as L1 + L2; only figures by place: summed), and the tiers it moves
// against today's maximum over all statements.
//
//   node speakers.mjs
import { sparql } from "./wd.mjs";
const r = await sparql(`SELECT ?i ?l ?st ?v ?rank ?t ?ap ?pl ?sl WHERE { { ?i wdt:P218 [] } UNION { ?i wdt:P220 [] } ?i p:P1098 ?st ; wikibase:sitelinks ?sl . ?st ps:P1098 ?v ; wikibase:rank ?rank . FILTER(?rank != wikibase:DeprecatedRank)
  OPTIONAL { ?st pq:P585 ?t } OPTIONAL { ?st pq:P518 ?ap } OPTIONAL { ?st pq:P3005|pq:P276|pq:P1001 ?pl } OPTIONAL { ?i rdfs:label ?l FILTER(LANG(?l)="en") } }`);
const by = {};
for (const x of r) { const it = (by[x.i] ??= { l: x.l, sl: Number(x.sl), s: {} }); const s = (it.s[x.st] ??= { v: Number(x.v), pref: x.rank.endsWith("PreferredRank"), t: Number(x.t?.slice(0, 4)) || 0, ap: new Set(), pl: new Set() }); if (x.ap) s.ap.add(x.ap.replace(/.*\//, "")); if (x.pl) s.pl.add(x.pl); }
const ids = Object.keys(by);
const hist = new Set();
for (let c = 0; c < ids.length; c += 300) for (const x of await sparql(`SELECT DISTINCT ?i WHERE { VALUES ?i { ${ids.slice(c, c + 300).map((q) => "wd:" + q).join(" ")} } VALUES ?k { wd:Q45762 wd:Q38058796 wd:Q2315359 } ?i wdt:P31/wdt:P279* ?k }`)) hist.add(x.i);
const CUTS = [100e6, 30e6, 10e6, 3e6, 1e6, 300e3, 100e3, 30e3, 10e3, 3e3, 1e3];
const tier = (n) => { for (let i = 0; i < CUTS.length; i++) if (n >= CUTS[i]) return i; return CUTS.length; };
const L1K = new Set(["Q36870", "Q924130"]), L2K = new Set(["Q125421", "Q150352"]), TOTK = new Set(["Q16868672", "Q218005", "Q13780930", "Q16657634"]);
const kind = (s) => { const a = [...s.ap]; if (!a.length || a.every((x) => TOTK.has(x))) return "total"; if (a.every((x) => L1K.has(x))) return "L1"; if (a.every((x) => L2K.has(x))) return "L2"; return "other"; };
// Preferred first, then the latest point in time; a future date is a projection, not a count.
const best = (S) => { if (!S.length) return null; let c = S.filter((s) => s.t <= 2026); if (!c.length) c = S; const p = c.some((s) => s.pref) ? c.filter((s) => s.pref) : c; return p.reduce((b, s) => (!b || s.t > b.t || (s.t === b.t && s.v > b.v) ? s : b), null); };
const pick = (it, q) => {
  const S = Object.values(it.s);
  if (hist.has(q)) return { v: Math.max(...S.map((s) => s.v)), how: "max" };
  const W = S.filter((s) => !s.pl.size && kind(s) !== "other");
  const ref = best(W);
  if (ref) {
    const k = kind(ref);
    if (k === "total") return { v: ref.v, how: "total" };
    const a = best(W.filter((s) => kind(s) === "L1")), b = best(W.filter((s) => kind(s) === "L2"));
    return { v: (a?.v ?? 0) + (b?.v ?? 0), how: a && b ? "L1+L2" : a ? "L1" : "L2" };
  }
  const P = {}; for (const s of S) for (const p of s.pl.size ? s.pl : [...s.ap]) (P[p] ??= []).push(s);
  return { v: Object.values(P).reduce((n, ss) => n + (best(ss)?.v ?? 0), 0), how: "places" };
};
const rows = [];
for (const [q, it] of Object.entries(by)) {
  const S = Object.values(it.s); const mx = Math.max(...S.map((s) => s.v)); if (mx <= 0) continue;
  const p = pick(it, q); rows.push({ q, l: it.l ?? q, sl: it.sl, mx, ...p, d: tier(p.v) - tier(mx) });
}
const how = {}; for (const x of rows) how[x.how] = (how[x.how] ?? 0) + 1;
const ch = rows.filter((x) => x.d);
console.log(`languages: ${rows.length}; figure taken as: ${Object.entries(how).map(([k, n]) => `${k} ${n}`).join(", ")}; historical by type: ${rows.filter((x) => x.how === "max").length}`);
console.log(`tier against today's MAX: same ${rows.length - ch.length}, lower ${ch.filter((x) => x.d > 0).length} (by 2+: ${ch.filter((x) => x.d > 1).length}), higher ${ch.filter((x) => x.d < 0).length}`);
for (const x of ch.sort((a, b) => b.sl - a.sl).slice(0, 40)) console.log(`  ${x.l} (${x.q}): ${x.mx.toLocaleString("en")} => ${x.v.toLocaleString("en")} [${x.how}] ${x.d > 0 ? "-" : "+"}${Math.abs(x.d)}`);
