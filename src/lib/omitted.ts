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

/** The icon whose rules form an INCLUDE control rather than a plain exclusion: overlapping,
 *  default-off, union — an entry is shown as soon as ANY of the rules covering it is ticked
 *  on (a language can be dead *and* historical, so ticking either brings it in). An entry no
 *  such rule covers is the base, shown until the base box (below) is switched off. Only the
 *  languages type panel uses it; coverage and sovereignty stay plain disjoint controls, so
 *  nothing else changes. */
export const INCLUDE_ICON = "language-type";

/** The reserved id of an INCLUDE control's base checkbox — the entries no rule covers
 *  ("living modern" for languages). Not declared in any file, toggled like a rule, but
 *  default-OFF (the base shows until switched off), the mirror of the reserved rules above. */
export const BASE_RULE = "~base";

/** The reserved id that extends a capped fame ruler. A group with `extendFrom` keeps only
 *  its top tiers by default — the languages list bottoms out at ≥ 1M speakers — and this
 *  toggle unbounds it to the whole list. Default-ON (i.e. capped) like the reserved rules,
 *  so an untouched list stays capped; toggling it in the reader's choice lifts the cap. */
export const EXTEND_RULE = "~extend";

/** The INCLUDE-control rules a group carries (see `INCLUDE_ICON`), or none. */
export function includeRules(g: Group): Omission[] {
  return allRules(g).filter((r) => r.icon === INCLUDE_ICON);
}

// Memoized per entry object: an entry lives as long as the topic file it came
// from, so a WeakMap keyed on it holds for the page — and the same entry is
// re-matched on every omission toggle, so recomputing its forms each time was a
// large share of the filtering cost. Callers only read the array (never mutate
// it), so sharing one is safe. Strings are their own only form; nothing to cache.
const formsCache = new WeakMap<object, string[]>();

/** Every string an entry carries, across all its forms and languages. A rule
 *  matches an entry when any of these does: the junk is localized
 *  (`Data Card 01` / `Datenkarte01`), so a pattern written in one language would
 *  otherwise never see the other. */
export function entryForms(e: WordEntry): string[] {
  if (typeof e === "string") return [e];
  const cached = formsCache.get(e as object);
  if (cached) return cached;
  const obj = e as Record<string, unknown>;
  // A name pair localizes per field; anything else is a language map whose values
  // are themselves entries. Both bottom out in strings. `?` is not one of them: it
  // holds language codes, and a glob is here to match names, not tags.
  const others = Array.isArray(obj.others) ? obj.others : obj.others !== undefined ? [obj.others] : [];
  const parts =
    "pref" in obj || "short" in obj || "long" in obj
      ? [obj.pref, obj.short, obj.long, ...others]
      : Object.entries(obj).filter(([k]) => k !== UNKNOWN).map(([, v]) => v);
  const res = parts.filter((p) => p !== undefined).flatMap((p) => entryForms(p as WordEntry));
  formsCache.set(e as object, res);
  return res;
}

/** A pattern is a glob only if it carries one of glob's metacharacters; every other
 *  string `globToRegExp` escapes whole, so it matches exactly itself — which a set
 *  membership test answers far more cheaply than an anchored regex. */
