// Matching entries against a list's omission rules, for the scripts.
//
// This mirrors src/lib/omitted.ts, which is the tested copy — a .mjs script can't
// import TypeScript, the same reason LANG_RE is duplicated against the schema.
// Keeping ONE copy on this side at least means the validator, the manifest
// builder and the report can't drift apart from each other.

/** Every string an entry carries, across its forms and languages. */
export function entryForms(word) {
  if (typeof word === "string") return [word];
  const parts = "short" in word && "long" in word ? [word.short, word.long] : Object.values(word);
  return parts.flatMap(entryForms);
}

/** A whole-name glob as a RegExp: `*` any run, `?` one character, `[0-9]` a class. */
export function globToRegExp(glob) {
  let out = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") out += ".*";
    else if (c === "?") out += ".";
    else if (c === "[") {
      const end = glob.indexOf("]", i + 1);
      if (end === -1) out += "\\[";
      else {
        out += glob.slice(i, end + 1);
        i = end;
      }
    } else out += c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${out}$`, "u");
}

/** A predicate for one rule: matches an entry when any of its language forms
 *  matches any of the rule's globs, unless the name is listed in `except`. */
export function ruleMatcher(rule) {
  const patterns = [rule.match].flat().map(globToRegExp);
  const except = rule.except ?? [];
  return (entry) => {
    const forms = entryForms(entry);
    return !except.some((x) => forms.includes(x)) && forms.some((f) => patterns.some((p) => p.test(f)));
  };
}

/** Every rule a group declares, with which array it came from. */
export function rulesOf(group) {
  return [
    ...(group.omitted ?? []).map((rule) => ({ rule, kind: "omitted" })),
    ...(group.omittable ?? []).map((rule) => ({ rule, kind: "omittable" })),
  ];
}

/** All of a group's entries, tiers flattened. */
export function groupEntries(group) {
  return [...(group.words ?? []), ...(group.tiers ?? []).flat()];
}
