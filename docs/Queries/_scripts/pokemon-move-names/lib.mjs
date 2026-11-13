export const WH = { headers: { "User-Agent": "wordlists-analysis/1.0 (research script)" } };
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const getJ = async url => { for (let a = 0; a < 8; a++) { try { return JSON.parse(await (await fetch(url, WH)).text()); } catch {} await sleep(5000 * (a + 1)); } throw new Error(url); };
export const ents = async (ids, props = "claims|labels|descriptions|aliases", langs = "en|de|ja") => { const out = {}; for (let i = 0; i < ids.length; i += 50) { Object.assign(out, (await getJ(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.slice(i, i + 50).join("|")}&props=${props}&languages=${langs}&format=json`)).entities); await sleep(800); } return out; };
export const srch = async q => { const j = await getJ(`https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=500&format=json`); await sleep(1000); return (j.query?.search || []).map(s => s.title); };
export const val = s => { const d = s.datavalue?.value; return d == null ? s.snaktype : d.id || d.text || d.time || d.amount || (typeof d === "string" ? d : JSON.stringify(d)); };
