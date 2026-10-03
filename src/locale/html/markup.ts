// The inline markup a translatable string may carry, parsed once into parts that
// Msg.svelte renders and plain.ts flattens. Both must agree on the tag set, which
// is why the knowledge lives here rather than in either of them.
//
// Why markup at all: Svelte escapes interpolated text, and the alternative
// ({@html}) would put every translation — and every `reason` written in a data
// file — on an unescaped path to the DOM. Parsing to parts keeps the strings
// plain data.

import { COLOR_SHADES, CSS_COLORS } from "./colors";

/** The paired `{name}…{/name}` spans: one line per element. `name` is what a styled part's
 *  `names` holds, `tag` the element it renders as, `aliases` further spellings a string may use for
 *  the same span. Names are global, so an alias works in every locale, not just its own
 *  language. Tags come only from here, never from a string, so no markup reaches the DOM. */
export const SPANS = [
  { name: "b", tag: "strong", aliases: ["bold", "fett"] },
  { name: "i", tag: "em", aliases: ["italic", "kursiv"] },
  { name: "code", tag: "code", aliases: ["c"] },
  { name: "u", tag: "u", aliases: ["underline"] },
  { name: "s", tag: "s", aliases: ["strike", "strikethrough"] },
  { name: "small", tag: "small", aliases: ["smaller", "xs"] },
  { name: "mark", tag: "mark", aliases: ["marked"] },
  { name: "ins", tag: "ins", aliases: ["inserted"] },
  { name: "sub", tag: "sub", aliases: ["subscript"] },
  { name: "sup", tag: "sup", aliases: ["superscript"] },
] as const;

type SpanName = (typeof SPANS)[number]["name"];

/** A styled run. Its opening tag is a space-separated token list: span names (each an
 *  element, nested outer to inner in the order written), a colour for the text, and
 *  `mark` optionally followed by a colour for its background: `{b red mark yellow}`. */
export interface StyledPart {
  kind: "span";
  names: SpanName[];
  color?: string;
  bg?: string;
  text: string;
}

export type Part =
  | { kind: "text"; text: string }
  | { kind: "br" }
  | { kind: "link"; text: string; href: string }
  | StyledPart;

/** The element a span name renders as. */
export function spanTag(name: SpanName): string {
  return SPANS.find((s) => s.name === name)!.tag;
}

const BY_NAME = new Map<string, SpanName>(
  SPANS.flatMap((s) => [s.name, ...s.aliases].map((n) => [n, s.name] as [string, SpanName])),
);

/** A colour at `tok[i]`, with an optional `light` / `dark` before it: its CSS value and the
 *  index after it, or null when there is none. A lone `light` / `dark` is a theme's text
 *  colour, which only makes sense for text (`asText`), not for a background. */
function readColor(tok: string[], i: number, asText: boolean): { value: string; next: number } | null {
  const shade = COLOR_SHADES[tok[i]];
  const name = shade ? tok[i + 1] : tok[i];
  if (name && CSS_COLORS.has(name))
    return {
      value: shade ? `color-mix(in srgb, ${name}, ${shade.mix})` : name,
      next: shade ? i + 2 : i + 1,
    };
  return shade && asText ? { value: shade.text, next: i + 1 } : null;
}

/** Read an opening tag's token list, or null when any token is unknown, a span repeats, or
 *  a second colour competes for the same slot — the tag then stays literal text. */
function readStyle(open: string): Omit<StyledPart, "kind" | "text"> | null {
  const tok = open.split(" ");
  const style: Omit<StyledPart, "kind" | "text"> = { names: [] };
  for (let i = 0; i < tok.length; ) {
    const name = BY_NAME.get(tok[i]);
    if (name) {
      if (style.names.includes(name)) return null;
      style.names.push(name);
      i++;
      if (name === "mark") {
        const c = readColor(tok, i, false);
        if (c) [style.bg, i] = [c.value, c.next];
      }
      continue;
    }
    const c = readColor(tok, i, true);
    if (!c || style.color) return null;
    [style.color, i] = [c.value, c.next];
  }
  return style;
}

// One pass over every inline construct, so they interleave: a `[text](url)` link, or a span
// whose closing tag repeats its opening one exactly (`\k<open>`), so `{b}x{/i}` stays
// literal. The opening tag is validated after matching (readStyle). Non-greedy, and nothing
// nests: a span's content is plain text, like a link's label.
const INLINE =
  /\[(?<label>[^\]]+)\]\((?<href>[^)\s]+)\)|\{(?<open>[a-z]+(?: [a-z]+)*)\}(?<body>[\s\S]*?)\{\/\k<open>\}/g;

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
      const style = readStyle(g.open);
      if (!style) push(whole);
      // An empty span ({b}{/b}) matched but held nothing, so it contributes no part.
      else if (g.body) parts.push({ kind: "span", ...style, text: g.body });
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
    .map((p) => (p.kind === "br" ? br : p.kind === "span" ? scripted(p) : p.text))
    .join("");
}

// What plain text can keep of a raised or lowered run: Unicode has its own digits (and a
// few signs) for both, so "km{sup}2{/sup}" still reads km² in a native tooltip.
const SUPER: Record<string, string> = { ...digits("⁰¹²³⁴⁵⁶⁷⁸⁹"), "+": "⁺", "-": "⁻", "=": "⁼", "(": "⁽", ")": "⁾" };
const SUB: Record<string, string> = { ...digits("₀₁₂₃₄₅₆₇₈₉"), "+": "₊", "-": "₋", "=": "₌", "(": "₍", ")": "₎" };
function digits(glyphs: string): Record<string, string> {
  return Object.fromEntries([...glyphs].map((g, i) => [String(i), g]));
}
/** A raised or lowered run as its Unicode characters, or null where it is neither or
 *  Unicode can't raise it as a whole. All or nothing: a half-converted run ("x²a")
 *  reads worse than the plain one. Msg uses it for what a copy picks up. */
export function scriptGlyphs(p: StyledPart): string | null {
  const map = p.names.includes("sup") ? SUPER : p.names.includes("sub") ? SUB : null;
  if (!map || ![...p.text].every((c) => c in map)) return null;
  return [...p.text].map((c) => map[c]).join("");
}
function scripted(p: StyledPart): string {
  return scriptGlyphs(p) ?? p.text;
}
