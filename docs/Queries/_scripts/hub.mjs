// Rebuilds the README's Categories and Overview from the topic files themselves, so a status
// changed in a file (heading and navigation) reaches the hub without editing it by hand. Also
// rewrites each file's navigation list from its own headings.
//
//   node hub.mjs            (from anywhere; works on the Queries folder above it)
//
// Category order and the category of each folder come from CATEGORIES; files within a
// category in the order they are listed under it in the README already, new ones last.
// The README's intro, Legend and Method are hand-kept; the order is intro, Categories,
// Legend, Overview, Method.
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

// Headings carry no U+FE0F: GitHub keeps it in the slug, IntelliJ drops it, so an anchor
// with it works in only one of them. Lists and the legend show the emoji form again.
const slug = (h) => h.trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, "").replace(/ /g, "-");
const STATUS = /^(\p{Extended_Pictographic}️?)?(.*)$/u;
const emoji = (s) => (s && /\p{Emoji_Presentation}/u.test(s)) || !s ? s : s.replace(/️?$/, "️");

const raw = readFileSync(join(ROOT, "README.md"), "utf8");
const readme = raw.replace(/\r/g, "");
const order = [...readme.matchAll(/^- \[[^\]]*\]\(\.\/([^)#]+)#navigation\)/gm)].map((m) => m[1]);
const parts = readme.split(/^(?=## )/m);
const head = parts[0].trimEnd();
const section = (name) => parts.find((p) => p.startsWith(`## ${name}\n`))?.trimEnd() ?? "";

// Each category may end in a hand-kept "#### Candidates" list (topics proposed, not yet
// analyzed); it is carried over as it stands.
const overview = section("Overview");
const candidates = (category) => {
  const part = overview.split(/^(?=### )/m).find((p) => p.startsWith(`### ${category}\n`)) ?? "";
  return part.replace(/<!--[\s\S]*$/, "").match(/^#### Candidates\n[\s\S]*/m)?.[0].trimEnd();
};

const cats = ["## Categories", ""], out = ["## Overview", ""];
let candidateLists = 0;
for (const [category, folder] of CATEGORIES) {
  const files = readdirSync(join(ROOT, folder))
    .filter((f) => f.endsWith(".md"))
    .map((f) => `${folder}/${f}`)
    .sort((a, b) => (order.indexOf(a) + 1 || 1e9) - (order.indexOf(b) + 1 || 1e9) || a.localeCompare(b));
  cats.push(`- [${category}](#${slug(category)}):`);
  out.push(`### ${category}`, "");
  for (const path of files) {
    const text = readFileSync(join(ROOT, path), "utf8").replace(/\r/g, "");
    // Only topic files: a working note beside them (PokemonAPI.md) has no navigation to rebuild.
    const title = text.match(/^# Wikidata Query Analysis: (.+)$/m)?.[1];
    if (!title || !text.includes("## Navigation")) continue;
    const navStart = text.indexOf("## Navigation");
    const sections = [...text.matchAll(/^## (.+)$/gm)]
      .map((m) => ({ heading: m[1], at: m.index }))
      .filter((s) => s.at > navStart && !/^\[to Navigation\]/.test(s.heading));
    // The file's own navigation, from its headings.
    const back = text.slice(navStart).match(/^\[[^\]]+\]\(\.\.\/README\.md#[^)]*\)$/m)?.[0];
    const nav = sections.map((s) => {
      const [, status = "", name] = s.heading.match(STATUS);
      return `- ${emoji(status)}[${name}](#${slug(s.heading)})`;
    });
    // The navigation block ends at the first blank line after its own lines.
    const navBody = text.indexOf("\n\n", navStart) + 2;
    const gap = text.indexOf("\n\n", navBody);
    const navEnd = gap < 0 ? text.length : gap + 2;
    const rebuilt = `${text.slice(0, navStart)}## Navigation\n\n${back}\n${nav.join("\n")}${nav.length ? "\n" : ""}\n${text.slice(navEnd)}`;
    // Keep a file's line breaks as it had them.
    const fileRaw = readFileSync(join(ROOT, path), "utf8");
    writeFileSync(join(ROOT, path), fileRaw.includes("\r\n") ? rebuilt.replace(/\n/g, "\r\n") : rebuilt);

    cats.push(`  - [${title}](./${path}#navigation)`);
    out.push(`- [${title}](./${path}#navigation)`);
    for (const s of sections) {
      const [, status = "", name] = s.heading.match(STATUS);
      out.push(`  - ${emoji(status)}[${name}](./${path}#${slug(s.heading)})`);
    }
  }
  const kept = candidates(category);
  if (kept) {
    // GitHub numbers repeated headings: candidates, candidates-1, …
    cats.push(`  - [Candidates](#candidates${candidateLists ? `-${candidateLists}` : ""})`);
    candidateLists++;
    out.push("", kept);
  }
  out.push("");
}
cats.push("", "- [Method](#method)", "");
// Agent mail that concerns no single topic sits at the end of the overview (see the agent
// protocol); the rebuilt overview must not swallow it.
const mail = overview.match(/<!--[\s\S]*?-->/g) ?? [];
if (mail.length) out.push(mail.join("\n\n"), "");
const text = [head, "", ...cats, section("Legend"), "", ...out, section("Method"), ""].join("\n");
writeFileSync(join(ROOT, "README.md"), raw.includes("\r\n") ? text.replace(/\n/g, "\r\n") : text);
console.log("hub: README categories, overview and file navigations rebuilt");
