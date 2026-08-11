// Matching entries against a list's omission rules — what a curated list leaves
// out, and why. Pure: the rules come from the topic file, the answers go to the
// validator (which fails when an omitted entry is present) and to the panel that
// tells a reader what was left out.

import type { Group, Omission, WordEntry } from "./types";

/** Every string an entry carries, across all its forms and languages. A rule
 *  matches an entry when any of these does: the junk is localized
 *  (`Data Card 01` / `Datenkarte01`), so a pattern written in one language would
 *  otherwise never see the other. */
export function entryForms(e: WordEntry): string[] {
  if (typeof e === "string") return [e];
  const obj = e as Record<string, unknown>;
  // A name pair localizes per field; anything else is a language map whose values
  // are themselves entries. Both bottom out in strings.
  const parts = "short" in obj && "long" in obj ? [obj.short, obj.long] : Object.values(obj);
  return parts.flatMap((p) => entryForms(p as WordEntry));
}

// Compiled once per rule object; the rules live as long as the topic file they
// came from, so a WeakMap keyed on the rule is enough.
const compiled = new WeakMap<Omission, RegExp>();

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

function patternOf(rule: Omission): RegExp {
  let re = compiled.get(rule);
  if (!re) {
    re = globToRegExp(rule.match);
    compiled.set(rule, re);
  }
  return re;
}

/** The first rule that covers this entry, or undefined when none does. */
export function findOmission(e: WordEntry, rules: Omission[]): Omission | undefined {
  const forms = entryForms(e);
  return rules.find((rule) => forms.some((f) => patternOf(rule).test(f)));
}

/** Whether any rule covers this entry. */
export function isOmitted(e: WordEntry, rules: Omission[]): boolean {
  return findOmission(e, rules) !== undefined;
}

/** The rules in force: everything except the optional ones the reader switched on. */
export function activeRules(g: Group, included: readonly string[]): Omission[] {
  const on = new Set(included);
  return (g.omitted ?? []).filter((r) => !(r.optional && on.has(r.optional.id)));
}

// Keyed on the group, then on which optional rules are on — both stable for long
// stretches, so a group is filtered once rather than once per render.
const views = new WeakMap<Group, Map<string, Group>>();

/** The group as the list shows it: omitted entries gone, each rule's `as` standing
 *  in its place. Filtering per tier rather than over a flattened list keeps the
 *  fame ruler's depths meaning what they meant.
 *
 *  Returns the group itself when nothing is omitted, so every list that has no
 *  rules — which is all of them but one — costs nothing and keeps its identity for
 *  the caches downstream. */
export function visibleGroup(g: Group, included: readonly string[] = []): Group {
  if (!g.omitted?.length) return g;

  const key = [...included].sort().join(",");
  let byKey = views.get(g);
  if (!byKey) views.set(g, (byKey = new Map()));
  const hit = byKey.get(key);
  if (hit) return hit;

  const rules = activeRules(g, included);
  const keep = (list: WordEntry[]) => list.filter((e) => !isOmitted(e, rules));
  // One `as` per rule that is actually in force; a rule the reader switched back
  // on brings its own entries, and needs no stand-in.
  const standIns = rules.map((r) => r.as).filter((a): a is WordEntry => a !== undefined);

  const view: Group = g.tiers
    ? { ...g, tiers: appendToLast(g.tiers.map(keep), standIns) }
    : { ...g, words: [...keep(g.words ?? []), ...standIns] };
  byKey.set(key, view);
  return view;
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
