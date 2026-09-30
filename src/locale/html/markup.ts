// The inline markup a translatable string may carry, parsed once into parts that
// Msg.svelte renders and plain.ts flattens. Both must agree on the tag set, which
// is why the knowledge lives here rather than in either of them.
//
// Why markup at all: Svelte escapes interpolated text, and the alternative
// ({@html}) would put every translation — and every `reason` written in a data
// file — on an unescaped path to the DOM. Parsing to parts keeps the strings
// plain data.

/** The paired `{name}…{/name}` spans: one line per element. `name` is what a part's `kind`
 *  says, `tag` the element it renders as, `aliases` further spellings a string may use for
 *  the same span. Names are global, so an alias works in every locale, not just its own
 *  language. Tags come only from here, never from a string, so no markup reaches the DOM. */
export const SPANS = [
  { name: "b", tag: "strong", aliases: ["bold", "fett"] },
  { name: "i", tag: "em", aliases: ["italic", "kursiv"] },
  { name: "code", tag: "code", aliases: ["c"] },
] as const;

type SpanName = (typeof SPANS)[number]["name"];

export type Part =
  | { kind: "text"; text: string }
  | { kind: "br" }
  | { kind: "link"; text: string; href: string }
  | { kind: SpanName; text: string };

/** The element a span part renders as. */
export function spanTag(kind: SpanName): string {
  return SPANS.find((s) => s.name === kind)!.tag;
}

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// One pass over every inline construct, so they interleave: a `[text](url)` link, or a span
// whose closing name must repeat its opening one (`\k<o…>`), so `{b}x{/i}` stays literal.
// Named groups, one pair per SPANS line, so nothing depends on alternative order. Non-greedy,
// and nothing nests: a span's content is plain text, like a link's label.
const INLINE = new RegExp(
  [
    String.raw`\[(?<label>[^\]]+)\]\((?<href>[^)\s]+)\)`,
    ...SPANS.map((s, i) => {
      const names = [s.name, ...s.aliases].map(escape).join("|");
      return String.raw`\{(?<o${i}>${names})\}(?<t${i}>[\s\S]*?)\{\/\k<o${i}>\}`;
    }),
  ].join("|"),
  "g",
);

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
  for (const m of text.matchAll(INLINE)) {
    const whole = m[0];
    const g = m.groups!;
    push(text.slice(last, m.index));
    if (g.label !== undefined) {
      // A link — but only http(s); anything else stays the literal text it was written as.
      if (isSafeHref(g.href)) parts.push({ kind: "link", text: g.label, href: g.href });
      else push(whole);
    } else {
      const i = SPANS.findIndex((_, i) => g[`o${i}`] !== undefined);
      // An empty span ({b}{/b}) matched but held nothing, so it contributes no part.
      if (g[`t${i}`]) parts.push({ kind: SPANS[i].name, text: g[`t${i}`] });
    }
    last = m.index + whole.length;
  }
  push(text.slice(last));
  return parts;
}

/** The same string as readable plain text, for the places that must be a string:
 *  aria-label, title, placeholder. A link keeps its label and loses its URL. */
export function plainText(text: string, br = " "): string {
  return parseMarkup(text)
    .map((p) => (p.kind === "br" ? br : p.text))
    .join("");
}