const isGlobPattern = (s: string): boolean => /[*?[]/.test(s);

/** A rule's `match` split for matching: the literal names as a set (the vast
 *  majority — thousands of language names, no metacharacters) and the real globs
 *  compiled to regexes. Compiled once per rule object; the rules live as long as
 *  the topic file they came from, so a WeakMap keyed on the rule is enough. */
type CompiledRule = { literals: Set<string>; globs: RegExp[] };
const compiled = new WeakMap<Omission, CompiledRule>();

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

function compiledOf(rule: Omission): CompiledRule {
  let res = compiled.get(rule);
  if (!res) {
    const arr = Array.isArray(rule.match) ? rule.match : [rule.match];
    res = { literals: new Set(arr.filter((s) => !isGlobPattern(s))), globs: arr.filter(isGlobPattern).map(globToRegExp) };
    compiled.set(rule, res);
  }
  return res;
}

/** Whether any of an entry's forms matches this rule. The literal set answers most
 *  of it — a name is in the list or it isn't — and only the rare glob falls through
 *  to a regex scan. Equivalent to the old all-regex test: `globToRegExp` anchors and
 *  escapes a literal, so matching it is exactly a set membership on the form. */
export function ruleMatches(rule: Omission, forms: string[]): boolean {
  const { literals, globs } = compiledOf(rule);
  if (literals.size > 0 && forms.some((f) => literals.has(f))) return true;
  return globs.length > 0 && globs.some((re) => forms.some((f) => re.test(f)));
}

/** The first rule that covers this entry, or undefined when none does. */
export function findOmission(e: WordEntry, rules: Omission[]): Omission | undefined {
  const forms = entryForms(e);
  return rules.find(
    (rule) => !rule.except?.some((x) => forms.includes(x)) && ruleMatches(rule, forms),
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
  // A capped ruler (extendFrom) also gives this group something to do, even with no rule
  // and no gap — so it can't take the cheap "nothing applies" exit.
  const capped = g.extendFrom != null && !!g.tiers && !toggled.includes(EXTEND_RULE);
  if (!declared && unknown === 0 && !capped) {
    byKey.set(key, g);
    return g;
  }

  const active = activeRules(g, toggled);
  // The INCLUDE control (the languages type panel) filters by UNION, not the standard
  // "hidden if any active rule matches": its rules overlap, so an entry is shown as soon
  // as ONE of the rules covering it is ticked on. It is handled apart from the plain rules
  // — an entry no include rule covers is the base, shown until its box is switched off.
  const incl = includeRules(g);
  const rules = incl.length ? active.filter((r) => r.icon !== INCLUDE_ICON) : active;
  const baseOff = incl.length > 0 && toggled.includes(BASE_RULE);
  const included = (e: WordEntry): boolean => {
    if (incl.length === 0) return true;
    const forms = entryForms(e);
    const matched = incl.filter((r) => ruleMatches(r, forms));
    return matched.length ? matched.some((r) => toggled.includes(r.id)) : !baseOff;
  };
  // Over the entries as written (before `keep` prunes them), so an on-by-default
  // rule still reports how many it hides and which — the count and the tooltip.
  const summary = declared ? omissionSummary(g, lang) : undefined;
  // Ticked by default, like a declared `omitted` rule: a reader who wants the
  // English placeholders back says so, and the id in `toggled` is that answer.
  const hideUnknown = unknown > 0 && !toggled.includes(UNKNOWN_RULE);
  const keep = (list: WordEntry[]) =>
    list.filter((e) => included(e) && !isOmitted(e, rules) && !(hideUnknown && isUnknownIn(e, lang)));
  // One `as` per rule that is actually in force; a rule the reader switched back
  // on brings its own entries, and needs no stand-in.
  const standIns = rules.map((r) => r.as).filter((a): a is WordEntry => a !== undefined);

  const base: Group = g.tiers
    ? { ...g, tiers: appendToLast(g.tiers.map(keep), standIns) }
    : { ...g, words: [...keep(g.words ?? []), ...standIns] };
  // A capped ruler drops the tiers past `extendFrom` — the less-famous tail the reader
  // has not asked for — so the ruler, the counts and the output all bottom out there,
  // the ruler tooltip reading "1 million or more" rather than "more than 0". Tiers only.
  const cap = <T>(a: T[] | undefined) => (capped ? a?.slice(0, g.extendFrom) : a);
  const view: Group = {
    ...base,
    ...(capped && base.tiers ? { tiers: cap(base.tiers)! } : {}),
    unknownByTier: cap(byTier)!,
    ...(base.tierConditions ? { tierConditions: cap(base.tierConditions)! } : {}),
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
