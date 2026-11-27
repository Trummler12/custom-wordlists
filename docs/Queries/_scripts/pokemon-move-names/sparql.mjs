const q = process.argv[2];
const r = await (await fetch("https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(q), { headers: { "User-Agent": "wordlists-analysis/1.0 (research script)", Accept: "application/sparql-results+json" } })).json();
for (const b of r.results.bindings) console.log(Object.values(b).map(v => v.value.replace("http://www.wikidata.org/entity/", "")).join(" | "));
