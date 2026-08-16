#!/usr/bin/env node
// Find line breaks that land inside a sentence in the project's Markdown.
//
// The house rule this checks: `,` < `;` < `.` < a line break < a blank line. A
// break interrupts the reading more than a full stop does, so it has to earn its
// place — and breaking mid-sentence spends the strongest mark in the scale on
// nothing at all. It also reflows badly: a phone rewraps every line anyway, so a
// break inside a sentence lands somewhere arbitrary on a narrow screen.
//
// **This never fails.** It exits 0 whatever it finds, in CI as much as locally.
// Deciding where a sentence ends is a heuristic — `e.g.`, `vs.`, a version
// number, a heading that reads like prose — and a rule about prose style has no
// business turning a build red. A false positive should cost a glance, nothing
// more. That is also why it lives here rather than inside `validate-data.mjs`,
// which gates CI on its exit code and answers a different question entirely.
//
// Usage:
//   node scripts/check-wraps.mjs            # every tracked .md file
//   node scripts/check-wraps.mjs README.md  # only the paths given
//   node scripts/check-wraps.mjs --summary  # counts per file, no excerpts

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const summaryOnly = args.includes("--summary");
const paths = args.filter((a) => !a.startsWith("--"));

/** Punctuation a break may follow. The sentence enders, plus the two marks that
 *  sit just below them in the scale — a break after a colon or a semicolon is a
 *  style choice, not a mistake. */
const CLOSES = /[.!?:;…]$/;

/** Trailing markup that can sit after the punctuation: emphasis, code ticks,
 *  quotes, and the brackets a link or an aside closes with. */
const TRAILING = /[*_`~)\]"'»”’]+$/;

/** A line that opens a block of its own, so the line before it did not wrap into
 *  it: headings, list items, quotes, tables, fences, rules, HTML, and the
 *  indented continuation of nothing (a blank). */
const OPENS_BLOCK =
  /^\s*($|#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\||```|~~~|<|---\s*$|===|\[[^\]]+\]:)/;

/** The same test for the first line of a pair, minus the cases that *can* wrap:
 *  a list item and a quote are prose that continues onto the next line. */
const NEVER_WRAPS = /^\s*($|#{1,6}\s|\||```|~~~|<|---\s*$|===|\[[^\]]+\]:)/;

function files() {
  if (paths.length > 0) return paths;
  const out = execFileSync("git", ["ls-files", "*.md"], { encoding: "utf8" });
  return out.split(/\r?\n/).filter(Boolean);
}

/** Every mid-sentence break in one file, as `{ line, from, to }`. */
function scan(text) {
  const lines = text.split(/\r?\n/);
  const hits = [];
  let fenced = false;
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    // Two trailing spaces or a backslash are Markdown's own hard break: someone
    // asked for this one, so it is not an accident to report.
    if (/(\s\s|\\)$/.test(line)) continue;
    if (NEVER_WRAPS.test(line)) continue;
    if (OPENS_BLOCK.test(lines[i + 1])) continue;
    if (CLOSES.test(line.trimEnd().replace(TRAILING, ""))) continue;
    hits.push({ line: i + 1, from: line.trimEnd(), to: lines[i + 1].trim() });
  }
  return hits;
}

/** The last few words of one line and the first few of the next — enough to see
 *  the break without opening the file. */
function excerpt(s, take) {
  const words = s.split(/\s+/);
  return words.length <= 8 ? s : take === "tail" ? `… ${words.slice(-8).join(" ")}` : `${words.slice(0, 8).join(" ")} …`;
}

let total = 0;
for (const file of files()) {
  let hits;
  try {
    hits = scan(readFileSync(file, "utf8"));
  } catch {
    continue; // listed but gone, which `git ls-files` can report mid-rebase
  }
  if (hits.length === 0) continue;
  total += hits.length;
  if (summaryOnly) {
    console.log(`${String(hits.length).padStart(4)}  ${file}`);
    continue;
  }
  console.log(`\n${file} — ${hits.length}`);
  for (const h of hits) {
    console.log(`  ${h.line}: ${excerpt(h.from, "tail")}`);
    console.log(`  ${" ".repeat(String(h.line).length)}  ⏎ ${excerpt(h.to, "head")}`);
  }
}

console.log(
  total === 0
    ? "\ncheck-wraps: no mid-sentence line breaks found"
    : `\ncheck-wraps: ${total} mid-sentence line break(s) — a warning, never a failure`,
);
