// Matching entries against a list's omission rules — what a curated list leaves
// out, and why. Pure: the rules come from the topic file, the answers go to the
// validator (which fails when an omitted entry is present) and to the panel that
// tells a reader what was left out.

import type { Group, Omission, WordEntry } from "./types";
import { displayName, isUnknownIn, UNKNOWN } from "./words";

/** How many matched names a rule's summary keeps for its hover — enough to fill the
 *  panel's five-line excerpt (see RULE_TITLE_* in OmittedPanel), capped so a large
 *  family doesn't stash hundreds. */
const SAMPLE_CAP = 50;

/** The reserved rule id for the entries no name is known for in a language. Not a
 *  rule in the file — it comes from the entries themselves — but a reader toggles
 *  it exactly like one, so it shares the panel and the stored choice. The
 *  validator rejects a declared rule that claims this id. */
export const UNKNOWN_RULE = UNKNOWN;

/** The reserved rule id for names longer than the target game accepts.
 *
 *  Reserved the same way, and toggled the same way, but it differs from every
 *  other rule in two respects. It drops a *form* rather than an entry, so it
 *  cannot be applied here — see `overlongForms` in lib/words. And it is a fact
 *  about where the list is going rather than about where it came from, which is
 *  why no topic file declares it: skribbl's limit is not the Pokédex's business.
 *
 *  Not `locked`, for the same reason it isn't declared. A list built for
 *  something other than skribbl may want the long names, and refusing them would
 *  be the app deciding what the reader's list is for. */
export const TOO_LONG_RULE = ">";

/** Every string an entry carries, across all its forms and languages. A rule
 *  matches an entry when any of these does: the junk is localized
 *  (`Data Card 01` / `Datenkarte01`), so a pattern written in one language would
 *  otherwise never see the other. */
export function entryForms(e: WordEntry): string[] {
  if (typeof e === "string") return [e];
  const obj = e as Record<string, unknown>;
  // A name pair localizes per field; anything else is a language map whose values
  // are themselves entries. Both bottom out in strings. `?` is not one of them: it
  // holds language codes, and a glob is here to match names, not tags.
  const others = Array.isArray(obj.others) ? obj.others : obj.others !== undefined ? [obj.others] : [];
  const parts =
    "pref" in obj || "short" in obj || "long" in obj
      ? [obj.pref, obj.short, obj.long, ...others]
      : Object.entries(obj).filter(([k]) => k !== UNKNOWN).map(([, v]) => v);
  return parts.filter((p) => p !== undefined).flatMap((p) => entryForms(p as WordEntry));
}

// Compiled once per rule object; the rules live as long as the topic file they
// came from, so a WeakMap keyed on the rule is enough.
const compiled = new WeakMap<Omission, RegExp[]>();

/** A glob as a whole-name pattern: `*` any run, `?` one character, `[0-9]` a
 *  class. Globs rather than regexes because these are written by hand in JSON,
 *  where a regex would need doubled backslashes and anchors in every rule. */
