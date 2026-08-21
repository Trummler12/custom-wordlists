// Turns a flat word list into fame tiers, ordered by an empirical recognition
// rate — a Sporcle quiz result in `data-raw/**/Fame.txt`, which is `<id> ⇥ <name>`
// with the percentage on the following line.
//
// Deliberately not wired to any particular list, and deliberately not run by
// reflex: it writes only with --write, and once a list's tiers have been nudged
// by hand, re-running would discard those edits. After the first verified run the
// topic file is the source of truth; this stays for the next list with a quiz
// behind it.
//
//   node scripts/tier-by-fame.mjs <topic.json> <Fame.txt> [--write]
//
// THE CUT. Six tiers, each holding `x` times the entries of the one before it —
// the shape recognition actually falls off in. `x` is fixed and the first tier
// falls out of the list size, not the other way round: pinning tier 0 at a count
// makes it mean the top 6% of a long list and the top 14% of a short one, and
// flattens the progression to nothing on the short ones. Tier 0 has a floor,
// though — a top tier of four is a footnote — and where the floor bites, `x`
// gives way instead.
//
// It is a defensible default and no more. The boundaries want moving onto the
// real jumps in recognition, and a quiz measures the people who take quizzes.
import { readFile, writeFile } from "node:fs/promises";
import { serializeTopic } from "./lib/serialize.mjs";

const RATIO = 1.4; // each tier vs. the one before it
const MIN_TOP = 7; // fewer than this in tier 0 isn't a tier
const TIERS = 6; // as many as the fame ruler has depths

/** Rows of `<id> ⇥ <name>` with `⇥ <pct>%` on the next line, most famous first. */
function parseFame(text) {
  const lines = text.split(/\r?\n/);
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^(\d{1,4})\s*\t([^\t]+?)\s*\t?\s*$/.exec(lines[i]);
    if (!m) continue;
    const pct = /([\d.]+)\s*%/.exec(lines[i + 1] ?? "");
    rows.push({ key: Number(m[1]), name: m[2].trim(), pct: pct ? Number(pct[1]) : null });
  }
  return rows;
}

/** Tier sizes for `n` entries: geometric by RATIO, tier 0 floored at MIN_TOP with
 *  the ratio bending to fit. Sums to exactly `n`.
 *
 *  A list too short for six tiers of MIN_TOP gets fewer of them. Six were not
 *  negotiable before, and the rounding remainder — which always lands in the tail —
 *  went negative below 36 entries, quietly emptying the last tier. `fame.ts` reads
 *  the stored lengths, so a shorter ruler is a shape it already handles. */
export function tierSizes(n) {
  const count = Math.min(TIERS, Math.max(1, Math.floor(n / MIN_TOP)));
  const span = (x) => (Math.pow(x, count) - 1) / (x - 1);
  let ratio = RATIO;
  let first = n / span(RATIO);
  if (Math.round(first) < MIN_TOP) {
    first = MIN_TOP;
    // Largest ratio whose tiers still fit in `n` starting from MIN_TOP.
    let lo = 1.0001;
    let hi = 3;
    for (let i = 0; i < 300; i++) {
      const mid = (lo + hi) / 2;
      if (MIN_TOP * span(mid) < n) lo = mid;
      else hi = mid;
    }
    ratio = (lo + hi) / 2;
  }
  const sizes = Array.from({ length: count }, (_, i) => Math.max(1, Math.round(first * Math.pow(ratio, i))));
  sizes[count - 1] += n - sizes.reduce((a, b) => a + b, 0); // rounding lands in the tail
  return sizes;
}

async function main() {
  const [topicPath, famePath, ...flags] = process.argv.slice(2);
  if (!topicPath || !famePath) {
    console.error("usage: node scripts/tier-by-fame.mjs <topic.json> <Fame.txt> [--write]");
    process.exit(2);
  }
  const topic = JSON.parse(await readFile(topicPath, "utf8"));
  const rows = parseFame(await readFile(famePath, "utf8"));

  // A flat topic is its own group; a grouped one must carry exactly the one.
  if (topic.groups && topic.groups.length !== 1) throw new Error(`${topicPath}: expected exactly one group`);
  const group = topic.groups?.[0] ?? topic;
  if (!group.words) throw new Error(`${topicPath}: already tiered`);

  if (rows.length !== group.words.length) {
    throw new Error(`${topicPath}: ${group.words.length} entries but ${rows.length} fame rows`);
  }
  const missing = rows.filter((r) => r.pct === null);
  if (missing.length) throw new Error(`${famePath}: ${missing.length} row(s) carry no percentage`);

  // The quiz is sorted by rate, the list by its own id (National Dex, for
  // Pokémon) — so the two are joined through that id, not by position. Sorting
  // the rows by id recovers the list's order and pairs each with its entry;
  // matching by name would break on the quiz being in one language while the
  // entries carry several.
  const entryOf = new Map(
    [...rows].sort((a, b) => a.key - b.key).map((r, i) => [r.key, group.words[i]]),
  );
  const ranked = [...rows]
    .sort((a, b) => b.pct - a.pct || a.key - b.key)
    .map((r) => ({ entry: entryOf.get(r.key), pct: r.pct }));

  // Joined by id, but the quiz carries names too — so check them against the
  // entries' English forms. A silent off-by-one here would tier the whole list
  // wrongly and look perfectly plausible doing it.
  // Quiz pages use a straight apostrophe where the lists use a typographic one.
  const norm = (s) => s.replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
  const wrong = rows.filter((r) => {
    const e = entryOf.get(r.key);
    const en = typeof e === "string" ? e : (e?.en ?? e?.long ?? "");
    return norm(en) !== norm(r.name);
  });
  if (wrong.length) {
    for (const r of wrong.slice(0, 5)) {
      const e = entryOf.get(r.key);
      console.error(`  ${r.key}: quiz says "${r.name}", list has "${typeof e === "string" ? e : e?.en}"`);
    }
    throw new Error(`${famePath}: ${wrong.length} row(s) don't line up with the list`);
  }

  const sizes = tierSizes(ranked.length);
  const tiers = [];
  let at = 0;
  for (const size of sizes) {
    tiers.push(ranked.slice(at, at + size).map((r) => r.entry));
    at += size;
  }

  delete group.words;
  group.tiers = tiers;
  const text = serializeTopic(topic);

  console.log(`${topicPath}: ${ranked.length} entries → ${sizes.join(" / ")}`);
  for (const [i, tier] of tiers.entries()) {
    const names = tier.slice(0, 3).map((e) => (typeof e === "string" ? e : e.en));
    console.log(`  FG ${i + 1} (${tier.length}): ${names.join(", ")}…`);
  }
  if (flags.includes("--write")) {
    await writeFile(topicPath, text, "utf8");
    console.log("  written");
  } else {
    console.log("  dry run — pass --write to save");
  }
}

main().catch((err) => {
  console.error("tier-by-fame failed:", err.message);
  process.exit(1);
});
