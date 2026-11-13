// Fetch kanji ruby per character from the MHA fandom wiki, split into family/given by the romaji family name.
import fs from "node:fs"; import { sleep, ents } from "./lib.mjs";
const D = "C:/Users/tnu01/Desktop/ProgrammierZeugs/zProjektZeugs/Wordlists/_untracked/docs/Queries/_data/mha/";
const rows = JSON.parse(fs.readFileSync(D + "name-parts.json", "utf8"));
const K = { a:"あ",i:"い",u:"う",e:"え",o:"お" };
// kana -> romaji (Hepburn, long vowels written out), enough for name matching
const H = "あa いi うu えe おo かka きki くku けke こko さsa しshi すsu せse そso たta ちchi つtsu てte とto なna にni ぬnu ねne のno はha ひhi ふfu へhe ほho まma みmi むmu めme もmo やya ゆyu よyo らra りri るru れre ろro わwa をo んn がga ぎgi ぐgu げge ごgo ざza じji ずzu ぜze ぞzo だda ぢji づzu でde どdo ばba びbi ぶbu べbe ぼbo ぱpa ぴpi ぷpu ぺpe ぽpo".split(" ").map(s => [s[0], s.slice(1)]);
const HM = Object.fromEntries(H); const kata = s => s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const rom = kana => { let s = kata(kana), o = ""; for (let i = 0; i < s.length; i++) { const c = s[i], n = s[i + 1];
  if ("ゃゅょ".includes(n) && HM[c]) { const b = HM[c].replace(/i$/, ""); o += (/^(sh|ch|j)$/.test(b) ? b : b + "y") + { "ゃ": "a", "ゅ": "u", "ょ": "o" }[n]; i++; continue; }
  if (c === "っ") { o += "#"; continue; } if (c === "ー") { o += o.slice(-1); continue; } if ("ぁぃぅぇぉ".includes(c)) { o = o.slice(0, -1) + { "ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o" }[c]; continue; }
  o += HM[c] ?? "?"; } return o.replace(/#(.)/g, "$1$1"); };
const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f'’\- ]/g, "").replace(/ou/g, "o").replace(/oo/g, "o").replace(/uu/g, "u").replace(/ei/g, "e").replace(/aa/g, "a").replace(/ii/g, "i");
const out = [];
for (const r of rows) {
  const j = await (await fetch(`https://myheroacademia.fandom.com/api.php?action=parse&page=${encodeURIComponent(r.page.replace(/ /g, "_"))}&redirects=1&prop=wikitext&format=json`, { headers: { "User-Agent": "Mozilla/5.0" } })).json().catch(() => null);
  await sleep(500);
  const w = j?.parse?.wikitext?.["*"] || ""; const m = w.match(/\|\s*kanji\s*=\s*([^\n]*)/); const raw = m?.[1] || "";
  // segments: [{k, r}] — Ruby pairs, bare kana as their own reading
  const seg = []; const re = /\{\{Ruby\|([^|}]+)\|([^|}]+)\}\}|([^{}\s|]+)/g; let x;
  while ((x = re.exec(raw))) { if (x[1]) seg.push({ k: x[1], r: x[2] }); else for (const ch of x[3]) if (/[\u3040-\u30ff]/.test(ch)) seg.push({ k: ch, r: ch }); }
  let split = -1, acc = "";
  for (let i = 0; i < seg.length; i++) { acc += seg[i].r; if (norm(rom(acc)) === norm(r.famR || r.fam)) { split = i + 1; break; } }
  const fam = seg.slice(0, split), giv = seg.slice(split);
  const o = { ...r, page: j?.parse?.title || r.page, raw, ok: split > 0 && giv.length > 0 && fam.map(s => s.k).join("") + giv.map(s => s.k).join("") === r.kanji,
    famK: fam.map(s => s.k).join(""), famKana: fam.map(s => s.r).join(""), givK: giv.map(s => s.k).join(""), givKana: giv.map(s => s.r).join(""), givRom: rom(giv.map(s => s.r).join("")) };
  out.push(o); if (!o.ok) console.log("CHECK", r.q, r.page, r.kanji, "|", raw.slice(0, 120));
}
fs.writeFileSync("np1.json", JSON.stringify(out, null, 1));
console.log(out.filter(o => o.ok).length, "of", out.length, "split");
