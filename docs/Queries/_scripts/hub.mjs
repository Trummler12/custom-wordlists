// Rebuilds the README's Overview from the topic files themselves, so a status changed
// in a file (heading and navigation) reaches the hub without editing it by hand. Also
// rewrites each file's navigation list from its own headings.
//
//   node hub.mjs            (from anywhere; works on the Queries folder above it)
//
// Category order and the category of each folder come from CATEGORIES; files within a
// category in the order they are listed under it in the README already, new ones last.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATEGORIES = [
  ["Animation", "animation"],
  ["Anime", "anime"],
  ["Comics", "comics"],
  ["Film & TV", "film-tv"],
  ["Gaming", "gaming"],
  ["Geography", "geography"],
  ["Science", "science"],
  ["Sports", "sports"],
];

// GitHub's heading slug (see the split notes): marks such as U+FE0F survive.
const slug = (h) => h.trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, "").replace(/ /g, "-");
const STATUS = /^(\p{Extended_Pictographic}️?)?(.*)$/u;

const readme = readFileSync(join(ROOT, "README.md"), "utf8").replace(/\r/g, "");
const order = [...readme.matchAll(/^- \[[^\]]*\]\(\.\/([^)#]+)#navigation\)/gm)].map((m) => m[1]);

// Each category may end in a hand-kept "#### Candidates" list (topics proposed, not yet
// analyzed); it is carried over as it stands.
const overview = readme.slice(readme.indexOf("## Overview"));
const candidates = (category) => {
  const part = overview.split(/^(?=### )/m).find((p) => p.startsWith(`### ${category}\n`)) ?? "";
  return part.replace(/<!--[\s\S]*$/, "").match(/^#### Candidates\n[\s\S]*/m)?.[0].trimEnd();
};

const out = [readme.slice(0, readme.indexOf("## Overview")).trimEnd(), "", "## Overview", ""];
for (const [category, folder] of CATEGORIES) {
  const files = readdirSync(join(ROOT, folder))
    .filter((f) => f.endsWith(".md"))
    .map((f) => `${folder}/${f}`)
    .sort((a, b) => (order.indexOf(a) + 1 || 1e9) - (order.indexOf(b) + 1 || 1e9) || a.localeCompare(b));
  out.push(`### ${category}`, "");
  for (const path of files) {
    const text = readFileSync(join(ROOT, path), "utf8").replace(/\r/g, "");
    const title = text.match(/^# Wikidata Query Analysis: (.+)$/m)?.[1] ?? path;
    const navStart = text.indexOf("## Navigation");
    const sections = [...text.matchAll(/^## (.+)$/gm)]
      .map((m) => ({ heading: m[1], at: m.index }))
      .filter((s) => s.at > navStart && !/^\[to Navigation\]/.test(s.heading));
    // The file's own navigation, from its headings.
    const back = text.slice(navStart).match(/^\[[^\]]+\]\(\.\.\/README\.md#[^)]*\)$/m)?.[0];
    const nav = sections.map((s) => {
      const [, status = "", name] = s.heading.match(STATUS);
      return `- ${status}[${name}](#${slug(s.heading)})`;
    });
    // The navigation block ends at the first blank line after its own lines.
    const navBody = text.indexOf("\n\n", navStart) + 2;
    const gap = text.indexOf("\n\n", navBody);
    const navEnd = gap < 0 ? text.length : gap + 2;
    const rebuilt = `${text.slice(0, navStart)}## Navigation\n\n${back}\n${nav.join("\n")}${nav.length ? "\n" : ""}\n${text.slice(navEnd)}`;
    // Keep a file's line breaks as it had them.
    const raw = readFileSync(join(ROOT, path), "utf8");
    writeFileSync(join(ROOT, path), raw.includes("\r\n") ? rebuilt.replace(/\n/g, "\r\n") : rebuilt);

    out.push(`- [${title}](./${path}#navigation)`);
    for (const s of sections) {
      const [, status = "", name] = s.heading.match(STATUS);
      out.push(`  - ${status}[${name}](./${path}#${slug(s.heading)})`);
    }
  }
  const kept = candidates(category);
  if (kept) out.push("", kept);
  out.push("");
}
// Agent mail that concerns no single topic sits at the end of the hub (see the agent
// protocol); the rebuilt overview must not swallow it.
const mail = overview.match(/<!--[\s\S]*?-->/g) ?? [];
if (mail.length) out.push(mail.join("\n\n"), "");
writeFileSync(join(ROOT, "README.md"), out.join("\n"));
console.log("hub: README overview and file navigations rebuilt");
