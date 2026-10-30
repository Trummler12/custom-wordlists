// Every place a component prints a locale string has to go through ./markup: as
// element content via <Msg>, in an attribute via plain(). A string printed raw shows
// its markup literally ("Fläche (km{sup}2{/sup})"), which nobody notices until a
// translation first uses a tag there. This scans the templates for such places.
//
// A heuristic, not a parser: it looks at the `{…}` expressions of each template that
// read a locale string directly (`ui.…`, `lang.ui.…`, `footer.…`) or through a
// component-level alias of a group (`const s = $derived(lang.ui.sovereignty)`). A
// string reaching the template through a variable or function of its own is beyond it.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../../..");
const BASES = ["lang\\.ui", "ui", "footer"];

/** The names a component gives to locale groups, e.g. `s` for `lang.ui.sovereignty`
 *  and `rows` for `s.rows`, followed until no new one turns up. */
function localePattern(script: string): RegExp {
  const names = [...BASES];
  for (let grew = true; grew; ) {
    grew = false;
    const any = new RegExp(`^(${names.join("|")})[.[]`);
    for (const m of script.matchAll(/const (\w+) = \$derived\(([\w.[\]]+)\)/g)) {
      if (!names.includes(m[1]) && any.test(m[2])) {
        names.push(m[1]);
        grew = true;
      }
    }
  }
  return new RegExp(`(^|[^\\w.])(${names.join("|")})[.[]`);
}

function svelteFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? svelteFiles(p) : p.endsWith(".svelte") ? [p] : [];
  });
}

/** The `{…}` expressions of a template, with the text right before each. */
function expressions(tpl: string): { before: string; expr: string }[] {
  const out: { before: string; expr: string }[] = [];
  let i = 0;
  while ((i = tpl.indexOf("{", i)) >= 0) {
    let depth = 0;
    let j = i;
    let quote = "";
    for (; j < tpl.length; j++) {
      const c = tpl[j];
      if (quote) {
        if (c === "\\") j++;
        else if (c === quote) quote = "";
      } else if (c === '"' || c === "'" || c === "`") quote = c;
      else if (c === "{") depth++;
      else if (c === "}" && --depth === 0) break;
    }
    out.push({ before: tpl.slice(Math.max(0, i - 40), i), expr: tpl.slice(i + 1, j) });
    i = j + 1;
  }
  return out;
}

function violations(file: string): string[] {
  const src = readFileSync(file, "utf8");
  const start = src.indexOf("</script>");
  const end = src.lastIndexOf("<style");
  const tpl = src.slice(start < 0 ? 0 : start, end < 0 ? src.length : end).replace(/<!--[\s\S]*?-->/g, "");
  const LOCALE = localePattern(src.slice(0, start < 0 ? 0 : start));
  const out: string[] = [];
  for (const { before, expr } of expressions(tpl)) {
    const e = expr.trim();
    // Blocks, tags and snippets carry logic, not output.
    if (/^[#:/@]/.test(e)) continue;
    if (!LOCALE.test(e)) continue;
    // Already rendered or flattened through ./markup.
    if (/^plain(Text)?\(/.test(e)) continue;
    // An attribute value is fine as an argument of something else (a handler, a
    // component prop that renders it); only a bare string attribute is printed.
    const attr = /(\s|^)([\w:-]+)=$/.exec(before);
    if (attr) {
      if (/^(title|aria-label|placeholder|alt)$/.test(attr[2])) out.push(`${attr[2]}={${e}}`);
      continue;
    }
    // Inside an event handler or a prop like `text={…}` the expression is not printed.
    if (/=\s*$/.test(before)) continue;
    out.push(`{${e}}`);
  }
  return out;
}

describe("locale strings in templates", () => {
  it("are printed through ./markup everywhere", () => {
    const found = svelteFiles(join(ROOT, "src")).flatMap((f) =>
      violations(f).map((v) => `${relative(ROOT, f).split("\\").join("/")}: ${v}`),
    );
    expect(found).toEqual([]);
  });
});
