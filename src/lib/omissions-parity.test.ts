// The scripts can't import the TypeScript, so scripts/lib/omissions.mjs hand-mirrors
// the matching half of ./omitted.ts (entryForms, globToRegExp, the rule predicate).
// Two copies drift silently — a rule the app hides that the validator/report miss, or
// the reverse. This pins the two together: it fails the moment either side changes a
// result the other doesn't, which is the whole reason the mirror is allowed to exist.

import { describe, expect, it } from "vitest";
import { entryForms, globToRegExp, isOmitted } from "./omitted";
import {
  entryForms as mjsEntryForms,
  globToRegExp as mjsGlobToRegExp,
  ruleMatcher as mjsRuleMatcher,
} from "../../scripts/lib/omissions.mjs";
import type { Omission, WordEntry } from "./types";

let n = 0;
const rule = (match: string | string[], except?: string[]): Omission => ({
  id: `r${n++}`,
  match,
  reason: "test",
  ...(except ? { except } : {}),
});

// Every entry shape the matcher can meet: plain string, named-forms with/without
// pref and others (the forms the mirror used to drop), and language maps nesting
// both — plus the `?` tag that is codes, not a name.
const entries: WordEntry[] = [
  "Plainname",
  { short: "Sh", long: "Long name" },
  { pref: "Pref", short: "Sh", long: "Long name" },
  { short: "Sh", long: "Long name", others: "Alt" },
  { short: "Sh", long: "Long name", others: ["Alt1", "Alt2"] },
  { pref: "OnlyPref" },
  { en: "EnName", de: { short: "DeSh", long: "DeLong" }, "?": ["fr"] },
  { en: "EnName2", de: { pref: "DePref", others: ["DeAlt"] }, "?": ["es"] },
  { pref: "Kupon 3" },
  "Kupon x",
];

const globs = [
  "Long name", "Pref", "Alt2", "Alt*", "S?", "Kupon [0-9]",
  "X-* [2-6]", "X-Sp.-Ang.", "R[0-9]-x", "[unclosed", "★*",
];

const rules = [
  rule("Long name"),
  rule("Pref"),
  rule("DeAlt"),
  rule("Alt2"),
  rule("Alt*"),
  rule("S?"),
  rule("Kupon [0-9]"),
  rule(["X", "Alt1"]),
  rule("*", ["Long name"]),
  rule("OnlyPref"),
  rule("DePref"),
];

const sorted = (a: string[]) => [...a].sort();

describe("omissions.mjs mirrors omitted.ts", () => {
  it("globToRegExp compiles identically", () => {
    for (const g of globs) {
      const ts = globToRegExp(g);
      const mjs = mjsGlobToRegExp(g);
      expect([mjs.source, mjs.flags], g).toEqual([ts.source, ts.flags]);
    }
  });

  it("entryForms extracts the same forms", () => {
    for (const e of entries) {
      expect(sorted(mjsEntryForms(e)), JSON.stringify(e)).toEqual(sorted(entryForms(e)));
    }
  });

  it("a rule classifies every entry the same way", () => {
    for (const r of rules) {
      const matches = mjsRuleMatcher(r);
      for (const e of entries) {
        expect(matches(e), `${JSON.stringify(r.match)} vs ${JSON.stringify(e)}`).toBe(isOmitted(e, [r]));
      }
    }
  });
});
