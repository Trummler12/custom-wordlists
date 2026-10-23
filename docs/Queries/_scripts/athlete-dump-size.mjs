// How large a raw athletes dump would be per floor, in sport-names.json's shape (pretty
// JSON; name, wikipedias, games, editions, sports, names in every LANG_SRC tag). Samples
// athletes per fame band, fetches their terms with #35's terms(), and scales the mean
// entry size of each band by the band's head count from athlete-tiers.mjs.
//
//   node athlete-dump-size.mjs        (needs ../_data/athlete-tiers.json, and a checkout that
//                                      has #35's scripts/lib/wikidata.mjs: the same terms())
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { labelFor, terms } from "../../../../scripts/lib/wikidata.mjs";

const DATA = join(dirname(fileURLToPath(import.meta.url)), "..", "_data");
const people = Object.entries(JSON.parse(await readFile(join(DATA, "athlete-tiers.json"), "utf8")));
const BANDS = [0, 2, 5, 10, 13, 16, 20, 25, 30, 40, 80, 1e9];
const PER_BAND = 90;
const MB = 1024 * 1024;

const bandOf = (w) => BANDS.findIndex((b, i) => w >= b && w < BANDS[i + 1]);
const mean = [];
for (let i = 0; i < BANDS.length - 1; i++) {
  const inBand = people.filter(([, p]) => bandOf(p.w) === i);
  // A fixed stride rather than random, so a rerun hits the cache-free API the same way.
  const sample = inBand.filter((_, j) => j % Math.max(1, Math.floor(inBand.length / PER_BAND)) === 0).slice(0, PER_BAND);
  const t = await terms(sample.map(([h]) => h));
  let bytes = 0;
  for (const [h, p] of sample) {
    const entry = {
      name: labelFor(t[h].names, "en") ?? h,
      wikipedias: t[h].wikipedias,
      games: p.seasons,
      editions: p.years.map((y) => `${y} ${p.seasons[0]}`),
      sports: ["Q2736"],
      names: t[h].names,
    };
    bytes += JSON.stringify({ [h]: entry }, null, 2).length - 4;
  }
  mean[i] = bytes / sample.length;
  console.log(`band ${BANDS[i]}-${BANDS[i + 1] - 1}: ${inBand.length} people, mean entry ${Math.round(mean[i])} B (n=${sample.length})`);
}

for (const season of ["summer", "winter"]) {
  console.log(`\n== ${season}: dump size by floor ==`);
  const ofSeason = people.filter(([, p]) => p.seasons.includes(season));
  for (const floor of [0, 2, 5, 10, 13, 14, 15, 16, 17, 18, 20, 25, 30, 40]) {
    const kept = ofSeason.filter(([, p]) => p.w >= floor);
    const size = kept.reduce((s, [, p]) => s + mean[bandOf(p.w)], 0);
    console.log(`floor ${String(floor).padStart(2)}: ${String(kept.length).padStart(7)} athletes, ~${(size / MB).toFixed(1)} MB`);
  }
}
