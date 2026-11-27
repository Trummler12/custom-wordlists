// Olympians with a sports occupation (from 20 sitelinks) whose items name no Games they took part in: Olympedia's page per
// person (olympedia.org/athletes/<P8286>) says whether they competed ("Roles: Competed in Olympic Games") and, in its first
// table (the results; flagbearer and coach roles follow in another), links the Games. Writes P1344 to the edition, matched by
// its English label, with the Olympedia page as reference. Non-starters, coaches, flagbearers are listed, not written.
//   node olympians-participation.mjs [min sitelinks = 20]
import fs from "node:fs"; import { qlever } from "../_data/naruto/lib.mjs";
const min = +(process.argv[2] || 20), T = new Date().toISOString().slice(0, 10);
const P = `PREFIX wd: <http://www.wikidata.org/entity/> PREFIX wdt: <http://www.wikidata.org/prop/direct/> PREFIX wikibase: <http://wikiba.se/ontology#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>`;
const ED = "VALUES ?k { wd:Q135976384 wd:Q137592217 }";   // the two edition classes (Summer / Winter Games editions)
const people = await qlever(`${P} SELECT DISTINCT ?p ?o WHERE { ?p wdt:P8286 ?o ; wikibase:sitelinks ?s . FILTER(?s>=${min}) ?p wdt:P106/wdt:P279* wd:Q2066131 . FILTER NOT EXISTS { ${ED} ?p wdt:P1344/wdt:P361? ?x . ?x wdt:P361? ?ed . ?ed wdt:P31 ?k } }`);
const eds = {}; for (const b of await qlever(`${P} SELECT ?ed ?l WHERE { ${ED} ?ed wdt:P31 ?k ; rdfs:label ?l FILTER(LANG(?l)="en") }`)) eds[b.l.value] = b.ed.value.split("/").pop();
const L = ["Olympians: participation in the Olympic Games they competed in, as Olympedia lists them"], other = {}, unmatched = new Set();
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (const [n, b] of people.entries()) {
  const q = b.p.value.split("/").pop(), id = b.o.value, url = `https://www.olympedia.org/athletes/${id}`;
  let t = ""; for (let a = 0; a < 3 && !t; a++) { try { const r = await fetch(url, { headers: { "User-Agent": "wordlists-analysis/1.0 (research script)" } }); if (r.ok) t = await r.text(); } catch { } if (!t) await sleep(5000); }
  await sleep(900);
  const roles = (t.match(/<th>Roles<\/th>\s*<td>([\s\S]*?)<\/td>/) || [])[1]?.replace(/<[^>]+>/g, "").trim() || "(page not read)";
  if (!/Competed in Olympic Games/.test(roles)) { other[roles] = (other[roles] || 0) + 1; continue; }
  const first = (t.match(/<table class="table">([\s\S]*?)<\/table>/) || [])[1] || "";
  const games = [...new Set([...first.matchAll(/href="\/editions\/\d+">([^<]+)<\/a>/g)].map(m => m[1].trim()))];
  for (const g of games) { const ed = eds[g]; if (!ed) { unmatched.add(g); continue; } L.push(`${q}|P1344|${ed}|S854|"${url}"|S813|+${T}T00:00:00Z/11`); }
  if (n % 50 === 49) console.error(`${n + 1} of ${people.length}`); }
fs.writeFileSync(new URL(`../_data/QuickStatements/backlog/${T}_olympians-participation.txt`, import.meta.url), L.join("\n") + "\n");
console.log("people", people.length, "| participations", L.length - 1, "| not competing:", JSON.stringify(other), "| Games not matched:", [...unmatched].join("; "));
