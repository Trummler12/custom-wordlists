// Names that hold the Output's own separator — "Moroni, Comoros" in a comma-joined
// list, which skribbl.io would split into two words. Pure; the choices live in
// state/settings, the rule that applies them is the reserved `SEPARATOR_RULE`
// (lib/omitted).

/** How one list treats such names: which separator, whether the reader has it
 *  removed from names (the ⚙️ checkbox), and whether the list leaves them out. */
export interface SeparatorRules {
  sep: string;
  remove: boolean;
  omit: boolean;
}

/** Separators no name can contain, so the question never comes up. */
export const LINE_SEPARATORS: readonly string[] = ["\n", "\t"];

export function holdsSeparator(form: string, sep: string): boolean {
  return form.includes(sep);
}

/** The name without the separator: the character dropped, the spaces around it
 *  collapsed ("Moroni, Comoros" => "Moroni Comoros", "10,000,000" => "10000000"). */
export function stripSeparator(form: string, sep: string): string {
  return form.split(sep).join("").replace(/\s+/g, " ").trim();
}

/** What a name becomes in the Output: itself, stripped, or nothing at all. */
export function fitSeparator(form: string, rules: SeparatorRules): string | null {
  if (!holdsSeparator(form, rules.sep)) return form;
  if (rules.omit) return null;
  if (!rules.remove) return form;
  const stripped = stripSeparator(form, rules.sep);
  return stripped || null;
}
