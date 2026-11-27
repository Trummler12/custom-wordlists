import { sparql, labels } from "./wd.mjs";
const show = (rows, f) => rows.map(f).join(", ");
const a = await sparql(`SELECT ?i ?l ?o ?ol WHERE { ?i wdt:P1441 wd:Q16538 ; wdt:P1074 ?o . OPTIONAL { ?i rdfs:label ?l FILTER(LANG(?l) IN ("en","mul")) } OPTIONAL { ?o rdfs:label ?ol FILTER(LANG(?ol)="en") } }`, { fresh: true });
console.log("SP items with P1074 fictional analog of:", show(a, (x) => `${x.l} (${x.i}) => ${x.ol} (${x.o})`));
const b = await sparql(`SELECT ?i ?l WHERE { ?i wdt:P1441 wd:Q16538 ; wdt:P31 wd:Q5 . OPTIONAL { ?i rdfs:label ?l FILTER(LANG(?l)="en") } }`, { fresh: true });
console.log("\nreal humans (P31 human) with P1441 South Park:", b.length, show(b, (x) => x.l));
const c = await sparql(`SELECT ?i ?l (COUNT(DISTINCT ?e) AS ?n) WHERE { ?e wdt:P179 wd:Q16538 ; wdt:P674 ?i . ?i wdt:P31 wd:Q5 . OPTIONAL { ?i rdfs:label ?l FILTER(LANG(?l)="en") } } GROUP BY ?i ?l`, { fresh: true });
console.log("\nreal humans as P674 characters of SP episodes:", show(c, (x) => `${x.l} ${x.n}`));
const d = await sparql(`SELECT ?i ?l WHERE { ?i wdt:P6262 ?v FILTER(STRSTARTS(?v, "southpark:")) . ?i wdt:P31 wd:Q5 . OPTIONAL { ?i rdfs:label ?l FILTER(LANG(?l)="en") } }`, { fresh: true });
console.log("\nreal humans with a South Park Fandom ID:", d.length, show(d, (x) => x.l));
const e = await sparql(`SELECT ?i ?l ?c WHERE { ?i wdt:P1441 wd:Q16538 ; wdt:P31 ?c . VALUES ?c { wd:Q112225554 wd:Q112225557 wd:Q123296592 wd:Q174546 } OPTIONAL { ?i rdfs:label ?l FILTER(LANG(?l)="en") } }`, { fresh: true });
console.log("\nreligious figures in fiction:", show(e, (x) => `${x.l} (${x.i})`));
// How do other works do it? P1441 on humans overall, and fictional-version items via P1074 to a human
const f = await sparql(`SELECT (COUNT(DISTINCT ?i) AS ?n) WHERE { ?i wdt:P1074 ?o . ?o wdt:P31 wd:Q5 }`);
const g = await sparql(`SELECT (COUNT(DISTINCT ?i) AS ?n) WHERE { ?i wdt:P1441 ?w ; wdt:P31 wd:Q5 }`);
console.log("\nwikidata-wide: items with P1074 a human:", f[0].n, "; humans with any P1441:", g[0].n);
const h = await sparql(`SELECT ?w ?wl (COUNT(DISTINCT ?i) AS ?n) WHERE { ?i wdt:P1074 ?o . ?o wdt:P31 wd:Q5 . ?i wdt:P1441 ?w . OPTIONAL { ?w rdfs:label ?wl FILTER(LANG(?wl)="en") } } GROUP BY ?w ?wl ORDER BY DESC(?n) LIMIT 12`);
console.log("works with most fictional versions of real people:", show(h, (x) => `${x.wl} ${x.n}`));