export function globToRegExp(glob: string): RegExp {
  let out = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      out += ".*";
    } else if (c === "?") {
      out += ".";
    } else if (c === "[") {
      const end = glob.indexOf("]", i + 1);
      // An unclosed bracket is a literal one, not a syntax error: a rule is data,
      // and a pattern that can't compile would take the whole file down.
      if (end === -1) out += "\\[";
      else {
        out += glob.slice(i, end + 1);
        i = end;
      }
    } else {
      out += c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${out}$`, "u");
}

function patternsOf(rule: Omission): RegExp[] {
  let res = compiled.get(rule);
  if (!res) {
    res = (Array.isArray(rule.match) ? rule.match : [rule.match]).map(globToRegExp);
    compiled.set(rule, res);
  }
  return res;
}

/** The first rule that covers this entry, or undefined when none does. */
export function findOmission(e: WordEntry, rules: Omission[]): Omission | undefined {
  const forms = entryForms(e);
  return rules.find(
    (rule) =>
      !rule.except?.some((x) => forms.includes(x)) &&
      forms.some((f) => patternsOf(rule).some((re) => re.test(f))),
  );
}

/** Whether any rule covers this entry. */
export function isOmitted(e: WordEntry, rules: Omission[]): boolean {
  return findOmission(e, rules) !== undefined;
}

/** Every rule a list declares, in the order the panel lists them: the ones that
 *  filter by default, then the ones it merely offers. */
export function allRules(g: Group): Omission[] {
  return [...(g.omitted ?? []), ...(g.omittable ?? [])];
}

/** Whether a rule filters by default — which array it was declared in. */
export function isOnByDefault(g: Group, rule: Omission): boolean {
  return (g.omitted ?? []).includes(rule);
}

/** The rules in force. `toggled` holds the ids that deviate from their default,
 *  so one set covers both directions: an `omitted` rule drops out when toggled, an
 *  `omittable` one joins. A locked rule stays on regardless — the panel disables
 *  its checkbox, and a stored choice from before it was locked must not outlive
 *  that. */
export function activeRules(g: Group, toggled: readonly string[]): Omission[] {
  const flipped = new Set(toggled);
  return [
    ...(g.omitted ?? []).filter((r) => r.locked || !flipped.has(r.id)),
    ...(g.omittable ?? []).filter((r) => flipped.has(r.id)),
  ];
}

// Keyed on the group, then on which optional rules are on and which language is
// showing — all stable for long stretches, so a group is filtered once rather than
// once per render.
const views = new WeakMap<Group, Map<string, Group>>();

/** The group as the list shows it: omitted entries gone, each rule's `as` standing
 *  in its place, and — in any language but English — the entries the list has no
 *  name for in it. Filtering per tier rather than over a flattened list keeps the
 *  fame ruler's depths meaning what they meant.
 *
 *  Returns the group itself when nothing applies, so it costs nothing and keeps
 *  its identity for the caches downstream. */
export function visibleGroup(
  g: Group,
  toggled: readonly string[] = [],
  lang = "en",
): Group {
  // Before anything else: counting the unknowns walks every entry, so a cache hit
  // has to be answered without it. The group filed under its own key is the
  // "nothing applies" answer — it carries no `unknownByTier` because there is none.
  const key = `${lang}|${[...toggled].sort().join(",")}`;
  let byKey = views.get(g);
  if (!byKey) views.set(g, (byKey = new Map()));
  const hit = byKey.get(key);
  if (hit) return hit;

  const declared = !!g.omitted?.length || !!g.omittable?.length;
  const byTier = unknownByTier(g, lang);
  const unknown = byTier.reduce((a, b) => a + b, 0);
  if (!declared && unknown === 0) {
    byKey.set(key, g);
    return g;
  }

  const rules = activeRules(g, toggled);
  // Over the entries as written (before `keep` prunes them), so an on-by-default
  // rule still reports how many it hides and which — the count and the tooltip.
  const summary = declared ? omissionSummary(g, lang) : undefined;
  // Ticked by default, like a declared `omitted` rule: a reader who wants the
  // English placeholders back says so, and the id in `toggled` is that answer.
  const hideUnknown = unknown > 0 && !toggled.includes(UNKNOWN_RULE);
  const keep = (list: WordEntry[]) =>
    list.filter((e) => !isOmitted(e, rules) && !(hideUnknown && isUnknownIn(e, lang)));
  // One `as` per rule that is actually in force; a rule the reader switched back
  // on brings its own entries, and needs no stand-in.
  const standIns = rules.map((r) => r.as).filter((a): a is WordEntry => a !== undefined);

  const base: Group = g.tiers
    ? { ...g, tiers: appendToLast(g.tiers.map(keep), standIns) }
    : { ...g, words: [...keep(g.words ?? []), ...standIns] };
  const view: Group = {
    ...base,
    unknownByTier: byTier,
    ...(summary ? { omissionSummary: summary } : {}),
  };
  byKey.set(key, view);
  return view;
}

/** How many entries have no name in `lang`, one number per tier.
 *
 *  Counted over the list as written, independent of every other rule: whether an
 *  entry is also caught by, say, the breakaway-states rule is a different question,
 *  and tying the two made this row's visibility flicker with the others' checkboxes.
 *  Counting and hiding are separate concerns — the count is what unhiding could at
 *  most bring back ("up to N"), the hiding is applied elsewhere.
 *
 *  Per tier rather than as a total, because the reader's ruler decides how much
 *  of the list they are actually taking, and a count over tiers they left behind
 *  reports a gap they don't have. Splitting it here is what lets the panel scope
 *  it: this function cannot ask for the depth — `visibleGroup` runs inside
 *  `topics`, and `selection`, which holds the depth, is downstream of it.
 *
 *  A flat group is one tier holding everything, which `depthOf` addresses with
 *  its 0-or-1, so the caller needs no special case either. */
export function unknownByTier(g: Group, lang: string): number[] {
  const lists = g.tiers ?? [g.words ?? []];
  if (lang === "en") return lists.map(() => 0);
  return lists.map((list) => list.filter((e) => isUnknownIn(e, lang)).length);
}

/** The same over the whole list — what filtering asks, since an entry is hidden
 *  or not regardless of which tier it sits in. */
export function unknownCount(g: Group, lang: string): number {
  return unknownByTier(g, lang).reduce((a, b) => a + b, 0);
}

/** Per declared rule id, how many entries it matches and a sample of their names —
 *  over the entries as written, before any are filtered, so an on-by-default rule
 *  can still report what it hides. Each entry counts once, under the first rule
 *  that covers it. Feeds a rule's "up to N" label and its hover. */
export function omissionSummary(
  g: Group,
  lang: string,
): Record<string, { count: number; names: string[] }> {
  const rules = allRules(g);
  const out: Record<string, { count: number; names: string[] }> = {};
  for (const r of rules) out[r.id] = { count: 0, names: [] };
  const entries = g.tiers ? g.tiers.flat() : g.words ?? [];
  for (const e of entries) {
    const rule = findOmission(e, rules);
    if (!rule) continue;
    const s = out[rule.id];
    s.count++;
    if (s.names.length < SAMPLE_CAP) s.names.push(displayName(e, lang).short);
  }
  return out;
}

/** Stand-ins join the least famous tier: they represent a family that was pruned
 *  for being obscure, so promoting them above it would misreport them. */
function appendToLast(tiers: WordEntry[][], extra: WordEntry[]): WordEntry[][] {
  if (extra.length === 0) return tiers;
  const out = tiers.map((t) => [...t]);
  if (out.length === 0) return [extra];
  out[out.length - 1].push(...extra);
  return out;
}
