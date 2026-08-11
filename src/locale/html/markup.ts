// The inline markup a translatable string may carry, parsed once into parts that
// Msg.svelte renders and plain.ts flattens. Both must agree on the tag set, which
// is why the knowledge lives here rather than in either of them.
//
// Why markup at all: Svelte escapes interpolated text, and the alternative
// ({@html}) would put every translation — and every `reason` written in a data
// file — on an unescaped path to the DOM. Parsing to parts keeps the strings
// plain data.

export type Part =
  | { kind: "text"; text: string }
  | { kind: "br" }
  | { kind: "link"; text: string; href: string };

// `[text](url)`, non-greedy so two links on one line stay two links, and no
// nesting: a label is text, not markup.
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Only http(s) is renderable as a link. A data file is content, and content must
 *  not be able to produce `javascript:` — anything else falls back to plain text,
 *  which is visible and harmless rather than silently dropped. */
function isSafeHref(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Split a marked-up string into renderable parts. Unknown or unsafe markup stays
 *  as the literal text it was written as. */
export function parseMarkup(text: string): Part[] {
  const parts: Part[] = [];
  const push = (s: string) => {
    // `{br}` splits whatever text surrounds it, including inside a run between
    // two links.
    const lines = s.split("{br}");
    lines.forEach((line, i) => {
      if (i > 0) parts.push({ kind: "br" });
      if (line) parts.push({ kind: "text", text: line });
    });
  };

  let last = 0;
  for (const m of text.matchAll(LINK)) {
    const [whole, label, href] = m;
    push(text.slice(last, m.index));
    if (isSafeHref(href)) parts.push({ kind: "link", text: label, href });
    else push(whole);
    last = m.index + whole.length;
  }
  push(text.slice(last));
  return parts;
}

/** The same string as readable plain text, for the places that must be a string:
 *  aria-label, title, placeholder. A link keeps its label and loses its URL. */
export function plainText(text: string): string {
  return parseMarkup(text)
    .map((p) => (p.kind === "br" ? " " : p.text))
    .join("");
}
